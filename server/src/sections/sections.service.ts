import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
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

    constructor(
        private prisma: PrismaService,
        private eventsService: EventsService,
    ) { }

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

        // ✅ บัค #7 — validate min <= max โดยเทียบกับค่าปัจจุบันถ้าไม่ได้ส่งมา
        const effectiveMin = dto.min_team_size ?? section.min_team_size;
        const effectiveMax = dto.max_team_size ?? section.max_team_size;
        if (effectiveMin > effectiveMax) {
            throw new BadRequestException(
                `min_team_size (${effectiveMin}) ต้องน้อยกว่าหรือเท่ากับ max_team_size (${effectiveMax})`,
            );
        }

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

        // 1. ลบ enrollments ก่อน (FK constraint)
        if (section.Section_Enrollment.length > 0) {
            await this.prisma.section_Enrollment.deleteMany({
                where: { section_id: id },
            });
        }

        // 2. ลบ events ที่ผูกอยู่กับรายวิขานี้ออกก่อน (FK constraint)
        // เนื่องจากไม่มีทีม (Team.length === 0) จึงไม่มี Submissions ค้างแน่นอน สามารถลบ Event ได้เลย
        await this.prisma.event.deleteMany({
            where: { section_id: id },
        });

        // 3. ท้ายสุดลบตัว Section เอง
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
    // GET /sections/my-enrolled — sections ทั้งหมดที่ student เคย enroll
    // ใช้โดย useStudentEvents เพื่อ filter submissions ให้แสดงแค่ sections ของตัวเอง
    // =====================================================
    async findMyEnrolled(userId: string) {
        const enrollments = await this.prisma.section_Enrollment.findMany({
            where: { users_id: userId },
            select: {
                section_id: true,
                Section: {
                    select: {
                        section_id: true,
                        section_code: true,
                        course_type: true,
                    },
                },
            },
            orderBy: { enrolledAt: 'asc' },
        });

        return enrollments.map((e) => ({
            section_id: e.section_id,
            section_code: e.Section.section_code,
            course_type: e.Section.course_type,
        }));
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
        const data = await this.prisma.section_Enrollment.findMany({
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

        // map Users → user เพื่อให้ตรงกับ frontend interface
        return data.map((e) => ({
            enrollment_id: e.section_enroll_id,
            users_id: e.users_id,
            section_id: e.section_id,
            enrolledAt: e.enrolledAt,
            user: e.Users,
        }));
    }

    // =====================================================
    // GET /sections/:id/teams — ดึงรายการทีมใน section (Admin)
    // ใช้ resolveTeamsForSection เพื่อรองรับ legacy data
    // =====================================================
    async findTeams(sectionId: number) {
        const section = await this.prisma.section.findUnique({
            where: { section_id: sectionId },
            include: { Term: true },
        });

        if (!section) {
            throw new NotFoundException('Section not found');
        }

        const teams = await this.resolveTeamsForSection(sectionId);

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
    // resolveTeamsForSection — Single utility สำหรับดึงทีมใน section
    //
    // 📌 Primary path: query teams โดยตรงจาก section_id (ปกติ)
    // 📌 Fallback path: หาผ่าน Section_Enrollment → Teammember → Team
    //    ใช้สำหรับ legacy data ที่ถูก move ออกจาก PRE_PROJECT แล้ว
    //
    // ✅ เป็น utility เดียว — ไม่กระจาย fallback logic ใน service อื่น
    // =====================================================
    async resolveTeamsForSection(sectionId: number) {
        const includeOpts = {
            Teammember: {
                include: {
                    Users: { select: { users_id: true, firstname: true, lastname: true } },
                },
            },
            Project: { select: { project_id: true, projectname: true, status: true } },
        } as const;

        // Primary: ดึงตรงจาก section_id
        const directTeams = await this.prisma.team.findMany({
            where: { section_id: sectionId },
            include: includeOpts,
            orderBy: { groupNumber: 'asc' },
        });

        // infer type จาก Prisma result — ไม่ต้องเขียน type ซ้ำ
        type ResolvedTeam = (typeof directTeams)[number];

        const mapTeam = (team: ResolvedTeam) => ({
            team_id: team.team_id,
            groupNumber: team.groupNumber,
            memberCount: team.Teammember.length,
            members: team.Teammember.map((m) => ({
                users_id: m.user_id,
                firstname: m.Users.firstname,
                lastname: m.Users.lastname,
            })),
            project: team.Project
                ? { project_id: team.Project.project_id, projectname: team.Project.projectname, status: team.Project.status }
                : null,
        });

        if (directTeams.length > 0) {
            return directTeams.map(mapTeam);
        }

        // Fallback: Section ไม่มีทีมโดยตรง (legacy data — ทีมถูก move ออกไปแล้ว)
        // หาผ่าน Section_Enrollment → user_id → Teammember → Team
        this.logger.warn(`Section ${sectionId} has no direct teams, resolving via enrollment (legacy data)`);

        const enrollments = await this.prisma.section_Enrollment.findMany({
            where: { section_id: sectionId },
            select: { users_id: true },
        });

        if (enrollments.length === 0) return [];

        const userIds = enrollments.map((e) => e.users_id);

        // หา Teammember ของ user เหล่านี้ → ดึง Team + Project
        const memberships = await this.prisma.teammember.findMany({
            where: { user_id: { in: userIds } },
            include: { Team: { include: includeOpts } },
        });

        // Group by team_id (deduplicate)
        const teamMap = new Map<number, ResolvedTeam>();
        for (const m of memberships) {
            if (!teamMap.has(m.Team.team_id)) {
                // cast: shape identical, only differs in the query's where clause
                teamMap.set(m.Team.team_id, m.Team as unknown as ResolvedTeam);
            }
        }

        return Array.from(teamMap.values())
            .sort((a, b) => a.groupNumber.localeCompare(b.groupNumber))
            .map(mapTeam);
    }

    // =====================================================
    // GET /sections/student-groups
    // Scan student users_id → group by pattern → ใช้เลือก section_code
    //
    // users_id format เช่น "640660346001"
    //   pos 3-4 = entryYear  (เช่น "66")
    //   pos 5   = studyDigit (เช่น "3" = REG, "5" = LE)
    //   pos 7-8 = programCode (เช่น "46" = CPE)
    //
    // ผลลัพธ์: [ { sectionCode: "66346", label: "66-3-46", count: 45 }, ... ]
    // =====================================================
    async getStudentGroups() {
        const rows = await this.prisma.$queryRaw<
            { entry_year: string; study_digit: string; program_code: string; cnt: bigint }[]
        >`
      SELECT
        SUBSTRING(users_id, 3, 2) AS entry_year,
        SUBSTRING(users_id, 5, 1) AS study_digit,
        SUBSTRING(users_id, 7, 2) AS program_code,
        COUNT(*)                  AS cnt
      FROM "Users"
      WHERE role = 'STUDENT'
        AND LENGTH(users_id) >= 8
      GROUP BY SUBSTRING(users_id, 3, 2), SUBSTRING(users_id, 5, 1), SUBSTRING(users_id, 7, 2)
      ORDER BY SUBSTRING(users_id, 3, 2) DESC, SUBSTRING(users_id, 5, 1) ASC, SUBSTRING(users_id, 7, 2) ASC
    `;

        const studyTypeLabel = (digit: string) => {
            if (digit === '3' || digit === '4') return 'REG';
            if (digit === '5') return 'LE';
            return digit;
        };

        return rows.map((r) => ({
            sectionCode: `${r.entry_year}${r.study_digit}${r.program_code}CPE`,
            entryYear: r.entry_year,
            studyDigit: r.study_digit,
            programCode: r.program_code,
            studyType: studyTypeLabel(r.study_digit),
            label: `รุ่น ${r.entry_year} · ${studyTypeLabel(r.study_digit)} · โปรแกรม ${r.program_code}`,
            studentCount: Number(r.cnt),
        }));
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
    // ต่อวิชาจาก PRE_PROJECT → PROJECT
    //
    // ✅ Architecture ที่ถูกต้อง: CLONE ไม่ใช่ MOVE
    //
    // PRE_PROJECT section ยังคงมีทีมเดิมครบ (ไม่ถูกแตะ)
    // PROJECT section จะได้ทีมใหม่ที่ clone มา
    //
    // สิ่งที่ clone:
    //   Team           → ใหม่ (groupNumber เดิม ซ้ำได้เพราะคนละ section)
    //   Teammember     → copy สมาชิกทั้งหมด
    //   Project        → clone ชื่อ/รายละเอียด ผูกกับทีมใหม่
    //   ProjectAdvisor → copy ไปยัง Project ใหม่
    //
    // ✅ ใช้ $transaction เพื่อความ atomic
    // =====================================================
    async continueToProject(sectionId: number, dto: ContinueToProjectDto) {
        // 1. ดึง Section เดิมและเทอมใหม่
        const [oldSection, newTerm] = await Promise.all([
            this.prisma.section.findUnique({
                where: { section_id: sectionId },
                include: {
                    Section_Enrollment: true,
                    Team: {
                        include: {
                            Teammember: true,
                            Project: {
                                include: { ProjectAdvisor: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.term.findUnique({
                where: { term_id: dto.new_term_id },
            }),
        ]);

        if (!oldSection) throw new NotFoundException('Section not found');
        if (oldSection.course_type !== 'PRE_PROJECT') {
            throw new BadRequestException('Only PRE_PROJECT can continue to PROJECT');
        }
        if (!newTerm) throw new NotFoundException('Term not found');

        // 2. กรอง Team ที่จะ clone
        const teamsToClone = dto.team_ids
            ? oldSection.Team.filter((t) => dto.team_ids!.includes(t.team_id))
            : oldSection.Team;

        if (teamsToClone.length === 0) {
            throw new BadRequestException('ไม่มีทีมที่เลือกอยู่ใน Section นี้');
        }

        return await this.prisma.$transaction(async (tx) => {
            // 3. สร้าง Section ใหม่ (PROJECT)
            const newSection = await tx.section.create({
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

            // 4. สร้าง enrollment ใน section ใหม่
            const memberUserIds = new Set<string>();
            for (const team of teamsToClone) {
                for (const member of team.Teammember) {
                    memberUserIds.add(member.user_id);
                }
            }

            const enrollmentData = oldSection.Section_Enrollment
                .filter((e) => memberUserIds.has(e.users_id))
                .map((e) => ({ users_id: e.users_id, section_id: newSection.section_id }));

            if (enrollmentData.length > 0) {
                await tx.section_Enrollment.createMany({ data: enrollmentData, skipDuplicates: true });
            }

            // 5. Clone แต่ละทีม (ไม่ย้าย ทีมเดิมยังอยู่ใน PRE_PROJECT)
            let clonedTeams = 0;

            for (const team of teamsToClone) {
                // 5a. สร้างทีมใหม่ใน PROJECT section
                const newTeam = await tx.team.create({
                    data: {
                        // ใช้ชื่อกลุ่มเดิม (composite unique [groupNumber, section_id] ทำให้ซ้ำข้ามวิชาได้)
                        groupNumber: team.groupNumber,
                        section_id: newSection.section_id,
                    },
                });

                // 5a-1. Backfill submissions for the new team in the new section
                await this.eventsService.backfillSubmissionsForTeam(newTeam.team_id, newSection.section_id, tx);

                // 5b. Clone Teammember
                if (team.Teammember.length > 0) {
                    await tx.teammember.createMany({
                        data: team.Teammember.map((m) => ({
                            team_id: newTeam.team_id,
                            user_id: m.user_id,
                        })),
                        skipDuplicates: true,
                    });
                }

                // 5c. Clone Project (ถ้ามี)
                if (team.Project) {
                    const oldProject = team.Project;

                    const newProject = await tx.project.create({
                        data: {
                            projectname: oldProject.projectname,
                            projectnameEng: oldProject.projectnameEng,
                            description: oldProject.description,
                            project_type: oldProject.project_type,
                            status: oldProject.status, // 💡 คัดลอกสถานะเดิมมาเลย (ไม่ต้องหล่นไป DRAFT)
                            team_id: newTeam.team_id,
                        },
                    });

                    // 5d. Clone ProjectAdvisor
                    if (oldProject.ProjectAdvisor.length > 0) {
                        await tx.projectAdvisor.createMany({
                            data: oldProject.ProjectAdvisor.map((pa) => ({
                                project_id: newProject.project_id,
                                advisor_id: pa.advisor_id,
                                advisor_role: pa.advisor_role, // 💡 คัดลอกบทบาท (PRIMARY / CO_ADVISOR)
                                status: pa.status, // 💡 คัดลอกการอนุมัติ
                            })),
                            skipDuplicates: true,
                        });
                    }

                    // 5e. Clone Tasks (Kanban board, Comments, Attachments)
                    const oldTasks = await tx.task.findMany({
                        where: { project_id: oldProject.project_id },
                        include: {
                            TaskAssignment: true,
                            Attachment: true,
                            Comment: true,
                        },
                    });

                    if (oldTasks.length > 0) {
                        for (const oldTask of oldTasks) {
                            const newTask = await tx.task.create({
                                data: {
                                    title: oldTask.title,
                                    description: oldTask.description,
                                    status: oldTask.status,
                                    priority: oldTask.priority,
                                    tags: oldTask.tags,
                                    startDate: oldTask.startDate,
                                    dueDate: oldTask.dueDate,
                                    authorUserId: oldTask.authorUserId,
                                    project_id: newProject.project_id,
                                    position: oldTask.position,
                                },
                            });

                            if (oldTask.TaskAssignment.length > 0) {
                                await tx.taskAssignment.createMany({
                                    data: oldTask.TaskAssignment.map((ta) => ({
                                        user_id: ta.user_id,
                                        task_id: newTask.task_id,
                                    })),
                                    skipDuplicates: true,
                                });
                            }

                            if (oldTask.Attachment.length > 0) {
                                await tx.attachment.createMany({
                                    data: oldTask.Attachment.map((a) => ({
                                        fileUrl: a.fileUrl,
                                        filename: a.filename,
                                        uploadedBy_id: a.uploadedBy_id,
                                        task_id: newTask.task_id,
                                    })),
                                    skipDuplicates: true,
                                });
                            }

                            if (oldTask.Comment.length > 0) {
                                await tx.comment.createMany({
                                    data: oldTask.Comment.map((c) => ({
                                        text: c.text,
                                        createdAt: c.createdAt,
                                        isRead: c.isRead,
                                        user_id: c.user_id,
                                        task_id: newTask.task_id,
                                    })),
                                    skipDuplicates: true,
                                });
                            }
                        }
                    }
                }

                clonedTeams++;
            }

            // 6. Backfill submissions สำหรับ events ที่มีอยู่แล้วใน section ใหม่
            //    ป้องกันปัญหา: ทีมใหม่ไม่มี submission สำหรับ events ที่สร้างก่อนหน้า
            //    skipDuplicates = idempotent safe (เรียกซ้ำก็ไม่เกิดปัญหา)
            const existingEvents = await tx.event.findMany({
                where: { section_id: newSection.section_id },
                select: { event_id: true },
            });

            if (existingEvents.length > 0) {
                for (const team of teamsToClone) {
                    // หา newTeam จากที่เพิ่งสร้าง โดย groupNumber + section_id
                    const newTeam = await tx.team.findFirst({
                        where: { groupNumber: team.groupNumber, section_id: newSection.section_id },
                        select: { team_id: true },
                    });
                    if (!newTeam) continue;

                    await tx.submission.createMany({
                        data: existingEvents.map((e) => ({
                            event_id: e.event_id,
                            team_id: newTeam.team_id,
                            status: 'PENDING' as const,
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            this.logger.log(
                `continueToProject: cloned ${clonedTeams} teams from section ${sectionId} → section ${newSection.section_id}`,
            );

            return {
                message: 'ต่อวิชาเรียบร้อย (clone mode)',
                new_section_id: newSection.section_id,
                enrollments: enrollmentData.length,
                teams_cloned: clonedTeams,
                teams_total: oldSection.Team.length,
            };
        });
    }

    // =====================================================
    // GET /sections/:id/search-students?q=
    // ค้นหา student โดยชื่อ/รหัส ที่ยังไม่ได้อยู่ใน section นี้
    // รองรับนักศึกษาซ้ำชั้นที่ไม่ match section_code pattern
    // =====================================================
    async searchStudents(sectionId: number, query: string) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const q = query.trim();

        // ดึง user_id ที่ enroll แล้ว
        const enrolled = await this.prisma.section_Enrollment.findMany({
            where: { section_id: sectionId },
            select: { users_id: true },
        });
        const enrolledIds = enrolled.map((e) => e.users_id);

        return this.prisma.users.findMany({
            where: {
                role: 'STUDENT',
                users_id: { notIn: enrolledIds.length > 0 ? enrolledIds : undefined },
                OR: [
                    { users_id: { contains: q, mode: 'insensitive' } },
                    { firstname: { contains: q, mode: 'insensitive' } },
                    { lastname: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                users_id: true,
                firstname: true,
                lastname: true,
                email: true,
            },
            take: 30,
            orderBy: { users_id: 'asc' },
        });
    }
}
