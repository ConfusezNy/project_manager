import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

// GET: ทีมเดียวของ student
export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const member = await prisma.teammember.findFirst({
    where: {
      user_id: user.user_id
    },
    include: {
      team: {
        include: {
          section: true,
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
      }
    }
  })

  return NextResponse.json(member)
}
