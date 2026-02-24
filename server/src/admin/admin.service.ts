import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTeamAdminDto, AddMemberDto } from './dto/admin.dto';

/**
 * Admin Service
 * ย้ายมาจาก: 5 route files ใน client/src/app/api/admin/teams/
 *
 * 📌 8 endpoints:
 * - findAllTeams(filters)             → GET /admin/teams
 * - deleteTeamFromBody(teamId)        → DELETE /admin/teams
 * - findOneTeam(id)                   → GET /admin/teams/:teamId
 * - updateTeam(id, dto)               → PUT /admin/teams/:teamId
 * - deleteTeam(id)                    → DELETE /admin/teams/:teamId
 * - getTeamMembers(teamId)            → GET /admin/teams/:teamId/members
 * - addTeamMember(teamId, dto)        → POST /admin/teams/:teamId/members
 * - removeTeamMember(teamId,memberId) → DELETE /admin/teams/:teamId/members/:memberId
 * - getAvailableMembers(teamId,q)     → GET /admin/teams/:teamId/available-members
 */
@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /admin/teams — ดึงทีมทั้งหมดพร้อม filter
    // =====================================================
    async findAllTeams(
        sectionId?: number,
        termId?: number,
        status?: string,
        search?: string,
    ) {
        const where: any = {};
        if (sectionId) where.section_id = sectionId;
        if (termId) where.Section = { term_id: termId };
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { groupNumber: { contains: search, mode: 'insensitive' } },
                { Project: { projectname: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const teams = await this.prisma.team.findMany({
            where,
            include: {
                Section: { include: { Term: true } },
                Teammember: {
                    include: {
                        Users: { select: { users_id: true, firstname: true, lastname: true, email: true } },
                    },
                },
                Project: {
                    select: { project_id: true, projectname: true, projectnameEng: true, status: true },
                },
            },
            orderBy: [{ Section: { section_code: 'asc' } }, { groupNumber: 'asc' }],
        });

        const transformed = teams.map((team) => ({
            team_id: team.team_id,
            name: team.name,
            groupNumber: team.groupNumber,
            status: team.status,
            semester: team.semester,
            memberCount: team.Teammember.length,
            members: team.Teammember.map((m) => ({
                user_id: m.user_id,
                firstname: m.Users.firstname,
                lastname: m.Users.lastname,
                email: m.Users.email,
            })),
            section: {
                section_id: team.Section.section_id,
                section_code: team.Section.section_code,
                course_type: team.Section.course_type,
                study_type: team.Section.study_type,
                team_locked: team.Section.team_locked,
                term: {
                    term_id: team.Section.Term.term_id,
                    academicYear: team.Section.Term.academicYear,
                    semester: team.Section.Term.semester,
                },
            },
            project: team.Project
                ? {
                    project_id: team.Project.project_id,
                    projectname: team.Project.projectname,
                    projectnameEng: team.Project.projectnameEng,
                    status: team.Project.status,
                }
                : null,
        }));

        return { teams: transformed, total: transformed.length };
    }

    // =====================================================
    // GET /admin/teams/:teamId — single team
    // =====================================================
    async findOneTeam(teamId: number) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            include: {
                Section: { include: { Term: true } },
                Teammember: {
                    include: {
                        Users: { select: { users_id: true, firstname: true, lastname: true, email: true } },
                    },
                },
                Project: {
                    select: { project_id: true, projectname: true, projectnameEng: true, status: true },
                },
            },
        });

        if (!team) throw new NotFoundException('Team not found');
        return team;
    }

    // =====================================================
    // PUT /admin/teams/:teamId — update team
    // =====================================================
    async updateTeam(teamId: number, dto: UpdateTeamAdminDto) {
        const team = await this.prisma.team.findUnique({ where: { team_id: teamId } });
        if (!team) throw new NotFoundException('Team not found');

        const updateData: any = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.groupNumber !== undefined) updateData.groupNumber = dto.groupNumber;
        if (dto.status !== undefined) updateData.status = dto.status;
        if (dto.semester !== undefined) updateData.semester = dto.semester;

        const updated = await this.prisma.team.update({
            where: { team_id: teamId },
            data: updateData,
        });

        return { message: 'อัปเดตทีมเรียบร้อย', team: updated };
    }

    // =====================================================
    // DELETE team (both /admin/teams body + /admin/teams/:teamId)
    // ⚠️ Full cascade: project → tasks → assignments/comments/etc
    // =====================================================
    async deleteTeam(teamId: number) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            include: { Project: true, Teammember: true },
        });
        if (!team) throw new NotFoundException('Team not found');

        await this.prisma.$transaction(async (tx) => {
            if (team.Project) {
                const projectId = team.Project.project_id;

                // Delete grades
                await tx.grade.deleteMany({ where: { project_id: projectId } });

                // Delete project notifications
                await tx.notification.deleteMany({ where: { project_id: projectId } });

                // Delete project advisors
                await tx.projectAdvisor.deleteMany({ where: { project_id: projectId } });

                // Delete task-related records
                const tasks = await tx.task.findMany({
                    where: { project_id: projectId },
                    select: { task_id: true },
                });
                const taskIds = tasks.map((t) => t.task_id);

                if (taskIds.length > 0) {
                    await tx.taskAssignment.deleteMany({ where: { task_id: { in: taskIds } } });
                    await tx.comment.deleteMany({ where: { task_id: { in: taskIds } } });
                    await tx.attachment.deleteMany({ where: { task_id: { in: taskIds } } });
                    await tx.notification.deleteMany({ where: { task_id: { in: taskIds } } });
                    await tx.task.deleteMany({ where: { project_id: projectId } });
                }

                // Delete the project
                await tx.project.delete({ where: { project_id: projectId } });
            }

            // Delete team members
            await tx.teammember.deleteMany({ where: { team_id: teamId } });

            // Delete the team
            await tx.team.delete({ where: { team_id: teamId } });
        });

        return { message: 'ลบทีมเรียบร้อย', deleted_team_id: teamId };
    }

    // =====================================================
    // GET /admin/teams/:teamId/members — members list
    // =====================================================
    async getTeamMembers(teamId: number) {
        return this.prisma.teammember.findMany({
            where: { team_id: teamId },
            include: {
                Users: { select: { users_id: true, firstname: true, lastname: true, email: true } },
            },
        });
    }

    // =====================================================
    // POST /admin/teams/:teamId/members — add member
    // Check: student, enrolled, not in another team
    // =====================================================
    async addTeamMember(teamId: number, dto: AddMemberDto) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            include: { Section: true },
        });
        if (!team) throw new NotFoundException('Team not found');

        const targetUser = await this.prisma.users.findUnique({
            where: { users_id: dto.user_id },
        });
        if (!targetUser) throw new NotFoundException('ไม่พบผู้ใช้ในระบบ');
        if (targetUser.role !== 'STUDENT') {
            throw new BadRequestException('สามารถเพิ่มได้เฉพาะนักศึกษาเท่านั้น');
        }

        // Already in this team?
        const existing = await this.prisma.teammember.findFirst({
            where: { team_id: teamId, user_id: dto.user_id },
        });
        if (existing) throw new BadRequestException('ผู้ใช้นี้เป็นสมาชิกในทีมอยู่แล้ว');

        // Enrolled in section?
        const enrollment = await this.prisma.section_Enrollment.findFirst({
            where: { users_id: dto.user_id, section_id: team.section_id },
        });
        if (!enrollment) {
            throw new BadRequestException('ผู้ใช้นี้ยังไม่ได้ลงทะเบียนใน Section นี้');
        }

        // Already in another team in same section?
        const existingOther = await this.prisma.teammember.findFirst({
            where: { user_id: dto.user_id, Team: { section_id: team.section_id } },
        });
        if (existingOther) {
            throw new BadRequestException('ผู้ใช้นี้อยู่ในทีมอื่นใน Section เดียวกันแล้ว');
        }

        const member = await this.prisma.teammember.create({
            data: { team_id: teamId, user_id: dto.user_id },
            include: {
                Users: { select: { users_id: true, firstname: true, lastname: true, email: true } },
            },
        });

        return { message: 'เพิ่มสมาชิกเรียบร้อย', member };
    }

    // =====================================================
    // DELETE /admin/teams/:teamId/members/:memberId
    // =====================================================
    async removeTeamMember(teamId: number, memberId: string) {
        const member = await this.prisma.teammember.findFirst({
            where: { team_id: teamId, user_id: memberId },
        });
        if (!member) throw new NotFoundException('Member not found in team');

        await this.prisma.teammember.delete({
            where: { teammember_id: member.teammember_id },
        });

        return { message: 'ลบสมาชิกเรียบร้อย', deleted_user_id: memberId };
    }

    // =====================================================
    // GET /admin/teams/:teamId/available-members?search=
    // Enrolled in section + not in any team in that section
    // =====================================================
    async getAvailableMembers(teamId: number, search?: string) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            select: { section_id: true },
        });
        if (!team) throw new NotFoundException('Team not found');

        const enrolledUsers = await this.prisma.section_Enrollment.findMany({
            where: {
                section_id: team.section_id,
                Users: {
                    role: 'STUDENT',
                    ...(search
                        ? {
                            OR: [
                                { firstname: { contains: search, mode: 'insensitive' } },
                                { lastname: { contains: search, mode: 'insensitive' } },
                                { users_id: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                            ],
                        }
                        : {}),
                },
            },
            include: {
                Users: { select: { users_id: true, firstname: true, lastname: true, email: true } },
            },
        });

        const usersWithTeam = await this.prisma.teammember.findMany({
            where: { Team: { section_id: team.section_id } },
            select: { user_id: true },
        });
        const usersInTeamIds = new Set(usersWithTeam.map((m) => m.user_id));

        return enrolledUsers
            .filter((e) => !usersInTeamIds.has(e.Users.users_id))
            .map((e) => e.Users);
    }
}
