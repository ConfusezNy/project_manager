import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/teams/[id]/members/[memberId]
 * ลบสมาชิกออกจากทีม (ทำได้ก่อนโปรเจกต์อนุมัติ)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const teamId = parseInt(params.id);
    const memberUserId = params.memberId;

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const membership = await prisma.teammember.findFirst({
      where: {
        team_id: teamId,
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

    // ตรวจสอบว่าทีมมีโปรเจกต์และสถานะ
    const team = await prisma.team.findUnique({
      where: { team_id: teamId },
      include: {
        Project: true,
        Teammember: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        {
          message: "Team not found",
        },
        { status: 404 },
      );
    }

    // ตรวจสอบว่าโปรเจกต์ยังไม่ได้รับการอนุมัติ
    if (team.Project && team.Project.status === "APPROVED") {
      return NextResponse.json(
        {
          message: "ไม่สามารถลบสมาชิกได้หลังจากโปรเจกต์ได้รับการอนุมัติแล้ว",
        },
        { status: 403 },
      );
    }

    // ตรวจสอบว่ามีสมาชิกเหลืออย่างน้อย 2 คน
    if (team.Teammember.length <= 1) {
      return NextResponse.json(
        {
          message: "ไม่สามารถลบสมาชิกได้ ต้องมีสมาชิกอย่างน้อย 1 คน",
        },
        { status: 400 },
      );
    }

    // หา teammember_id ก่อน แล้วค่อยลบ
    const memberToRemove = await prisma.teammember.findFirst({
      where: {
        team_id: teamId,
        user_id: memberUserId,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { message: "Member not found in team" },
        { status: 404 },
      );
    }

    await prisma.teammember.delete({
      where: {
        teammember_id: memberToRemove.teammember_id,
      },
    });

    return NextResponse.json({
      message: "ลบสมาชิกออกจากทีมสำเร็จ",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
