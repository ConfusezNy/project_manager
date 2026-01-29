import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tasks/[id]/comments
 * ดึง Comments ของ Task
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

    // ตรวจสอบว่า task มีอยู่
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

    // ตรวจสอบสิทธิ์
    const isMember = task.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { task_id: taskId },
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
      orderBy: { createdAt: "asc" },
    });

    // Normalize
    const normalizedComments = comments.map((c) => ({
      ...c,
      user: c.Users,
    }));

    return NextResponse.json(normalizedComments);
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tasks/[id]/comments
 * เพิ่ม Comment ใน Task
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
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { message: "Comment text is required" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า task มีอยู่
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

    // ตรวจสอบสิทธิ์ (สมาชิกและ advisor สามารถ comment ได้)
    const isMember = task.Project.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );
    const isAdvisor = user.role === "ADVISOR";

    if (!isMember && !isAdvisor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        task_id: taskId,
        user_id: user.users_id,
      },
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
    });

    return NextResponse.json(
      { ...comment, user: comment.Users },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
