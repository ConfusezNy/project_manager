import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sections/[id]/teams
 * ดึงรายการ Team ทั้งหมดใน Section พร้อมข้อมูล Project และสถานะ
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const sectionId = parseInt(params.id);

    if (isNaN(sectionId)) {
      return NextResponse.json(
        { message: "Invalid section ID" },
        { status: 400 },
      );
    }

    // ดึง Section พร้อม Teams
    const section = await prisma.section.findUnique({
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
          orderBy: {
            groupNumber: "asc",
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    // Transform data for frontend
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

    return NextResponse.json({
      section_id: section.section_id,
      section_code: section.section_code,
      course_type: section.course_type,
      term: {
        term_id: section.Term.term_id,
        academicYear: section.Term.academicYear,
        semester: section.Term.semester,
      },
      teams,
    });
  } catch (error) {
    console.error("Get section teams error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
