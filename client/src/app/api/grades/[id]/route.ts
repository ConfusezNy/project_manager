import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/grades/[id]
 * แก้ไขเกรดรายคน (Admin only)
 */
export async function PATCH(
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
    const gradeId = parseInt(params.id);
    const { score } = await req.json();

    const validScores = ["A", "B_PLUS", "B", "C_PLUS", "C", "D_PLUS", "D", "F"];

    if (!validScores.includes(score)) {
      return NextResponse.json({ message: "Invalid score" }, { status: 400 });
    }

    const grade = await prisma.grade.findUnique({
      where: { grade_id: gradeId },
    });

    if (!grade) {
      return NextResponse.json({ message: "Grade not found" }, { status: 404 });
    }

    const updated = await prisma.grade.update({
      where: { grade_id: gradeId },
      data: {
        score,
        evaluator_id: user.users_id,
      },
    });

    return NextResponse.json({
      message: "อัปเดตเกรดสำเร็จ",
      grade: updated,
    });
  } catch (error) {
    console.error("Update grade error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/grades/[id]
 * ลบเกรด (Admin only)
 */
export async function DELETE(
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
    const gradeId = parseInt(params.id);

    const grade = await prisma.grade.findUnique({
      where: { grade_id: gradeId },
    });

    if (!grade) {
      return NextResponse.json({ message: "Grade not found" }, { status: 404 });
    }

    await prisma.grade.delete({
      where: { grade_id: gradeId },
    });

    return NextResponse.json({
      message: "ลบเกรดสำเร็จ",
    });
  } catch (error) {
    console.error("Delete grade error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
