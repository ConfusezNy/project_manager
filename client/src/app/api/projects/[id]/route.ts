import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/projects/[id]
 * แก้ไขข้อมูลโปรเจกต์ (ถ้ายังไม่ได้รับการอนุมัติ)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const projectId = parseInt(params.id);
    const { projectname, projectnameEng, project_type, description } =
      await req.json();

    // ดึงข้อมูลโปรเจกต์เดิม
    const existingProject = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        Team: {
          include: {
            Teammember: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          message: "Project not found",
        },
        { status: 404 },
      );
    }

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const isMember = existingProject.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );

    if (!isMember) {
      return NextResponse.json(
        {
          message: "You are not a member of this team",
        },
        { status: 403 },
      );
    }

    // ตรวจสอบว่าโปรเจกต์ได้รับการอนุมัติแล้วหรือไม่
    if (existingProject.status === "APPROVED") {
      return NextResponse.json(
        {
          message: "Cannot edit approved project",
        },
        { status: 403 },
      );
    }

    // แก้ไขโปรเจกต์
    const updatedProject = await prisma.project.update({
      where: { project_id: projectId },
      data: {
        projectname: projectname || existingProject.projectname,
        projectnameEng:
          projectnameEng !== undefined
            ? projectnameEng
            : existingProject.projectnameEng,
        project_type:
          project_type !== undefined
            ? project_type
            : existingProject.project_type,
        description:
          description !== undefined ? description : existingProject.description,
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
        ProjectAdvisor: {
          include: {
            Users: {
              select: {
                users_id: true,
                firstname: true,
                lastname: true,
                titles: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * ลบโปรเจกต์ (ถ้ายังไม่ได้รับการอนุมัติ)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const projectId = parseInt(params.id);

    // ดึงข้อมูลโปรเจกต์
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        Team: {
          include: {
            Teammember: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          message: "Project not found",
        },
        { status: 404 },
      );
    }

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const isMember = project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );

    if (!isMember) {
      return NextResponse.json(
        {
          message: "You are not a member of this team",
        },
        { status: 403 },
      );
    }

    // ตรวจสอบว่าโปรเจกต์ได้รับการอนุมัติแล้วหรือไม่
    if (project.status === "APPROVED") {
      return NextResponse.json(
        {
          message: "Cannot delete approved project",
        },
        { status: 403 },
      );
    }

    // ลบโปรเจกต์
    await prisma.project.delete({
      where: { project_id: projectId },
    });

    return NextResponse.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
