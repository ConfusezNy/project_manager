import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    // 1. หาข้อมูลหัวหน้ากลุ่มเพื่อเอา teamId
    const leader = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { teamId: true }
    });

    if (!leader?.teamId) {
      return NextResponse.json({ error: "คุณยังไม่มีกลุ่มที่จะเชิญเพื่อนเข้า" }, { status: 400 });
    }

    // 2. ตรวจสอบว่าเพื่อนมีกลุ่มหรือยัง
    const target = await prisma.users.findUnique({
      where: { users_id: targetUserId },
      select: { teamId: true }
    });

    if (target?.teamId) {
      return NextResponse.json({ error: "นักศึกษาคนนี้มีกลุ่มอยู่แล้ว" }, { status: 400 });
    }

    // 3. เพิ่มเพื่อนเข้ากลุ่ม
    await prisma.users.update({
      where: { users_id: targetUserId },
      data: { teamId: leader.teamId }
    });

    return NextResponse.json({ message: "เพิ่มเพื่อนเข้ากลุ่มสำเร็จ" });
  } catch (error) {
    console.error("Invite API Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}