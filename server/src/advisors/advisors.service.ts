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
                // นับเฉพาะ APPROVED ใน projectAdvisor (ทั้ง PRIMARY และ CO_ADVISOR)
                const projectWhere: any = {
                    advisor_id: advisor.users_id,
                    status: 'APPROVED',
                };

                if (sectionId) {
                    projectWhere.Project = {
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

    // GET /advisors/my-projects — โปรเจกต์ที่อาจารย์ดูแลและ APPROVED แล้ว
    async getMyProjects(userId: string) {
        const projectAdvisors = await this.prisma.projectAdvisor.findMany({
            where: {
                advisor_id: userId,
                status: 'APPROVED',  // ✅ เฉพาะที่อนุมัติแล้ว
            },
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

        // ✅ Dedup ด้วย project_id (ป้องกัน edge case กรณีเดิมที่ constraint เคย miss)
        const seen = new Set<number>();
        const unique = projectAdvisors.filter((pa) => {
            if (seen.has(pa.project_id)) return false;
            seen.add(pa.project_id);
            return true;
        });

        // ✅ Dedup: แสดงเฉพาะ project ล่าสุดของแต่ละ student group
        // เมื่อ student ต่อวิชา = new Team + new Project แต่ same members
        // → ใช้ sorted member IDs เป็น key, เก็บเฉพาะล่าสุด (order: 'desc' อยู่แล้ว)
        const seenMemberSigs = new Map<string, typeof unique[0]>();

        for (const pa of unique) {
            const memberIds = (pa.Project.Team.Teammember || [])
                .map((m) => m.user_id)
                .sort()
                .join(',');
            // ถ้าเจอ signature ซ้ำ = ดึง 'desc' มาแล้ว อันแรกคือล่าสุด
            if (!seenMemberSigs.has(memberIds)) {
                seenMemberSigs.set(memberIds, pa);
            }
        }

        const dedupedByGroup = Array.from(seenMemberSigs.values());

        return dedupedByGroup.map((pa) => {
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
                    advisor_role: a.advisor_role,
                    status: a.status,
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

    // GET /advisors/all-projects — ดึงโปรเจกต์ที่ APPROVED ทั้งหมด (รวมอันเก่า) ไม่ตัดกลุ่มเก่าออก สำหรับใช้ในหน้า Events
    async getAllProjects(userId: string) {
        const projectAdvisors = await this.prisma.projectAdvisor.findMany({
            where: {
                advisor_id: userId,
                status: 'APPROVED',
            },
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

        // Dedup เฉพาะ project_id (ป้องกันข้อมูลซ้ำจาก PRIMARY และ CO_ADVISOR)
        const seen = new Set<number>();
        const unique = projectAdvisors.filter((pa) => {
            if (seen.has(pa.project_id)) return false;
            seen.add(pa.project_id);
            return true;
        });

        return unique.map((pa) => {
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
                    advisor_role: a.advisor_role,
                    status: a.status,
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
