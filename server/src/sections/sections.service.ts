import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateSectionDto,
    UpdateSectionDto,
    EnrollDto,
    ContinueToProjectDto,
} from './dto/section.dto';
import { Prisma } from '@prisma/client';

/**
 * Sections Service
 * ย้ายมาจาก: 10 route files ใน client/src/app/api/sections/
 * 
 * 📌 ฟังก์ชันหลัก:
 * - findAll()              → GET /sections
 * - findOne(id)            → GET /sections/:id
 * - create(dto)            → POST /sections
 * - update(id, dto)        → PATCH /sections/:id
 * - remove(id)             → DELETE /sections/:id
 * - findMySection(userId)  → GET /sections/my-section
 * - enroll(id, dto)        → POST /sections/:id/enroll
 * - findEnrollments(id)    → GET /sections/:id/enrollments
 * - findTeams(id)          → GET /sections/:id/teams
 * - findCandidates(id)     → GET /sections/:id/candidates
 * - findAvailableStudents(id, userId) → GET /sections/:id/available-students
 * - continueToProject(id, dto) → POST /sections/:id/continue-to-project
 */
@Injectable()
export class SectionsService {
    private readonly logger = new Logger(SectionsService.name);

    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /sections — ดึงรายการ section ทั้งหมด
    // ย้ายจาก: sections/route.ts → GET
    // =====================================================
    async findAll() {
        return this.prisma.section.findMany({
            include: {
                Term: true,
                _count: { select: { Team: true } },
            },
            orderBy: { section_id: 'asc' },
        });
    }

