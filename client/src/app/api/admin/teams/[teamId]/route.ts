import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

/**
 * GET /api/admin/teams/[teamId]
 * Admin: ดึงข้อมูลทีมตาม ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;

  try {
    const team = await prisma.team.findUnique({
      where: { team_id: parseInt(teamId) },
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
              },
            },
          },
        },
        Project: {
          select: {
            project_id: true,
            projectname: true,
            projectnameEng: true,
            status: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Admin get team error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/teams/[teamId]
 * Admin: แก้ไขข้อมูลทีม
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;

  try {
    const body = await req.json();
    const { name, groupNumber, status, semester } = body;

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { team_id: parseInt(teamId) },
    });

    if (!existingTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (groupNumber !== undefined) updateData.groupNumber = groupNumber;
    if (status !== undefined) updateData.status = status;
    if (semester !== undefined) updateData.semester = semester;

    const updatedTeam = await prisma.team.update({
      where: { team_id: parseInt(teamId) },
      data: updateData,
    });

    return NextResponse.json({
      message: "อัปเดตทีมเรียบร้อย",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Admin update team error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/teams/[teamId]
 * Admin: ลบทีม
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;
  const teamIdNum = parseInt(teamId);

  try {
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { team_id: teamIdNum },
      include: {
        Project: true,
        Teammember: true,
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Delete project if exists
    if (team.Project) {
      const projectId = team.Project.project_id;

      // Delete grades
      await prisma.grade.deleteMany({
        where: { project_id: projectId },
      });

      // Delete notifications related to project
      await prisma.notification.deleteMany({
        where: { project_id: projectId },
      });

      // Delete project advisors
      await prisma.projectAdvisor.deleteMany({
        where: { project_id: projectId },
      });

      // Get all tasks for this project
      const tasks = await prisma.task.findMany({
        where: { project_id: projectId },
        select: { task_id: true },
      });

      const taskIds = tasks.map((t) => t.task_id);

      if (taskIds.length > 0) {
        // Delete task assignments
        await prisma.taskAssignment.deleteMany({
          where: { task_id: { in: taskIds } },
        });

        // Delete comments
        await prisma.comment.deleteMany({
          where: { task_id: { in: taskIds } },
        });

        // Delete attachments
        await prisma.attachment.deleteMany({
          where: { task_id: { in: taskIds } },
        });

        // Delete notifications related to tasks
        await prisma.notification.deleteMany({
          where: { task_id: { in: taskIds } },
        });

        // Delete tasks
        await prisma.task.deleteMany({
          where: { project_id: projectId },
        });
      }

      // Delete the project
      await prisma.project.delete({
        where: { project_id: projectId },
      });
    }

    // Delete team members
    await prisma.teammember.deleteMany({
      where: { team_id: teamIdNum },
    });

    // Delete the team
    await prisma.team.delete({
      where: { team_id: teamIdNum },
    });

    return NextResponse.json({
      message: "ลบทีมเรียบร้อย",
      deleted_team_id: teamIdNum,
    });
  } catch (error) {
    console.error("Admin delete team error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
