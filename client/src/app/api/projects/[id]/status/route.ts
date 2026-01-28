import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/projects/[id]/status
 * อนุมัติ/ปฏิเสธโปรเจกต์ (สำหรับอาจารย์)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADVISOR") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const projectId = parseInt(params.id);
    const { status, comment } = await req.json();

    // Validate status
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid status. Must be APPROVED or REJECTED",
        },
        { status: 400 },
      );
    }

    // ตรวจสอบว่าอาจารย์เป็นที่ปรึกษาของโปรเจกต์นี้
    const projectAdvisor = await prisma.projectAdvisor.findFirst({
      where: {
        project_id: projectId,
        advisor_id: user.user_id,
      },
      include: {
        Project: true,
      },
    });

    if (!projectAdvisor) {
      return NextResponse.json(
        {
          message: "You are not an advisor of this project",
        },
        { status: 403 },
      );
    }

    // ตรวจสอบว่าโปรเจกต์อยู่ในสถานะ PENDING
    if (projectAdvisor.Project.status !== "PENDING") {
      return NextResponse.json(
        {
          message: "Can only approve/reject PENDING projects",
        },
        { status: 400 },
      );
    }

    // อัพเดทสถานะ
    await prisma.project.update({
      where: { project_id: projectId },
      data: {
        status: status,
      },
    });

    // TODO: สร้าง notification แจ้งนักศึกษา (ถ้าต้องการ)

    return NextResponse.json({
      message:
        status === "APPROVED" ? "อนุมัติโปรเจกต์แล้ว" : "ปฏิเสธโปรเจกต์แล้ว",
    });
  } catch (error) {
    console.error("Update project status error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
