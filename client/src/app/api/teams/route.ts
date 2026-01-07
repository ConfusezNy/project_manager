import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

// GET: ทีมที่ user เป็นสมาชิก
export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: { user_id: user.user_id }
      }
    },
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
  })

  return NextResponse.json(teams)
}

// POST: student สร้างทีม (temp)
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { sectionId } = await req.json()
    if (!sectionId) {
      return NextResponse.json({ message: "sectionId is required" }, { status: 400 })
    }

    // เช็กว่ามีทีมใน section นี้แล้วหรือยัง
    const exists = await prisma.teammember.findFirst({
      where: {
        user_id: user.user_id,
        section_id: Number(sectionId)
      }
    })

    if (exists) {
      return NextResponse.json(
        { message: "คุณมีทีมในรายวิชานี้แล้ว" },
        { status: 400 }
      )
    }

    // ดึง section info เพื่อเอา semester
    const section = await prisma.section.findUnique({
      where: { section_id: Number(sectionId) },
      include: { term: true }
    })

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 }
      )
    }

    // สร้างทีม temp
    const team = await prisma.team.create({
      data: {
        section_id: Number(sectionId),
        name: "Temporary Team",
        groupNumber: `TEMP-${Date.now()}`,
        semester: section.term?.semester && section.term?.academicYear 
          ? `${section.term.semester}/${section.term.academicYear}`
          : "1/2568"
      }
    })

    // เพิ่มตัวเองเป็นสมาชิก
    await prisma.teammember.create({
      data: {
        team_id: team.team_id,
        user_id: user.user_id,
        section_id: Number(sectionId)
      }
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("POST /api/teams error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    )
  }
}
