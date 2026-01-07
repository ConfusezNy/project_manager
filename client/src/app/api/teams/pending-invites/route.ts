import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/teams/pending-invites
 * ดึงรายการคำเชิญเข้ากลุ่มที่รอการตอบรับ
 */
export async function GET() {
  const user = await getAuthUser()
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  // ดึง notification ที่เป็นคำเชิญเข้าทีม
  const invites = await prisma.notification.findMany({
    where: {
      user_id: user.user_id,
      event_type: "TEAM_INVITE",
      isRead: false
    },
    include: {
      team: {
        include: {
          section: {
            include: {
              term: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  users_id: true,
                  firstname: true,
                  lastname: true
                }
              }
            }
          }
        }
      },
      actor: {
        select: {
          users_id: true,
          firstname: true,
          lastname: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json(invites)
}
