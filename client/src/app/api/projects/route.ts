import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/projects
 * สร้างหัวข้อโปรเจกต์ใหม่ (ต้องมีทีมก่อน)
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { projectname, projectnameEng, project_type, description, team_id } =
      await req.json();

    // Validate required fields
    if (!projectname || !team_id) {
      return NextResponse.json(
        {
          message: "projectname and team_id are required",
        },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า user เป็นสมาชิกของทีมนี้
    const membership = await prisma.teammember.findFirst({
      where: {
        team_id: team_id,
        user_id: user.user_id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          message: "You are not a member of this team",
        },
        { status: 403 },
      );
    }

    // ตรวจสอบว่าทีมนี้มีโปรเจกต์อยู่แล้วหรือไม่
    const existingProject = await prisma.project.findUnique({
      where: { team_id: team_id },
    });

    if (existingProject) {
      return NextResponse.json(
        {
          message: "This team already has a project",
        },
        { status: 400 },
      );
    }

    // สร้างโปรเจกต์
    const project = await prisma.project.create({
      data: {
        projectname,
        projectnameEng: projectnameEng || null,
        project_type: project_type || null,
        description: description || null,
        status: "DRAFT", // ร่าง - ยังไม่มีอาจารย์
        team_id,
      },
      include: {
        Team: {
          include: {
            Section: true,
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
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/projects?team_id=123
 * ดึงข้อมูลโปรเจกต์ของทีม
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get("team_id");

  if (!team_id) {
    return NextResponse.json(
      {
        message: "team_id parameter is required",
      },
      { status: 400 },
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: { team_id: parseInt(team_id) },
      include: {
        Team: {
          include: {
            Section: true,
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

    return NextResponse.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