    // =====================================================
    // GET /sections/:id — ดึง section เดียว
    // ย้ายจาก: sections/[id]/route.ts → GET
    // =====================================================
    async findOne(id: number) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: id },
            include: { Term: true },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        return section;
    }

    // =====================================================
    // POST /sections — สร้าง section ใหม่
    // ย้ายจาก: sections/create/route.ts → POST
    //
    // ⚠️ โค้ดเดิมมี 2 จุดสร้าง section:
    // 1. sections/route.ts → POST (แบบง่าย)
    // 2. sections/create/route.ts → POST (แบบมี validation)
    // ✅ ใหม่: รวมเป็นที่เดียว + ใช้ DTO validation
    // =====================================================
    async create(dto: CreateSectionDto) {
        // min ต้อง <= max
        if (dto.min_team_size > dto.max_team_size) {
            throw new BadRequestException(
                'min_team_size ต้องน้อยกว่าหรือเท่ากับ max_team_size',
            );
        }

        // ตรวจว่า term มีอยู่จริง
        const term = await this.prisma.term.findUnique({
            where: { term_id: dto.term_id },
        });
        if (!term) {
            throw new NotFoundException('Term not found');
        }

        try {
            const newSection = await this.prisma.section.create({
                data: {
                    section_code: dto.section_code,
                    course_type: dto.course_type as any,
                    study_type: dto.study_type as any,
                    min_team_size: dto.min_team_size,
                    max_team_size: dto.max_team_size,

                    team_locked: dto.team_locked ?? false,
                    term_id: dto.term_id,
                },
            });

            return newSection;
        } catch (err: unknown) {
            // P2002 = Unique constraint violation
            // (section_code + term_id ต้องไม่ซ้ำ)
            if (err instanceof Error && 'code' in err && (err as Record<string, unknown>).code === 'P2002') {
                throw new ConflictException(
                    'รหัส Section นี้มีอยู่แล้วในเทอมนี้',
                );
            }
            throw err;
        }
    }

    // =====================================================
    // PATCH /sections/:id — อัพเดท section settings
    // ย้ายจาก: sections/[id]/route.ts → PATCH
    // =====================================================
    async update(id: number, dto: UpdateSectionDto) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: id },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const updateData: Prisma.SectionUpdateInput = {};
        if (dto.team_locked !== undefined) updateData.team_locked = dto.team_locked;

        if (dto.min_team_size !== undefined) updateData.min_team_size = dto.min_team_size;
        if (dto.max_team_size !== undefined) updateData.max_team_size = dto.max_team_size;

        const updatedSection = await this.prisma.section.update({
            where: { section_id: id },
            data: updateData,
            include: { Term: true },
        });

        return {
            message: 'อัปเดต Section เรียบร้อย',
            section: updatedSection,
        };
    }

    // =====================================================
    // DELETE /sections/:id — ลบ section
    // ย้ายจาก: sections/[id]/route.ts → DELETE
    //
    // ⚠️ Safety check: ไม่ให้ลบถ้ามีทีมอยู่
    // ⚠️ ลบ enrollments ก่อน (cascade manual)
    // =====================================================
    async remove(id: number) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: id },
            include: {
                Team: true,
                Section_Enrollment: true,
            },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        // Safety: ห้ามลบถ้ามีทีม
        if (section.Team.length > 0) {
            throw new BadRequestException(
                `ไม่สามารถลบได้ มี ${section.Team.length} ทีมใน Section นี้`,
            );
        }

        // ลบ enrollments ก่อน (FK constraint)
        if (section.Section_Enrollment.length > 0) {
            await this.prisma.section_Enrollment.deleteMany({
                where: { section_id: id },
            });
        }

        await this.prisma.section.delete({
            where: { section_id: id },
        });

        return {
            message: 'ลบ Section เรียบร้อย',
            deleted_section_id: id,
        };
    }

    // =====================================================
    // GET /sections/my-section — ดึง section ที่นักศึกษาลงทะเบียน
    // ย้ายจาก: sections/my-section/route.ts → GET
    //
    // 📌 หา enrollment ล่าสุดของ user → return Section + Term
    // =====================================================
    async findMySection(userId: string) {
        const enrollment = await this.prisma.section_Enrollment.findFirst({
            where: { users_id: userId },
            include: {
                Section: {
                    include: { Term: true },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        });

        if (!enrollment) {
            throw new NotFoundException('ยังไม่ได้ลงทะเบียนรายวิชา');
        }

        return enrollment.Section;
    }

    // =====================================================
    // POST /sections/:id/enroll — ลงทะเบียนนักศึกษา (batch)
    // ย้ายจาก: sections/[id]/enroll/route.ts → POST
    //
    // 📌 รับ users_ids เป็น array → createMany ทีเดียว
    // skipDuplicates = ถ้ามีอยู่แล้วก็ข้ามไป
    // =====================================================
    async enroll(sectionId: number, dto: EnrollDto) {
        // ตรวจ section มีอยู่จริง
        const section = await this.prisma.section.findUnique({
            where: { section_id: sectionId },
        });
        if (!section) {
            throw new NotFoundException('Section not found');
        }

        await this.prisma.section_Enrollment.createMany({
            data: dto.users_ids.map((userId) => ({
                users_id: userId,
                section_id: sectionId,
            })),
            skipDuplicates: true,
        });

        return {
            message: 'Enroll completed',
            enrolledCount: dto.users_ids.length,
        };
    }

    // =====================================================
    // GET /sections/:id/enrollments — ดึงรายชื่อนักศึกษาใน section
    // ย้ายจาก: sections/[id]/enrollments/route.ts → GET
    // =====================================================
    async findEnrollments(sectionId: number) {
        return this.prisma.section_Enrollment.findMany({
            where: { section_id: sectionId },
            include: {
                Users: {
                    select: {
                        users_id: true,
                        firstname: true,
                        lastname: true,
                    },
                },
            },
            orderBy: { enrolledAt: 'asc' },
        });
    }

    // =====================================================
    // GET /sections/:id/teams — ดึงรายการทีมใน section (Admin)
    // ย้ายจาก: sections/[id]/teams/route.ts → GET
    //
    // 📌 Include: Teammember → Users + Project
    // 📌 Transform data ให้ frontend ใช้ง่าย
    // =====================================================
    async findTeams(sectionId: number) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: sectionId },
            include: {
                Term: true,
                Team: {
                    include: {
                        Teammember: {
                            include: {
                                Users: {
                                    select: {
                                        users_id: true,
                                        firstname: true,
                                        lastname: true,
                                    },
                                },
                            },
                        },
                        Project: {
                            select: {
                                project_id: true,
                                projectname: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: { groupNumber: 'asc' },
                },
            },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        // Transform data → ให้ frontend ใช้ง่าย
        const teams = section.Team.map((team) => ({
            team_id: team.team_id,
            name: team.name,
            groupNumber: team.groupNumber,
            status: team.status,
            memberCount: team.Teammember.length,
            members: team.Teammember.map((m) => ({
                user_id: m.user_id,
                firstname: m.Users.firstname,
                lastname: m.Users.lastname,
            })),
            project: team.Project
                ? {
                    project_id: team.Project.project_id,
                    projectname: team.Project.projectname,
                    status: team.Project.status,
                }
                : null,
        }));

        return {
            section_id: section.section_id,
            section_code: section.section_code,
            course_type: section.course_type,
            term: {
                term_id: section.Term.term_id,
                academicYear: section.Term.academicYear,
                semester: section.Term.semester,
            },
            teams,
        };
    }

    // =====================================================
    // GET /sections/:id/candidates — ดึงนักศึกษาที่ match กับ section code
    // ย้ายจาก: sections/[id]/candidates/route.ts → GET
    //
    // 📌 ใช้ Raw SQL เพราะต้อง SUBSTRING ตรง position
    // 📌 Logic: users_id position 3-4 = entryYear, 5 = studyDigit, 7-8 = programCode
    // =====================================================
    async findCandidates(sectionId: number) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: sectionId },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        // Parse section_code เช่น "66346" → entryYear=66, studyDigit=3, programCode=46
        const entryYear = section.section_code.substring(0, 2);
        const studyDigit = section.section_code.substring(2, 3);
        const programCode = section.section_code.substring(3, 5);

        const candidates = await this.prisma.$queryRaw<
            {
                users_id: string;
                firstname: string | null;
                lastname: string | null;
                email: string | null;
            }[]
        >`
      SELECT u.users_id, u.firstname, u.lastname, u.email
      FROM "Users" u
      WHERE
        u.role = 'STUDENT'
        AND SUBSTRING(u.users_id, 3, 2) = ${entryYear}
        AND SUBSTRING(u.users_id, 5, 1) = ${studyDigit}
        AND SUBSTRING(u.users_id, 7, 2) = ${programCode}
        AND NOT EXISTS (
          SELECT 1
          FROM "Section_Enrollment" se
          WHERE se.users_id = u.users_id
            AND se.section_id = ${sectionId}
        )
      ORDER BY u.users_id ASC
    `;

        return {
            section_id: section.section_id,
            section_code: section.section_code,
            matched_by: {
                entryYear,
                studyDigit,
                programCode,
                logic: 'users_id positions 3-4,5,7-8',
            },
            total: candidates.length,
            candidates,
        };
    }

    // =====================================================
    // GET /sections/:id/available-students
    // ดึงนักศึกษาที่ลงทะเบียนแล้ว แต่ยังไม่มีทีม
    // ย้ายจาก: sections/[id]/available-students/route.ts → GET
    //
    // ⚠️ โค้ดเดิมมี N+1 query problem!
    // เดิม: loop ทีละคน → query teammember
    // ✅ แก้: ดึง teammember ทั้งหมดมาก่อน → filter ใน memory
    // =====================================================
    async findAvailableStudents(sectionId: number, currentUserId: string) {
        // 1. ดึง enrollments ทั้งหมดใน section
        const enrollments = await this.prisma.section_Enrollment.findMany({
            where: { section_id: sectionId },
            include: {
                Users: {
                    select: {
                        users_id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                    },
                },
            },
        });

        // 2. ดึง user ที่มีทีมแล้วใน section นี้ (1 query แทน N queries!)
        const membersWithTeam = await this.prisma.teammember.findMany({
            where: {
                Team: { section_id: sectionId },
            },
            select: { user_id: true },
        });
        const usersWithTeam = new Set(membersWithTeam.map((m) => m.user_id));

        // 3. กรองเอาคนที่ยังไม่มีทีม (ไม่รวมตัวเอง)
        return enrollments
            .filter(
                (e) =>
                    e.users_id !== currentUserId && !usersWithTeam.has(e.users_id),
            )
            .map((e) => e.Users);
    }

    // =====================================================
    // POST /sections/:id/continue-to-project
    // ต่อวิชาจาก PRE_PROJECT → PROJECT (ย้ายทีมไปเทอมใหม่)
    // ย้ายจาก: sections/[id]/continue-to-project/route.ts → POST
    //
    // 📌 Complex multi-step operation:
    // 1. ดึง section เดิม (ต้องเป็น PRE_PROJECT)
    // 2. สร้าง section ใหม่ (course_type = PROJECT)
    // 3. กรอง teams ที่จะย้าย
    // 4. copy enrollments ของสมาชิก
    // 5. อัพเดท team.section_id
    //
    // ⚠️ ควรใช้ $transaction แต่โค้ดเดิมไม่ได้ใช้
    // =====================================================
    async continueToProject(sectionId: number, dto: ContinueToProjectDto) {
        // 1. ดึง Section เดิมและเทอมใหม่
        const [oldSection, newTerm] = await Promise.all([
            this.prisma.section.findUnique({
                where: { section_id: sectionId },
                include: {
                    Section_Enrollment: true,
                    Team: {
                        include: { Teammember: true },
                    },
                },
            }),
            this.prisma.term.findUnique({
                where: { term_id: dto.new_term_id },
            }),
        ]);

        if (!oldSection) {
            throw new NotFoundException('Section not found');
        }

        if (oldSection.course_type !== 'PRE_PROJECT') {
            throw new BadRequestException(
                'Only PRE_PROJECT can continue to PROJECT',
            );
        }

        if (!newTerm) {
            throw new NotFoundException('Term not found');
        }

        // 2. สร้าง Section ใหม่ (PROJECT)
        const newSection = await this.prisma.section.create({
            data: {
                section_code: oldSection.section_code,
                course_type: 'PROJECT',
                study_type: oldSection.study_type,
                term_id: dto.new_term_id,
                min_team_size: oldSection.min_team_size,
                max_team_size: oldSection.max_team_size,

                team_locked: oldSection.team_locked,
            },
        });

        // 3. กรอง Team ที่จะย้าย (ถ้าระบุ team_ids)
        const teamsToMove = dto.team_ids
            ? oldSection.Team.filter((t) => dto.team_ids!.includes(t.team_id))
            : oldSection.Team;

        if (teamsToMove.length === 0) {
            throw new BadRequestException(
                'ไม่มีทีมที่เลือกอยู่ใน Section นี้',
            );
        }

        // 4. รวบรวม user_id จากสมาชิก
        const memberUserIds = new Set<string>();
        for (const team of teamsToMove) {
            for (const member of team.Teammember) {
                memberUserIds.add(member.user_id);
            }
        }

        // 5. Copy enrollments
        const enrollmentData = oldSection.Section_Enrollment.filter((e) =>
            memberUserIds.has(e.users_id),
        ).map((e) => ({
            users_id: e.users_id,
            section_id: newSection.section_id,
        }));

        if (enrollmentData.length > 0) {
            await this.prisma.section_Enrollment.createMany({
                data: enrollmentData,
                skipDuplicates: true,
            });
        }

        // 6. อัพเดท Team → section_id + semester ใหม่
        for (const team of teamsToMove) {
            await this.prisma.team.update({
                where: { team_id: team.team_id },
                data: {
                    section_id: newSection.section_id,
                    semester: `${newTerm.semester}/${newTerm.academicYear}`,
                },
            });
        }

        return {
            message: 'ต่อวิชาเรียบร้อย',
            new_section_id: newSection.section_id,
            enrollments: enrollmentData.length,
            teams_moved: teamsToMove.length,
            teams_total: oldSection.Team.length,
        };
    }
}
