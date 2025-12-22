import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ======================
// CREATE TERM
// ======================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { academicYear, semester, startDate, endDate } = body

    if (!academicYear || !semester || !startDate || !endDate) {
      return NextResponse.json(
        { error: "กรอกข้อมูลให้ครบ" },
        { status: 400 }
      )
    }

    const newTerm = await prisma.term.create({
      data: {
        academicYear: Number(academicYear),
        semester: Number(semester),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    })

    return NextResponse.json(
      { message: "สร้างเทอมสำเร็จ", data: newTerm },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create term error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเทอม" },
      { status: 500 }
    )
  }
}

// ======================
// GET ALL TERMS
// ======================
export async function GET() {
  try {
    const terms = await prisma.term.findMany({
      orderBy: [
        { academicYear: "desc" },
        { semester: "desc" },
      ],
    })

    return NextResponse.json(terms)
  } catch (error) {
    console.error("Get terms error:", error)
    return NextResponse.json(
      { error: "ดึงข้อมูลเทอมล้มเหลว" },
      { status: 500 }
    )
  }
}
