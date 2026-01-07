import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- ดึงข้อมูลกลุ่มตัวเอง ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithTeam = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        team: {
          include: { 
            members: true,
            project: true,
          }
        }
      }
    });

    if (!userWithTeam || !userWithTeam.team) {
      return NextResponse.json(null);
    }

    return NextResponse.json(userWithTeam.team);
  } catch (error) {
    console.error("GET MyTeam Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ เพิ่มฟังก์ชัน DELETE สำหรับลบกลุ่ม
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. หาข้อมูลกลุ่มที่ User คนนี้สังกัด
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { teamId: true }
    });

    if (!user?.teamId) {
      return NextResponse.json({ error: "ไม่พบกลุ่มที่คุณสังกัด" }, { status: 404 });
    }

    // 2. ใช้ Transaction เพื่อลบข้อมูลที่เกี่ยวข้องกันทั้งหมดให้สะอาด
    await prisma.$transaction([
      // ปลดล็อคสมาชิกทุกคนในกลุ่มให้เป็นอิสระ (teamId = null)
      prisma.users.updateMany({
        where: { teamId: user.teamId },
        data: { teamId: null }
      }),
      // ลบโปรเจกต์ที่ผูกกับกลุ่มนี้ (ถ้ามี)
      prisma.project.deleteMany({
        where: { team_id: user.teamId }
      }),
      // ลบกลุ่มออกจากการแจ้งเตือน
      prisma.notification.deleteMany({
        where: { team_id: user.teamId }
      }),
      // สุดท้ายลบตัวกลุ่มทิ้ง
      prisma.team.delete({
        where: { team_id: user.teamId }
      })
    ]);

    return NextResponse.json({ message: "ลบกลุ่มสำเร็จ" });
  } catch (error) {
    console.error("DELETE MyTeam Error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบกลุ่มได้" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { teamId: true }
    });

    if (!user?.teamId) return NextResponse.json({ error: "ไม่พบกลุ่ม" }, { status: 404 });

    const updatedTeam = await prisma.team.update({
      where: { team_id: user.teamId },
      data: {
        topicThai: body.topicThai,
        topicEng: body.topicEng,
        description: body.description,
        projectType: body.projectType
      }
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลได้" }, { status: 500 });
  }
}