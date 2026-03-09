import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import {
    CreateTeamDto,
    InviteDto,
    JoinDto,
    RejectDto,
    AssignNameDto,
} from './dto/team.dto';

/**
 * Teams Service
 * ย้ายมาจาก: 9 route files ใน client/src/app/api/teams/
 *
 * 📌 ฟังก์ชันหลัก:
 * - findAll(userId)           → GET /teams
 * - create(userId, dto)       → POST /teams
 * - findMyTeam(userId)        → GET /teams/my-team
 * - invite(userId, dto)       → POST /teams/invite
 * - join(userId, dto)         → POST /teams/join
 * - leave(userId)             → POST /teams/leave
 * - reject(userId, dto)       → POST /teams/reject
 * - getPendingInvites(userId, role) → GET /teams/pending-invites
 * - assignName(dto)           → PATCH /teams/assign-name
 * - removeMember(teamId, memberUserId, userId) → DELETE /teams/:id/members/:memberId
 */
@Injectable()
export class TeamsService {
    private readonly logger = new Logger(TeamsService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    // =====================================================
    // GET /teams — ดึงทีมที่ user เป็นสมาชิก
    // ย้ายจาก: teams/route.ts → GET
    // =====================================================
    async findAll(userId: string) {
        return this.prisma.team.findMany({
            where: {
                Teammember: { some: { user_id: userId } },
            },
            include: {
                Section: true,
                Teammember: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true },
                        },
                    },
                },
            },
        });
    }

    // =====================================================
    // POST /teams — สร้างทีม (Student only)
    // ย้ายจาก: teams/route.ts → POST
    //
    // 📌 Flow:
    // 1. เช็คว่า user ลงทะเบียนใน section นี้แล้ว
    // 2. เช็คว่ายังไม่มีทีมใน section นี้
    // 3. สร้างทีม temp name
    // 4. เพิ่มตัวเองเป็นสมาชิก
    // =====================================================
    async create(userId: string, dto: CreateTeamDto) {
        // 1. เช็คว่า user ลงทะเบียนแล้ว
        const enrollment = await this.prisma.section_Enrollment.findFirst({
            where: { section_id: dto.sectionId, users_id: userId },
        });
        if (!enrollment) {
            throw new BadRequestException('คุณยังไม่ได้ลงทะเบียนในรายวิชานี้');
        }

        // 2. เช็คว่ามีทีมใน section นี้แล้วหรือยัง
        const exists = await this.prisma.teammember.findFirst({
            where: {
                user_id: userId,
                Team: { section_id: dto.sectionId },
            },
        });
        if (exists) {
            throw new BadRequestException('คุณมีทีมในรายวิชานี้แล้ว');
        }

        // 3. ดึง section + term info สำหรับ semester string
        const section = await this.prisma.section.findUnique({
            where: { section_id: dto.sectionId },
            include: { Term: true },
        });
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        // 4. สร้างทีม + เพิ่มสมาชิก
        const team = await this.prisma.team.create({
            data: {
                section_id: dto.sectionId,
                groupNumber: `TEMP-${Date.now()}`,
                semester:
                    section.Term?.semester && section.Term?.academicYear
                        ? `${section.Term.semester}/${section.Term.academicYear}`
                        : '1/2568',
            },
        });

        await this.prisma.teammember.create({
            data: { team_id: team.team_id, user_id: userId },
        });

        return team;
    }

    // =====================================================
    // GET /teams/my-team — ดึงทีมของ user
    // ย้ายจาก: teams/my-team/route.ts → GET
    // =====================================================
    async findMyTeam(userId: string) {
        const member = await this.prisma.teammember.findFirst({
            where: { user_id: userId },
            orderBy: { Team: { section_id: 'desc' } },
            include: {
                Team: {
                    include: {
                        Section: { include: { Term: true } },
                        Project: {
                            select: {
                                project_id: true,
                                projectname: true,
                                status: true,
                            },
                        },
                        Teammember: {
                            include: {
                                Users: {
                                    select: { users_id: true, firstname: true, lastname: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        return member;
    }

    // =====================================================
    // POST /teams/invite — เชิญสมาชิกเข้าทีม
    // ย้ายจาก: teams/invite/route.ts → POST
    //
    // 📌 ใช้ Notification เป็น invite mechanism
    // =====================================================
    async invite(userId: string, dto: InviteDto) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: dto.teamId },
            include: {
                Section: { select: { section_code: true } },
            },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // inviter ต้องอยู่ทีมนี้
        const isMember = await this.prisma.teammember.findFirst({
            where: { team_id: team.team_id, user_id: userId },
        });
        if (!isMember) {
            throw new ForbiddenException('คุณไม่ได้เป็นสมาชิกของทีมนี้');
        }

        // invitee ต้องยังไม่มีทีมใน section นี้
        const exists = await this.prisma.teammember.findFirst({
            where: {
                user_id: dto.inviteeUserId,
                Team: { section_id: team.section_id },
            },
        });
        if (exists) {
            throw new BadRequestException('ผู้ใช้มีทีมในรายวิชานี้แล้ว');
        }

        // ✅ ดึงชื่อผู้ชวนมาใส่ใน notification
        const inviter = await this.prisma.users.findUnique({
            where: { users_id: userId },
            select: { firstname: true, lastname: true },
        });
        const inviterName = inviter
            ? `${inviter.firstname} ${inviter.lastname}`
            : 'เพื่อนของคุณ';
        const sectionCode = team.Section?.section_code || '';

        // สร้าง notification = invite
        await this.notificationsService.create({
            userId: dto.inviteeUserId,
            actorUserId: userId,
            title: 'เชิญเข้าร่วมทีม',
            message: `${inviterName} เชิญคุณเข้าร่วมกลุ่มโครงงาน${sectionCode ? ` วิชา ${sectionCode}` : ''} กดเพื่อยืนยัน/ปฏิเสธ`,
            eventType: 'TEAM_INVITE',
            teamId: team.team_id,
            link: '/Teams',
        });

        return { message: 'Invitation sent' };
    }

    // =====================================================
    // POST /teams/join — ตอบรับคำเชิญ
    // ย้ายจาก: teams/join/route.ts → POST
    //
    // 📌 Flow: ดึง notification → เช็ค team → เช็ค duplicate → เช็ค locked/max → เพิ่มสมาชิก → mark read
    // =====================================================
    async join(userId: string, dto: JoinDto) {
        const notification = await this.prisma.notification.findUnique({
            where: { notification_id: dto.notificationId },
            include: {
                Team: {
                    include: {
                        Section: true,
                        Teammember: true,
                    },
                },
            },
        });

        if (!notification || notification.user_id !== userId) {
            throw new NotFoundException('Invitation not found');
        }

        // ✅ ตรวจสอบว่าเป็น TEAM_INVITE จริงก่อน join
        if (notification.event_type !== 'TEAM_INVITE') {
            throw new BadRequestException('Invalid invitation type');
        }

        if (!notification.Team) {
            throw new NotFoundException('Team not found');
        }

        // เช็คว่ายังไม่มีทีมใน section นี้
        const exists = await this.prisma.teammember.findFirst({
            where: {
                user_id: userId,
                Team: { section_id: notification.Team.section_id },
            },
        });
        if (exists) {
            throw new BadRequestException('คุณมีทีมในรายวิชานี้แล้ว');
        }

        // ✅ บัค #9 — เช็ค team_locked (Admin ล็อคการเปลี่ยนทีมแล้ว)
        if (notification.Team.Section?.team_locked) {
            throw new BadRequestException('ไม่สามารถเข้าร่วมทีมได้ เนื่องจากอาจารย์ล็อคการเปลี่ยนทีมแล้ว');
        }

        // ✅ บัค #9 — เช็ค max_team_size (ทีมเต็มแล้ว)
        const currentSize = notification.Team.Teammember.length;
        const maxSize = notification.Team.Section?.max_team_size ?? 999;
        if (currentSize >= maxSize) {
            throw new BadRequestException(`ทีมนี้มีสมาชิกเต็มแล้ว (${currentSize}/${maxSize} คน)`);
        }

        // เพิ่มสมาชิก + mark notification read
        await this.prisma.teammember.create({
            data: { team_id: notification.Team.team_id, user_id: userId },
        });

        await this.prisma.notification.update({
            where: { notification_id: notification.notification_id },
            data: { isRead: true },
        });

        return { message: 'Joined team successfully' };
    }

    // =====================================================
    // POST /teams/leave — ออกจากทีม
    // ย้ายจาก: teams/leave/route.ts → POST
    //
    // ⚠️ โค้ดเดิมไม่ใช้ $transaction! → แก้แล้ว
    // 📌 ถ้าเป็นสมาชิกคนสุดท้าย → ลบทีม + project + advisors
    // =====================================================
    async leave(userId: string) {
        const membership = await this.prisma.teammember.findFirst({
            where: { user_id: userId },
            include: {
                Team: {
                    include: {
                        Project: true,
                        Teammember: true,
                    },
                },
            },
        });

        if (!membership) {
            throw new NotFoundException('You are not in any team');
        }

        const team = membership.Team;

        // ห้ามออกหลัง approve
        if (team.Project && team.Project.status === 'APPROVED') {
            throw new ForbiddenException(
                'ไม่สามารถออกจากกลุ่มได้หลังจากโปรเจกต์ได้รับการอนุมัติแล้ว',
            );
        }

        // ✅ Helper: ลบทีมและทุกอย่างที่เกี่ยวข้องใน transaction
        const deleteTeamCascade = async (tx: Prisma.TransactionClient) => {
            if (team.Project) {
                const projectId = team.Project.project_id;
                await tx.taskAssignment.deleteMany({ where: { Task: { project_id: projectId } } });
                await tx.comment.deleteMany({ where: { Task: { project_id: projectId } } });
                await tx.attachment.deleteMany({ where: { Task: { project_id: projectId } } });
                await tx.task.deleteMany({ where: { project_id: projectId } });
                await tx.projectAdvisor.deleteMany({ where: { project_id: projectId } });
                await tx.grade.deleteMany({ where: { project_id: projectId } });
                await tx.project.delete({ where: { project_id: projectId } });
            }
            await tx.submission.deleteMany({ where: { team_id: team.team_id } });
            await tx.notification.deleteMany({ where: { team_id: team.team_id } });
            // ✅ disconnect implicit Users[] ก่อนลบ (ไม่งั้น FK fail)
            await tx.team.update({
                where: { team_id: team.team_id },
                data: { Users: { set: [] } },
            });
            await tx.teammember.deleteMany({ where: { team_id: team.team_id } });
            await tx.team.delete({ where: { team_id: team.team_id } });
        };

        if (team.Teammember.length === 1) {
            // ✅ สมาชิกคนสุดท้าย — ลบทีมทันที
            await this.prisma.$transaction((tx) => deleteTeamCascade(tx));
            return { message: 'ออกจากกลุ่มและลบกลุ่มสำเร็จ (คุณเป็นสมาชิกคนสุดท้าย)' };
        } else {
            // ลบตัวเองออกก่อน
            await this.prisma.teammember.delete({
                where: { teammember_id: membership.teammember_id },
            });

            // ✅ บัค — เช็คอีกรอบ ถ้าเหลือ 0 คน → ลบทีมด้วย (กรณี race หรือ data inconsistency)
            const remaining = await this.prisma.teammember.count({
                where: { team_id: team.team_id },
            });
            if (remaining === 0) {
                await this.prisma.$transaction((tx) => deleteTeamCascade(tx));
                return { message: 'ออกจากกลุ่มและลบกลุ่มสำเร็จ (ไม่มีสมาชิกเหลือ)' };
            }

            return { message: 'ออกจากกลุ่มสำเร็จ' };
        }
    }

    // =====================================================
    // POST /teams/reject — ปฏิเสธคำเชิญ
    // ย้ายจาก: teams/reject/route.ts → POST
    // =====================================================
    async reject(userId: string, dto: RejectDto) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                notification_id: dto.notificationId,
                user_id: userId,
                event_type: 'TEAM_INVITE',
                isRead: false,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        await this.prisma.notification.delete({
            where: { notification_id: dto.notificationId },
        });

        return { message: 'ปฏิเสธคำเชิญสำเร็จ' };
    }

    // =====================================================
    // GET /teams/pending-invites — ดูคำเชิญที่รอ
    // ย้ายจาก: teams/pending-invites/route.ts → GET
    //
    // 📌 Return [] สำหรับ non-STUDENT (ไม่ break UI)
    // =====================================================
    async getPendingInvites(userId: string, role: string) {
        if (role !== 'STUDENT') {
            return [];
        }

        return this.prisma.notification.findMany({
            where: {
                user_id: userId,
                event_type: 'TEAM_INVITE',
                isRead: false,
            },
            include: {
                Team: {
                    include: {
                        Section: { include: { Term: true } },
                        Teammember: {
                            include: {
                                Users: {
                                    select: { users_id: true, firstname: true, lastname: true },
                                },
                            },
                        },
                    },
                },
                Users_Notification_actor_user_idToUsers: {
                    select: { users_id: true, firstname: true, lastname: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // =====================================================
    // PATCH /teams/assign-name — Admin ตั้งชื่อทีม
    // ย้ายจาก: teams/assign-name/route.ts → PATCH
    // =====================================================
    async assignName(dto: AssignNameDto) {
        return this.prisma.team.update({
            where: { team_id: dto.teamId },
            data: { groupNumber: dto.teamname },
        });
    }

    // =====================================================
    // DELETE /teams/:id/members/:memberId — ลบสมาชิกจากทีม
    // ย้ายจาก: teams/[id]/members/[memberId]/route.ts → DELETE
    //
    // 📌 เช็ค: ต้องเป็นสมาชิก, project ยังไม่ approve, ต้องเหลือ > 1 คน
    // =====================================================
    async removeMember(
        teamId: number,
        memberUserId: string,
        currentUserId: string,
        currentUserRole: string,
    ) {
        // ✅ เฉพาะ Admin เท่านั้นที่ลบสมาชิกจากทีมได้
        if (currentUserRole !== 'ADMIN') {
            throw new ForbiddenException('Only Admin can remove team members');
        }

        // เช็คว่า user เป็นสมาชิก
        const membership = await this.prisma.teammember.findFirst({
            where: { team_id: teamId, user_id: currentUserId },
        });
        if (!membership && currentUserRole !== 'ADMIN') {
            throw new ForbiddenException('You are not a member of this team');
        }

        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            include: { Project: true, Teammember: true },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // ห้ามลบหลัง approve
        if (team.Project && team.Project.status === 'APPROVED') {
            throw new ForbiddenException(
                'ไม่สามารถลบสมาชิกได้หลังจากโปรเจกต์ได้รับการอนุมัติแล้ว',
            );
        }

        // ต้องเหลือ > 1 คน
        if (team.Teammember.length <= 1) {
            throw new BadRequestException(
                'ไม่สามารถลบสมาชิกได้ ต้องมีสมาชิกอย่างน้อย 1 คน',
            );
        }

        const memberToRemove = await this.prisma.teammember.findFirst({
            where: { team_id: teamId, user_id: memberUserId },
        });
        if (!memberToRemove) {
            throw new NotFoundException('Member not found in team');
        }

        await this.prisma.teammember.delete({
            where: { teammember_id: memberToRemove.teammember_id },
        });

        return { message: 'ลบสมาชิกออกจากทีมสำเร็จ' };
    }
}
