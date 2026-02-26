import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvisorsService {
    constructor(private prisma: PrismaService) { }

    // GET /advisors/available — อาจารย์ที่รับโปรเจกต์ได้
    async getAvailable() {
        const advisors = await this.prisma.users.findMany({
            where: { role: 'ADVISOR' },
            select: {
                users_id: true, titles: true,
                firstname: true, lastname: true,
                email: true, profilePicture: true,
            },
        });

        const advisorsWithCount = await Promise.all(
            advisors.map(async (advisor) => {
                const count = await this.prisma.projectAdvisor.count({
                    where: {
                        advisor_id: advisor.users_id,
                        Project: { status: 'APPROVED' },
                    },
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
