import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tasks?project_id=X
 * ดึงรายการ Task ของ Project
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const project_id = searchParams.get("project_id");

  if (!project_id) {
    return NextResponse.json(
      { message: "project_id is required" },
      { status: 400 },
    );
  }

  try {
    // ตรวจสอบว่า user เป็นสมาชิกของทีมที่เป็นเจ้าของ project
    const project = await prisma.project.findUnique({
      where: { project_id: parseInt(project_id) },
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
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const isMember = project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );

    // อนุญาตให้ advisor ของ project ดูได้
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { project_id: parseInt(project_id) },
      include: {
        Users: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
            profilePicture: true,
          },
        },
        TaskAssignment: {
          include: {
            Users: {
              select: {
                users_id: true,
                firstname: true,
                lastname: true,
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            Comment: true,
          },
        },
      },
      orderBy: [{ position: "asc" }, { dueDate: "asc" }],
    });

    // Normalize data for frontend
    const normalizedTasks = tasks.map((task) => ({
      ...task,
      author: task.Users,
      assignees: task.TaskAssignment.map((ta) => ({
        user_id: ta.user_id,
        user: ta.Users,
      })),
    }));

    return NextResponse.json(normalizedTasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tasks
 * สร้าง Task ใหม่
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      project_id,
    } = body;

    if (!title || !project_id) {
      return NextResponse.json(
        { message: "title and project_id are required" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const project = await prisma.project.findUnique({
      where: { project_id: parseInt(project_id) },
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
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const isMember = project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json(
        { message: "คุณไม่ใช่สมาชิกของทีมนี้" },
        { status: 403 },
      );
    }

    const assigneeIds = body.assigneeIds as string[] | undefined;

    // Logic: ตรวจสอบสิทธิ์การมอบหมายงาน
    let validAssigneeIds: string[] = [];
    if (assigneeIds && assigneeIds.length > 0) {
      // Filter out null/undefined values and ensure strings
      const cleanAssigneeIds = assigneeIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      );

      if (cleanAssigneeIds.length === 0) {
        // If filtering leaves nothing, skip query
        validAssigneeIds = [];
      } else {
        // ดึงข้อมูล users ที่จะถูก assign เพื่อเช็ค Role
        const assignees = await prisma.users.findMany({
          where: { users_id: { in: cleanAssigneeIds } },
          select: { users_id: true, role: true },
        });

        // กฎ: นักศึกษา ห้ามมอบหมายงานให้อาจารย์
        if (user.role === "STUDENT") {
          const hasAdvisor = assignees.some((a) => a.role === "ADVISOR");
          if (hasAdvisor) {
            return NextResponse.json(
              { message: "นักศึกษาไม่สามารถมอบหมายงานให้อาจารย์ได้" },
              { status: 403 },
            );
          }
        }
        // ถ้าเป็น Advisor หรือ Student ที่ assign ให้เพื่อน -> ผ่าน
        validAssigneeIds = assignees.map((a) => a.users_id);
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        tags: tags || null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        project_id: parseInt(project_id),
        authorUserId: user.users_id,
        // สร้าง Assignment พร้อม Task
        TaskAssignment: {
          create: validAssigneeIds.map((uid) => ({
            user_id: uid,
          })),
        },
      },
      include: {
        Users: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
          },
        },
        TaskAssignment: {
          include: {
            Users: {
              select: {
                users_id: true,
                firstname: true,
                lastname: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ...task, author: task.Users }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
