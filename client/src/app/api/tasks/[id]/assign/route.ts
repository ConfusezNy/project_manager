import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tasks/[id]/assign
 * Assign user ให้ task
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = parseInt(params.id);
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { message: "user_id is required" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า task มีอยู่และ user มีสิทธิ์
    const task = await prisma.task.findUnique({
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

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const isMember = task.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ตรวจสอบว่า user_id ที่จะ assign เป็นสมาชิกของทีม
    const isAssigneeInTeam = task.Project.Team.Teammember.some(
      (m) => m.user_id === user_id,
    );

    if (!isAssigneeInTeam) {
      return NextResponse.json(
        { message: "User ไม่ได้เป็นสมาชิกของทีม" },
        { status: 400 },
      );
    }

    // เช็กว่า assign แล้วหรือยัง
    const existingAssignment = await prisma.taskAssignment.findFirst({
      where: {
        task_id: taskId,
        user_id: user_id,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { message: "User ถูก assign แล้ว" },
        { status: 400 },
      );
    }

    // สร้าง assignment
    await prisma.taskAssignment.create({
      data: {
        task_id: taskId,
        user_id: user_id,
      },
    });

    return NextResponse.json({ message: "Assigned successfully" });
  } catch (error) {
    console.error("Assign task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tasks/[id]/assign
 * Unassign user จาก task
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
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { message: "user_id is required" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า task มีอยู่และ user มีสิทธิ์
    const task = await prisma.task.findUnique({
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

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const isMember = task.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ลบ assignment
    await prisma.taskAssignment.deleteMany({
      where: {
        task_id: taskId,
        user_id: user_id,
      },
    });

    return NextResponse.json({ message: "Unassigned successfully" });
  } catch (error) {
    console.error("Unassign task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
