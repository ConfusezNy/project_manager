import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/teams/pending-invites
 * ดึงรายการคำเชิญเข้ากลุ่มที่รอการตอบรับ
 */
export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Return empty array for non-STUDENT roles (don't break the UI)
  if (user.role !== "STUDENT") {
    return NextResponse.json([]);
  }

  // ดึง notification ที่เป็นคำเชิญเข้าทีม
  const invites = await prisma.notification.findMany({
    where: {
      user_id: user.users_id,
      event_type: "TEAM_INVITE",
      isRead: false,
    },
    include: {
      Team: {
        include: {
          Section: {
            include: {
              Term: true,
            },
          },
          Teammember: {
            include: {
              Users: {
                select: {
                  users_id: true,
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
      },
      Users_Notification_actor_user_idToUsers: {
        select: {
          users_id: true,
          firstname: true,
          lastname: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(invites);
}
