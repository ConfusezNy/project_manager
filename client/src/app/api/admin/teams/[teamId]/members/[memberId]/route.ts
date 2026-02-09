import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ teamId: string; memberId: string }>;
}

/**
 * DELETE /api/admin/teams/[teamId]/members/[memberId]
 * Admin: ลบสมาชิกออกจากทีม
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId, memberId } = await params;

  try {
    // Check if team member exists
    const member = await prisma.teammember.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: memberId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found in team" },
        { status: 404 },
      );
    }

    // Delete the team member
    await prisma.teammember.delete({
      where: { teammember_id: member.teammember_id },
    });

    return NextResponse.json({
      message: "ลบสมาชิกเรียบร้อย",
      deleted_user_id: memberId,
    });
  } catch (error) {
    console.error("Admin remove team member error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
