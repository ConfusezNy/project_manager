import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminTeamsService {
    constructor(private prisma: PrismaService) { }

    // =====================================================
    // GET /admin/teams — ดึงทีมทั้งหมด (พร้อม filter)
    // Query: section_id, status, search
    // =====================================================
    async findAll(query: { section_id?: string; status?: string; search?: string }) {
        const where: Prisma.TeamWhereInput = {};

        // Filter by section
        if (query.section_id) {
            where.section_id = Number(query.section_id);
        }

        // Filter by project status
        if (query.status) {
            where.Project = { status: query.status as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' };
        }

        // Search by team name, groupNumber, or project name
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { groupNumber: { contains: query.search, mode: 'insensitive' } },
                { Project: { projectname: { contains: query.search, mode: 'insensitive' } } },
            ];
        }

        const teams = await this.prisma.team.findMany({
            where,
            include: {
                Section: { include: { Term: true } },
                Teammember: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, email: true },
                        },
                    },
                },
                Project: {
                    select: { project_id: true, projectname: true, projectnameEng: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map to frontend-expected shape
        const mapped = teams.map((team) => ({
            team_id: team.team_id,
            name: team.name,
            groupNumber: team.groupNumber,
            status: team.status,
            semester: team.semester,
            memberCount: team.Teammember.length,
            members: team.Teammember.map((m) => ({
                user_id: m.Users.users_id,
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
                term: team.Section.Term
                    ? {
                        term_id: team.Section.Term.term_id,
                        academicYear: team.Section.Term.academicYear,
                        semester: team.Section.Term.semester,
                    }
                    : undefined,
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

        return { teams: mapped, total: mapped.length };
    }

    // =====================================================
    // GET /admin/teams/:teamId — ดึงข้อมูลทีมเดียว
    // =====================================================
    async findOne(teamId: number) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            include: {
                Section: { include: { Term: true } },
                Teammember: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, email: true },
                        },
                    },
                },
                Project: {
                    select: { project_id: true, projectname: true, projectnameEng: true, status: true },
                },
            },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        return team;
    }

    // =====================================================
    // PUT /admin/teams/:teamId — แก้ไขทีม (name, groupNumber)
    // =====================================================
    async update(teamId: number, dto: { name?: string; groupNumber?: string }) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const updateData: Prisma.TeamUpdateInput = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.groupNumber !== undefined) updateData.groupNumber = dto.groupNumber;

        const updated = await this.prisma.team.update({
            where: { team_id: teamId },
            data: updateData,
        });

        return { message: 'อัปเดตทีมเรียบร้อย', team: updated };
    }

    // =====================================================
    // DELETE /admin/teams/:teamId — ลบทีม (cascade delete)
    // ⚠️ ครอบ $transaction — ลบ Teammember, Project (+ Tasks), และ Team
    // =====================================================
    async remove(teamId: number) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
            include: { Project: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        await this.prisma.$transaction(async (tx) => {
            // 1. ลบ Teammember ทั้งหมด
            await tx.teammember.deleteMany({ where: { team_id: teamId } });

            // 2. ถ้ามี Project → ลบ cascade ทั้งหมด
            if (team.Project) {
                const projectId = team.Project.project_id;

                // ลบ TaskAssignment ก่อน (FK → Task)
                await tx.taskAssignment.deleteMany({
                    where: { Task: { project_id: projectId } },
                });

                // ลบ Comment
                await tx.comment.deleteMany({
                    where: { Task: { project_id: projectId } },
                });

                // ลบ Attachment
                await tx.attachment.deleteMany({
                    where: { Task: { project_id: projectId } },
                });

                // ลบ Notification ที่เกี่ยวกับ Task ของ Project
                await tx.notification.deleteMany({
                    where: { Task: { project_id: projectId } },
                });

                // ลบ Tasks ทั้งหมด
                await tx.task.deleteMany({ where: { project_id: projectId } });

                // ลบ ProjectAdvisor
                await tx.projectAdvisor.deleteMany({ where: { project_id: projectId } });

                // ลบ Submission
                await tx.submission.deleteMany({ where: { team_id: teamId } });

                // ลบ Grade ที่เกี่ยวกับ Project
                await tx.grade.deleteMany({ where: { project_id: projectId } });

                // ลบ Project
                await tx.project.delete({ where: { project_id: projectId } });
            }

            // 3. ลบ Submission ที่อาจผูกกับ team โดยตรง (ไม่ผ่าน project)
            await tx.submission.deleteMany({ where: { team_id: teamId } });

            // 4. ลบ Notification ที่ผูกกับ team
            await tx.notification.deleteMany({ where: { team_id: teamId } });

            // 5. ลบ Team
            await tx.team.delete({ where: { team_id: teamId } });
        });

        return { message: 'ลบทีมเรียบร้อย' };
    }

    // =====================================================
    // DELETE /admin/teams (body: { team_id }) — ลบทีมจาก body
    // รวมกับ remove() ด้านบน
    // =====================================================
    async removeByBody(dto: { team_id: number }) {
        if (!dto.team_id) {
            throw new BadRequestException('team_id is required');
        }
        return this.remove(dto.team_id);
    }

    // =====================================================
    // GET /admin/teams/:teamId/members — ดูสมาชิก
    // =====================================================
    async getMembers(teamId: number) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const members = await this.prisma.teammember.findMany({
            where: { team_id: teamId },
            include: {
                Users: {
                    select: { users_id: true, firstname: true, lastname: true, email: true },
                },
            },
        });

        return members.map((m) => ({
            user_id: m.Users.users_id,
            firstname: m.Users.firstname,
            lastname: m.Users.lastname,
            email: m.Users.email,
        }));
    }

    // =====================================================
    // POST /admin/teams/:teamId/members — เพิ่มสมาชิก
    // =====================================================
    async addMember(teamId: number, dto: { user_id: string }) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // เช็คว่า user มีอยู่จริง
        const user = await this.prisma.users.findUnique({
            where: { users_id: dto.user_id },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // เช็คว่ายังไม่ได้อยู่ในทีมนี้
        const existing = await this.prisma.teammember.findUnique({
            where: { user_id_team_id: { user_id: dto.user_id, team_id: teamId } },
        });
        if (existing) {
            throw new BadRequestException('ผู้ใช้นี้อยู่ในทีมนี้แล้ว');
        }

        await this.prisma.teammember.create({
            data: { team_id: teamId, user_id: dto.user_id },
        });

        return { message: 'เพิ่มสมาชิกเรียบร้อย' };
    }

    // =====================================================
    // DELETE /admin/teams/:teamId/members/:memberId — ลบสมาชิก
    // =====================================================
    async removeMember(teamId: number, memberId: string) {
        const member = await this.prisma.teammember.findUnique({
            where: { user_id_team_id: { user_id: memberId, team_id: teamId } },
        });

        if (!member) {
            throw new NotFoundException('Member not found in this team');
        }

        await this.prisma.teammember.delete({
            where: { teammember_id: member.teammember_id },
        });

        return { message: 'ลบสมาชิกเรียบร้อย' };
    }

    // =====================================================
    // GET /admin/teams/:teamId/available-members — ค้นหานักศึกษาที่สามารถเพิ่มได้
    // เงื่อนไข: ลงทะเบียนใน Section เดียวกัน + ยังไม่อยู่ในทีมใด
    // =====================================================
    async getAvailableMembers(teamId: number, search?: string) {
        const team = await this.prisma.team.findUnique({
            where: { team_id: teamId },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // ดึง user_id ที่ลงทะเบียนใน section เดียวกัน
        const enrollments = await this.prisma.section_Enrollment.findMany({
            where: { section_id: team.section_id },
            select: { users_id: true },
        });

        const enrolledUserIds = enrollments.map((e) => e.users_id);

        // ดึง user_id ที่อยู่ในทีมแล้ว (ทุกทีมใน section เดียวกัน)
        const existingMembers = await this.prisma.teammember.findMany({
            where: {
                Team: { section_id: team.section_id },
            },
            select: { user_id: true },
        });

        const takenUserIds = new Set(existingMembers.map((m) => m.user_id));

        // กรองเอาเฉพาะคนที่ลงทะเบียนแต่ยังไม่อยู่ในทีม
        const availableUserIds = enrolledUserIds.filter((id) => !takenUserIds.has(id));

        if (availableUserIds.length === 0) {
            return [];
        }

        // สร้าง where clause พร้อม search
        const userWhere: Prisma.UsersWhereInput = {
            users_id: { in: availableUserIds },
            role: 'STUDENT',
        };

        if (search) {
            userWhere.OR = [
                { users_id: { contains: search, mode: 'insensitive' } },
                { firstname: { contains: search, mode: 'insensitive' } },
                { lastname: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await this.prisma.users.findMany({
            where: userWhere,
            select: { users_id: true, firstname: true, lastname: true, email: true },
            take: 20,
        });

        return users;
    }

    // =====================================================
    // GET /admin/projects — ดึงโครงงานทั้งหมด (พร้อม filter)
    // Query: section_id, status, search
    // =====================================================
    async findAllProjects(query: { section_id?: string; status?: string; search?: string }) {
        const where: Record<string, unknown> = {};

        // Filter by section (through team)
        if (query.section_id) {
            where.Team = { section_id: Number(query.section_id) };
        }

        // Filter by project status
        if (query.status) {
            where.status = query.status;
        }

        // Search by project name TH/EN or team name
        if (query.search) {
            where.OR = [
                { projectname: { contains: query.search, mode: 'insensitive' } },
                { projectnameEng: { contains: query.search, mode: 'insensitive' } },
                { Team: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
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
                                    select: { users_id: true, firstname: true, lastname: true, email: true },
                                },
                            },
                        },
                    },
                },
                ProjectAdvisor: {
                    include: {
                        Users: {
                            select: { users_id: true, firstname: true, lastname: true, titles: true, email: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map to frontend-expected shape
        const mapped = projects.map((p) => ({
            project_id: p.project_id,
            projectname: p.projectname,
            projectnameEng: p.projectnameEng,
            description: p.description,
            status: p.status,
            isArchived: p.isArchived,
            createdAt: p.createdAt,
            team: p.Team
                ? {
                    team_id: p.Team.team_id,
                    name: p.Team.name,
                    groupNumber: p.Team.groupNumber,
                    memberCount: p.Team.Teammember.length,
                    members: p.Team.Teammember.map((m) => ({
                        user_id: m.Users.users_id,
                        firstname: m.Users.firstname,
                        lastname: m.Users.lastname,
                        email: m.Users.email,
                    })),
                    section: {
                        section_id: p.Team.Section.section_id,
                        section_code: p.Team.Section.section_code,
                        course_type: p.Team.Section.course_type,
                        term: p.Team.Section.Term
                            ? {
                                term_id: p.Team.Section.Term.term_id,
                                academicYear: p.Team.Section.Term.academicYear,
                                semester: p.Team.Section.Term.semester,
                            }
                            : undefined,
                    },
                }
                : null,
            advisors: p.ProjectAdvisor.map((pa) => ({
                user_id: pa.Users.users_id,
                firstname: pa.Users.firstname,
                lastname: pa.Users.lastname,
                titles: pa.Users.titles,
                email: pa.Users.email,
            })),
        }));

        // Stats
        const stats = {
            total: mapped.length,
            approved: mapped.filter((p) => p.status === 'APPROVED').length,
            pending: mapped.filter((p) => p.status === 'PENDING').length,
            rejected: mapped.filter((p) => p.status === 'REJECTED').length,
        };

        return { projects: mapped, stats };
    }
}
