import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tasks/[id]
 * ดึงรายละเอียด Task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(params.id);

    const task = await prisma.task.findUnique({
      where: { task_id: taskId },
      include: {
        Users: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
            email: true,
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
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        Comment: {
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
          orderBy: { createdAt: "desc" },
        },
        Project: {
          include: {
            Team: {
              include: {
                Teammember: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์
    const isMember = task.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Normalize
    return NextResponse.json({
      ...task,
      author: task.Users,
      assignees: task.TaskAssignment.map((ta) => ({
        user_id: ta.user_id,
        user: ta.Users,
      })),
      comments: task.Comment.map((c) => ({
        ...c,
        user: c.Users,
      })),
    });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * อัพเดท Task (รวมถึง status สำหรับ drag & drop)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(params.id);
    const body = await req.json();

    // ตรวจสอบว่า task มีอยู่และ user มีสิทธิ์
    const existingTask = await prisma.task.findUnique({
      where: { task_id: taskId },
      include: {
        Project: {
          include: {
            Team: {
              include: {
                Teammember: true,
              },
            },
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const isMember = existingTask.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      position,
    } = body;

    const updatedTask = await prisma.task.update({
      where: { task_id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(tags !== undefined && { tags }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(position !== undefined && { position }),
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedTask,
      author: updatedTask.Users,
      assignees: updatedTask.TaskAssignment.map((ta) => ({
        user_id: ta.user_id,
        user: ta.Users,
      })),
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * ลบ Task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(params.id);

    // ตรวจสอบว่า task มีอยู่และ user มีสิทธิ์
    const existingTask = await prisma.task.findUnique({
      where: { task_id: taskId },
      include: {
        Project: {
          include: {
            Team: {
              include: {
                Teammember: true,
              },
            },
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const isMember = existingTask.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    // อนุญาตให้สมาชิกและที่ปรึกษาลบได้
    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ลบ related records ก่อน
    await prisma.taskAssignment.deleteMany({
      where: { task_id: taskId },
    });

    await prisma.comment.deleteMany({
      where: { task_id: taskId },
    });

    await prisma.attachment.deleteMany({
      where: { task_id: taskId },
    });

    await prisma.notification.deleteMany({
      where: { task_id: taskId },
    });

    // ลบ task
    await prisma.task.delete({
      where: { task_id: taskId },
    });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
