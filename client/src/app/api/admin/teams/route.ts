import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/admin/teams
 * Admin: ดึงทีมทั้งหมดในระบบ พร้อม filter
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("section_id");
    const termId = searchParams.get("term_id");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (sectionId) {
      where.section_id = parseInt(sectionId);
    }

    if (termId) {
      where.Section = { term_id: parseInt(termId) };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { groupNumber: { contains: search, mode: "insensitive" } },
        {
          Project: {
            projectname: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const teams = await prisma.team.findMany({
      where,
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
      orderBy: [{ Section: { section_code: "asc" } }, { groupNumber: "asc" }],
    });

    // Transform data for frontend
    const transformedTeams = teams.map((team) => ({
      team_id: team.team_id,
      name: team.name,
      groupNumber: team.groupNumber,
      status: team.status,
      semester: team.semester,
      memberCount: team.Teammember.length,
      members: team.Teammember.map((m) => ({
        user_id: m.user_id,
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
        term: {
          term_id: team.Section.Term.term_id,
          academicYear: team.Section.Term.academicYear,
          semester: team.Section.Term.semester,
        },
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

    return NextResponse.json({
      teams: transformedTeams,
      total: transformedTeams.length,
    });
  } catch (error) {
    console.error("Admin get teams error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/teams
 * Admin: ลบทีม
 */
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { team_id } = await req.json();

    if (!team_id) {
      return NextResponse.json(
        { message: "team_id is required" },
        { status: 400 },
      );
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { team_id: parseInt(team_id) },
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

      // Delete grades first
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
        // Delete task assignments first
        await prisma.taskAssignment.deleteMany({
          where: { task_id: { in: taskIds } },
        });

        // Delete comments on tasks
        await prisma.comment.deleteMany({
          where: { task_id: { in: taskIds } },
        });

        // Delete attachments on tasks
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
      where: { team_id: team.team_id },
    });

    // Delete the team
    await prisma.team.delete({
      where: { team_id: team.team_id },
    });

    return NextResponse.json({
      message: "ลบทีมเรียบร้อย",
      deleted_team_id: team.team_id,
    });
  } catch (error) {
    console.error("Admin delete team error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
