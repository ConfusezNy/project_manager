import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId, inviteeUserId } = await req.json();
  if (!teamId || !inviteeUserId) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { team_id: Number(teamId) },
  });

  if (!team) {
    return NextResponse.json({ message: "Team not found" }, { status: 404 });
  }

  // inviter ต้องอยู่ทีมนี้
  const isMember = await prisma.teammember.findFirst({
    where: {
      team_id: team.team_id,
      user_id: user.user_id,
    },
  });

  if (!isMember) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // invitee ต้องยังไม่มีทีมใน section นี้ (ผ่าน team.section_id)
  const exists = await prisma.teammember.findFirst({
    where: {
      user_id: inviteeUserId,
      Team: { section_id: team.section_id },
    },
  });

  if (exists) {
    return NextResponse.json(
      { message: "ผู้ใช้มีทีมในรายวิชานี้แล้ว" },
      { status: 400 },
    );
  }

  // ใช้ notification เป็น invite
  await prisma.notification.create({
    data: {
      user_id: inviteeUserId,
      actor_user_id: user.user_id,
      title: "เชิญเข้าร่วมทีม",
      message: "คุณถูกเชิญให้เข้าร่วมกลุ่มโครงงาน",
      event_type: "TEAM_INVITE",
      team_id: team.team_id,
    },
  });

  return NextResponse.json({ message: "Invitation sent" });
}
