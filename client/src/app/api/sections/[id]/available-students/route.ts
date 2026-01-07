import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/sections/[id]/available-students
 * ดึงรายชื่อนักศึกษาที่ลงทะเบียนใน section นี้ แต่ยังไม่มีทีม
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser()
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const sectionId = Number(params.id)

  // ดึงนักศึกษาที่ลงทะเบียนใน section นี้
  const enrollments = await prisma.sectionEnrollment.findMany({
    where: {
      section_id: sectionId
    },
    include: {
      user: {
        select: {
          users_id: true,
          firstname: true,
          lastname: true,
          email: true
        }
      }
    }
  })

  // กรองเอาเฉพาะคนที่ยังไม่มีทีมใน section นี้
  const availableStudents = []
  
  for (const enrollment of enrollments) {
    // ไม่รวมตัวเอง
    if (enrollment.users_id === user.user_id) continue

    // เช็กว่ามีทีมใน section นี้หรือยัง
    const hasTeam = await prisma.teammember.findFirst({
      where: {
        user_id: enrollment.users_id,
        section_id: sectionId
      }
    })

    if (!hasTeam) {
      availableStudents.push(enrollment.user)
    }
  }

  return NextResponse.json(availableStudents)
}
