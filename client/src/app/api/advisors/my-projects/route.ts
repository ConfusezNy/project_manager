import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/advisors/my-projects
 * ดึงรายการโปรเจกต์ที่อาจารย์เป็นที่ปรึกษา
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADVISOR") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // ดึงโปรเจกต์ที่อาจารย์เป็นที่ปรึกษา
    const projectAdvisors = await prisma.projectAdvisor.findMany({
      where: {
        advisor_id: user.users_id,
      },
      include: {
        Project: {
          include: {
            Team: {
              include: {
                Section: {
                  include: {
                    Term: true,
                  },
                },
                Teammember: {
                  include: {
                    Users: {
                      select: {
                        users_id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                        titles: true,
                      },
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
                    email: true,
                    titles: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        Project: {
          createdAt: "desc",
        },
      },
    });

    // Normalize to camelCase for frontend
    const projects = projectAdvisors.map((pa) => {
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
              ? {
                  semester: team.Section.Term.semester,
                  academicYear: team.Section.Term.academicYear,
                }
              : undefined,
          },
          members: (team.Teammember || []).map((m: any) => ({
            user: {
              users_id: m.Users?.users_id || m.user_id,
              firstname: m.Users?.firstname,
              lastname: m.Users?.lastname,
              email: m.Users?.email,
              titles: m.Users?.titles,
            },
          })),
        },
        advisors: (project.ProjectAdvisor || []).map((a: any) => ({
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

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get advisor projects error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
