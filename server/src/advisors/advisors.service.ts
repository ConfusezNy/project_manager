import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvisorsService {
    constructor(private prisma: PrismaService) { }

    // GET /advisors/available?section_id=1 — อาจารย์ที่ยังรับโปรเจกต์ได้
    // ถ้าส่ง section_id มา → นับเฉพาะ project ใน section นั้น (ตาม business logic)
    // ถ้าไม่ส่ง → นับทั้งหมด (global)
    async getAvailable(sectionId?: number) {
        const advisors = await this.prisma.users.findMany({
            where: { role: 'ADVISOR' },
            select: {
                users_id: true, titles: true,
                firstname: true, lastname: true,
                email: true, profilePicture: true,
                expertiseAreas: true,
            },
        });

        const advisorsWithCount = await Promise.all(
            advisors.map(async (advisor) => {
                // นับเฉพาะ APPROVED project ใน section นี้ (ถ้า sectionId มา) หรือ global
                const projectWhere: any = {
                    advisor_id: advisor.users_id,
                    Project: { status: 'APPROVED' },
                };

                if (sectionId) {
                    projectWhere.Project = {
                        status: 'APPROVED',
                        Team: { section_id: sectionId },
                    };
                }

                const count = await this.prisma.projectAdvisor.count({
                    where: projectWhere,
                });

                return {
                    ...advisor,
                    currentProjects: count,
                    canSelect: count < 2,
                    reason: count >= 2 ? 'รับโปรเจกต์เต็มแล้ว (2/2)' : null,
                };
            }),
        );

        advisorsWithCount.sort((a, b) => a.currentProjects - b.currentProjects);
        return advisorsWithCount;
    }

    // GET /advisors/my-projects — โปรเจกต์ที่อาจารย์ดูแล
    async getMyProjects(userId: string) {
        const projectAdvisors = await this.prisma.projectAdvisor.findMany({
            where: { advisor_id: userId },
            include: {
                Project: {
                    include: {
                        Team: {
                            include: {
                                Section: { include: { Term: true } },
                                Teammember: {
                                    include: {
                                        Users: {
                                            select: { users_id: true, firstname: true, lastname: true, email: true, titles: true },
                                        },
                                    },
                                },
                            },
                        },
                        ProjectAdvisor: {
                            include: {
                                Users: {
                                    select: { users_id: true, firstname: true, lastname: true, email: true, titles: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { Project: { createdAt: 'desc' } },
        });

        return projectAdvisors.map((pa) => {
            const project = pa.Project;
            const team = project.Team;
            return {
                project_id: project.project_id,
                projectname: project.projectname,
                projectnameEng: project.projectnameEng,
                project_type: project.project_type,
                description: project.description,
                status: project.status,
                team: {
                    team_id: team.team_id,
                    groupNumber: team.groupNumber,
                    semester: team.semester,
                    section: {
                        section_id: team.Section?.section_id,
                        section_code: team.Section?.section_code,
                        term: team.Section?.Term
                            ? { semester: team.Section.Term.semester, academicYear: team.Section.Term.academicYear }
                            : undefined,
                    },
                    members: (team.Teammember || []).map((m) => ({
                        user: {
                            users_id: m.Users?.users_id || m.user_id,
                            firstname: m.Users?.firstname,
                            lastname: m.Users?.lastname,
                            email: m.Users?.email,
                            titles: m.Users?.titles,
                        },
                    })),
                },
                advisors: (project.ProjectAdvisor || []).map((a) => ({
                    advisor: {
                        users_id: a.Users?.users_id || a.advisor_id,
                        firstname: a.Users?.firstname,
                        lastname: a.Users?.lastname,
                        email: a.Users?.email,
                        titles: a.Users?.titles,
                    },
                })),
            };
        });
    }
}
