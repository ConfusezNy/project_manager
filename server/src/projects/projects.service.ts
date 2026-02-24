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
            data: { status: dto.status },
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
}
