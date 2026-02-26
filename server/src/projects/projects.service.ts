import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateProjectDto,
    UpdateProjectDto,
    AddAdvisorDto,
    UpdateStatusDto,
} from './dto/project.dto';

/**
 * Projects Service
 * ย้ายมาจาก: 4 route files ใน client/src/app/api/projects/
 *
 * 📌 7 endpoints:
 * - findByTeam(teamId)            → GET /projects?team_id=
 * - create(userId, dto)           → POST /projects
 * - update(id, userId, dto)       → PUT /projects/:id
 * - remove(id, userId)            → DELETE /projects/:id
 * - addAdvisor(id, userId, dto)   → POST /projects/:id/advisor
 * - removeAdvisor(id, userId)     → DELETE /projects/:id/advisor
 * - updateStatus(id, userId, dto) → PUT /projects/:id/status
 */
@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /projects?team_id= — ดึงโครงงานของทีม
    // ย้ายจาก: projects/route.ts → GET
    // =====================================================
    async findByTeam(teamId: number) {
        return this.prisma.project.findUnique({
            where: { team_id: teamId },
            include: {
                Team: {
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
                },
                ProjectAdvisor: {
                    include: {
                        Users: {
                            select: {
                                users_id: true,
                                firstname: true,
                                lastname: true,
                                titles: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // =====================================================
    // POST /projects — สร้างโครงงาน (Student + Team member)
    // ย้ายจาก: projects/route.ts → POST
    //
    // 📌 Flow: เช็คสมาชิก → เช็ค 1 team = 1 project → สร้าง
    // =====================================================
    async create(userId: string, dto: CreateProjectDto) {
        // เช็คว่า user เป็นสมาชิกทีม
        const membership = await this.prisma.teammember.findFirst({
            where: { team_id: dto.team_id, user_id: userId },
        });
        if (!membership) {
            throw new ForbiddenException('You are not a member of this team');
        }

        // เช็คว่าทีมมี project แล้วหรือยัง (1 team = 1 project)
        const existing = await this.prisma.project.findUnique({
            where: { team_id: dto.team_id },
        });
        if (existing) {
            throw new BadRequestException('This team already has a project');
        }

        return this.prisma.project.create({
            data: {
                projectname: dto.projectname,
                projectnameEng: dto.projectnameEng || null,
                project_type: dto.project_type || null,
                description: dto.description || null,
                status: 'DRAFT',
                team_id: dto.team_id,
            },
            include: {
                Team: {
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
                },
            },
        });
    }

    // =====================================================
    // PUT /projects/:id — แก้ไขโครงงาน (Student, ก่อน approve)
    // ย้ายจาก: projects/[id]/route.ts → PUT
    // =====================================================
    async update(id: number, userId: string, dto: UpdateProjectDto) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: id },
            include: { Team: { include: { Teammember: true } } },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const isMember = project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember) {
            throw new ForbiddenException('You are not a member of this team');
        }

        if (project.status === 'APPROVED') {
            throw new ForbiddenException('Cannot edit approved project');
        }

        return this.prisma.project.update({
            where: { project_id: id },
            data: {
                projectname: dto.projectname ?? project.projectname,
                projectnameEng:
                    dto.projectnameEng !== undefined
                        ? dto.projectnameEng
                        : project.projectnameEng,
                project_type:
                    dto.project_type !== undefined
                        ? dto.project_type
                        : project.project_type,
                description:
                    dto.description !== undefined ? dto.description : project.description,
            },
            include: {
                Team: {
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
                },
                ProjectAdvisor: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, titles: true },
                        },
                    },
                },
            },
        });
    }

    // =====================================================
    // DELETE /projects/:id — ลบโครงงาน (Student, ก่อน approve)
    // ย้ายจาก: projects/[id]/route.ts → DELETE
    // =====================================================
    async remove(id: number, userId: string) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: id },
            include: { Team: { include: { Teammember: true } } },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const isMember = project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember) {
            throw new ForbiddenException('You are not a member of this team');
        }

        if (project.status === 'APPROVED') {
            throw new ForbiddenException('Cannot delete approved project');
        }

        await this.prisma.project.delete({ where: { project_id: id } });
        return { message: 'Project deleted successfully' };
    }

    // =====================================================
    // POST /projects/:id/advisor — เพิ่มอาจารย์ที่ปรึกษา
    // ย้ายจาก: projects/[id]/advisor/route.ts → POST
    //
    // 📌 Flow: เช็คสมาชิก → เช็คก่อน approve → เช็ค capacity (max 2) →
    //          ลบอาจารย์เก่า → เพิ่มใหม่ → status = PENDING
    // =====================================================
    async addAdvisor(id: number, userId: string, dto: AddAdvisorDto) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: id },
            include: {
                Team: { include: { Teammember: true } },
                ProjectAdvisor: true,
            },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const isMember = project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember) {
            throw new ForbiddenException('You are not a member of this team');
        }

        if (project.status === 'APPROVED') {
            throw new ForbiddenException('Cannot change advisor for approved project');
        }

        // เช็คว่าอาจารย์รับได้อีกไหม (นับเฉพาะ APPROVED projects)
        const advisorCount = await this.prisma.projectAdvisor.count({
            where: {
                advisor_id: dto.advisor_id,
                Project: { status: 'APPROVED' },
            },
        });
        if (advisorCount >= 2) {
            throw new BadRequestException('อาจารย์ท่านนี้รับโปรเจกต์เต็มแล้ว');
        }

        // ลบอาจารย์เก่า → เพิ่มใหม่ → เปลี่ยนสถานะ
        await this.prisma.projectAdvisor.deleteMany({
            where: { project_id: id },
        });

        await this.prisma.projectAdvisor.create({
            data: { project_id: id, advisor_id: dto.advisor_id },
        });

        await this.prisma.project.update({
            where: { project_id: id },
            data: { status: 'PENDING' },
        });

        return { message: 'เพิ่มอาจารย์ที่ปรึกษาสำเร็จ' };
    }

    // =====================================================
    // DELETE /projects/:id/advisor — ลบอาจารย์ที่ปรึกษา
    // ย้ายจาก: projects/[id]/advisor/route.ts → DELETE
    // =====================================================
    async removeAdvisor(id: number, userId: string) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: id },
            include: { Team: { include: { Teammember: true } } },
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const isMember = project.Team.Teammember.some(
            (m) => m.user_id === userId,
        );
        if (!isMember) {
            throw new ForbiddenException('You are not a member of this team');
        }

        if (project.status === 'APPROVED') {
            throw new ForbiddenException('Cannot remove advisor from approved project');
        }

        await this.prisma.projectAdvisor.deleteMany({
            where: { project_id: id },
        });

        await this.prisma.project.update({
            where: { project_id: id },
            data: { status: 'DRAFT' },
        });

        return { message: 'ลบอาจารย์ที่ปรึกษาแล้ว' };
    }

    // =====================================================
    // PUT /projects/:id/status — อนุมัติ/ปฏิเสธ (Advisor only)
    // ย้ายจาก: projects/[id]/status/route.ts → PUT
    //
    // 📌 เฉพาะ Advisor ที่เป็นที่ปรึกษาจริงเท่านั้น
    // =====================================================
    async updateStatus(id: number, userId: string, dto: UpdateStatusDto) {
        // เช็คว่าเป็นที่ปรึกษาจริง
        const projectAdvisor = await this.prisma.projectAdvisor.findFirst({
            where: { project_id: id, advisor_id: userId },
            include: { Project: true },
        });

        if (!projectAdvisor) {
            throw new ForbiddenException('You are not an advisor of this project');
        }

        if (projectAdvisor.Project.status !== 'PENDING') {
            throw new BadRequestException('Can only approve/reject PENDING projects');
        }

        await this.prisma.project.update({
            where: { project_id: id },
            data: { status: dto.status as any },
        });

        // ถ้าปฏิเสธ → ลบ ProjectAdvisor record ด้วย
        // เพื่อให้โปรเจกต์หายจากลิสต์อาจารย์ และนักศึกษาสามารถขอใหม่ได้
        if (dto.status === 'REJECTED') {
            await this.prisma.projectAdvisor.deleteMany({
                where: { project_id: id },
            });
        }

        return {
            message:
                dto.status === 'APPROVED'
                    ? 'อนุมัติโปรเจกต์แล้ว'
                    : 'ปฏิเสธโปรเจกต์แล้ว',
        };
    }

    // =====================================================
    // GET /projects/archive — คลังโครงงาน (ทุก role ที่ login)
    // ดึงเฉพาะ isArchived = true
    // Query: q (search), year, category
    // =====================================================
    async findArchived(query: { q?: string; year?: string; category?: string; advisor?: string }) {
        const where: Record<string, unknown> = { isArchived: true };

        // Search by project name TH/EN or team name or advisor name
        if (query.q) {
            where.OR = [
                { projectname: { contains: query.q, mode: 'insensitive' } },
                { projectnameEng: { contains: query.q, mode: 'insensitive' } },
                { Team: { name: { contains: query.q, mode: 'insensitive' } } },
                {
                    ProjectAdvisor: {
                        some: {
                            Users: {
                                OR: [
                                    { firstname: { contains: query.q, mode: 'insensitive' } },
                                    { lastname: { contains: query.q, mode: 'insensitive' } },
                                ],
                            },
                        },
                    },
                },
            ];
        }

        // Filter by specific advisor name
        if (query.advisor) {
            where.ProjectAdvisor = {
                some: {
                    Users: {
                        OR: [
                            { firstname: { contains: query.advisor, mode: 'insensitive' } },
                            { lastname: { contains: query.advisor, mode: 'insensitive' } },
                        ],
                    },
                },
            };
        }

        // Filter by project type / category
        if (query.category) {
            where.project_type = query.category;
        }

        // Filter by academic year (through Team → Section → Term)
        if (query.year) {
            where.Team = {
                ...(typeof where.Team === 'object' ? where.Team as Record<string, unknown> : {}),
                Section: {
                    Term: { academicYear: Number(query.year) },
                },
            };
        }

        const projects = await this.prisma.project.findMany({
            where,
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
                ProjectAdvisor: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, titles: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map to ProjectCard-compatible shape
        return projects.map((p) => ({
            id: p.project_id,
            title: p.projectname,
            titleEng: p.projectnameEng,
            description: p.description,
            category: p.project_type || 'other',
            year: p.Team?.Section?.Term
                ? String(p.Team.Section.Term.academicYear)
                : '',
            author: p.Team?.Teammember
                .map((m) => `${m.Users.firstname || ''} ${m.Users.lastname || ''}`.trim())
                .join(', ') || '',
            advisors: p.ProjectAdvisor.map((pa) => ({
                name: `${pa.Users.titles || ''} ${pa.Users.firstname || ''} ${pa.Users.lastname || ''}`.trim(),
            })),
            team: p.Team
                ? {
                    name: p.Team.name,
                    groupNumber: p.Team.groupNumber,
                    section: p.Team.Section?.section_code,
                    semester: p.Team.Section?.Term?.semester,
                }
                : null,
        }));
    }

    // =====================================================
    // PATCH /projects/:id/archive — toggle isArchived (Admin only)
    // =====================================================
    async toggleArchive(id: number) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: id },
        });
        if (!project) throw new NotFoundException('ไม่พบโครงงาน');

        const updated = await this.prisma.project.update({
            where: { project_id: id },
            data: { isArchived: !project.isArchived },
        });

        return {
            message: updated.isArchived
                ? 'เผยแพร่โครงงานแล้ว'
                : 'ยกเลิกเผยแพร่โครงงานแล้ว',
            isArchived: updated.isArchived,
        };
    }

    // =====================================================
    // GET /projects/archive/filters — ดึงตัวกรองจากข้อมูลจริง
    // =====================================================
    async getArchiveFilters() {
        // Get all academic years from Term table
        const terms = await this.prisma.term.findMany({
            select: { academicYear: true },
            distinct: ['academicYear'],
            orderBy: { academicYear: 'desc' },
        });

        const years = terms.map((t) => t.academicYear);

        return { years };
    }

    // =====================================================
    // POST /projects/check-similarity — ตรวจสอบโครงงานซ้ำ
    // =====================================================
    async checkSimilarity(dto: { title: string; description?: string }) {
        // 1. ดึงโครงงานทั้งหมด
        const allProjects = await this.prisma.project.findMany({
            select: {
                project_id: true,
                projectname: true,
                projectnameEng: true,
                description: true,
                project_type: true,
                status: true,
                createdAt: true,
            },
        });

        // 2. Extract keywords จาก input
        const inputKeywords = this.extractKeywords(dto.title + ' ' + (dto.description || ''));

        if (inputKeywords.length === 0) {
            return { similar: [], message: 'ไม่สามารถวิเคราะห์คำค้นได้' };
        }

        // 3. คำนวณ similarity score กับทุก project
        const results = allProjects
            .map((project) => {
                const projectText = [
                    project.projectname || '',
                    project.projectnameEng || '',
                    project.description || '',
                ].join(' ');

                const projectKeywords = this.extractKeywords(projectText);
                if (projectKeywords.length === 0) return null;

                // Jaccard-like similarity: intersection / union
                const inputSet = new Set(inputKeywords);
                const projectSet = new Set(projectKeywords);
                const intersection = [...inputSet].filter((k) => projectSet.has(k));
                const union = new Set([...inputSet, ...projectSet]);
                const score = Math.round((intersection.length / union.size) * 100);

                return {
                    project_id: project.project_id,
                    projectname: project.projectname,
                    projectnameEng: project.projectnameEng,
                    project_type: project.project_type,
                    status: project.status,
                    score,
                    matchedKeywords: intersection,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null && r.score >= 30)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // top 10

        return {
            similar: results,
            inputKeywords,
            message: results.length > 0
                ? `พบโครงงานที่คล้ายกัน ${results.length} รายการ`
                : 'ไม่พบโครงงานที่คล้ายกัน',
        };
    }

    /**
     * Extract meaningful keywords from text (Thai + English)
     * - Split on spaces, punctuation, common delimiters
     * - Remove stopwords and short words
     */
    private extractKeywords(text: string): string[] {
        const stopwords = new Set([
            // Thai stopwords
            'ระบบ', 'การ', 'ของ', 'และ', 'ใน', 'ที่', 'เพื่อ', 'ด้วย', 'จาก',
            'ให้', 'ได้', 'มี', 'ไป', 'มา', 'เป็น', 'จะ', 'แล้ว', 'อยู่', 'โดย',
            'กับ', 'หรือ', 'ก็', 'ไม่', 'นี้', 'นั้น', 'ซึ่ง', 'ต้อง', 'คือ',
            // English stopwords
            'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'for', 'to',
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'system', 'management', 'application', 'using', 'based',
        ]);

        return text
            .toLowerCase()
            .replace(/[^\u0E00-\u0E7Fa-z0-9\s]/g, ' ') // keep Thai + English + digits
            .split(/\s+/)
            .filter((word) => word.length >= 2 && !stopwords.has(word));
    }
}
