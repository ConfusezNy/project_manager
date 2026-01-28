import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * POST /api/teams/join
 * รับคำเชิญเข้ากลุ่ม
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json(
        { message: "notificationId is required" },
        { status: 400 },
      );
    }

    // ดึง notification
    const notification = await prisma.notification.findUnique({
      where: { notification_id: Number(notificationId) },
      include: { Team: true },
    });

    if (!notification || notification.user_id !== user.user_id) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 },
      );
    }

    if (!notification.Team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // เช็กว่ายังไม่มีทีมใน section นี้ (ผ่าน team.section_id)
    const exists = await prisma.teammember.findFirst({
      where: {
        user_id: user.user_id,
        Team: { section_id: notification.Team.section_id },
      },
    });

    if (exists) {
      return NextResponse.json(
        { message: "คุณมีทีมในรายวิชานี้แล้ว" },
        { status: 400 },
      );
    }

    // เพิ่มเป็นสมาชิกทีม (ไม่ต้องใส่ section_id แล้ว)
    await prisma.teammember.create({
      data: {
        team_id: notification.Team.team_id,
        user_id: user.user_id,
      },
    });

    // อัพเดทสถานะ notification
    await prisma.notification.update({
      where: { notification_id: notification.notification_id },
      data: { isRead: true },
    });

    return NextResponse.json(
      { message: "Joined team successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/teams/join error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
