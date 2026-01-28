import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/teams/leave
 * ออกจากทีม (ทำได้ก่อนโปรเจกต์อนุมัติ)
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // หาทีมของ user
    const membership = await prisma.teammember.findFirst({
      where: {
        user_id: user.user_id,
      },
      include: {
        Team: {
          include: {
            Project: true,
            Teammember: {
              include: {
                Users: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          message: "You are not in any team",
        },
        { status: 404 },
      );
    }

    const team = membership.Team;

    // ตรวจสอบว่าโปรเจกต์ยังไม่ได้รับการอนุมัติ
    if (team.Project && team.Project.status === "APPROVED") {
      return NextResponse.json(
        {
          message: "ไม่สามารถออกจากกลุ่มได้หลังจากโปรเจกต์ได้รับการอนุมัติแล้ว",
        },
        { status: 403 },
      );
    }

    // ถ้าเป็นสมาชิกคนสุดท้าย ให้ลบทีมและโปรเจกต์ด้วย
    if (team.Teammember.length === 1) {
      // ลบโปรเจกต์ (ถ้ามี)
      if (team.Project) {
        // ลบอาจารย์ที่ปรึกษา
        await prisma.projectAdvisor.deleteMany({
          where: { project_id: team.Project.project_id },
        });

        // ลบโปรเจกต์
        await prisma.project.delete({
          where: { project_id: team.Project.project_id },
        });
      }

      // ลบสมาชิก
      await prisma.teammember.delete({
        where: {
          teammember_id: membership.teammember_id,
        },
      });

      // ลบทีม
      await prisma.team.delete({
        where: { team_id: team.team_id },
      });

      return NextResponse.json({
        message: "ออกจากกลุ่มและลบกลุ่มสำเร็จ (คุณเป็นสมาชิกคนสุดท้าย)",
      });
    } else {
      // แค่ลบตัวเองออก
      await prisma.teammember.delete({
        where: {
          teammember_id: membership.teammember_id,
        },
      });

      return NextResponse.json({
        message: "ออกจากกลุ่มสำเร็จ",
      });
    }
  } catch (error) {
    console.error("Leave team error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
