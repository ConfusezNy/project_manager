import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * แยกข้อมูลจาก section_code เช่น 66346CPE
 * 66 = รุ่น
 * 3  = แผนการศึกษา (LE / REG)
 * 46 = สาขา (CPE)
 */
function parseSectionCode(sectionCode: string) {
  return {
    entryYear: sectionCode.substring(0, 2),   // 66
    studyDigit: sectionCode.substring(2, 3),  // 3 หรือ 1
    programCode: sectionCode.substring(3, 5)  // 46
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sectionId = Number(params.id)

  if (isNaN(sectionId)) {
    return NextResponse.json(
      { message: "Invalid section id" },
      { status: 400 }
    )
  }

  // 1️⃣ โหลด section
  const section = await prisma.section.findUnique({
    where: { section_id: sectionId }
  })

  if (!section) {
    return NextResponse.json(
      { message: "Section not found" },
      { status: 404 }
    )
  }

  // 2️⃣ แยกข้อมูลจาก section_code
  const { entryYear, studyDigit, programCode } =
    parseSectionCode(section.section_code)

  // 3️⃣ สร้าง prefix สำหรับ users_id
  // รูปแบบจริง: 11 + ปี + แผน + สาขา
  const userIdPrefix = `11${entryYear}${studyDigit}${programCode}`

  // 4️⃣ ค้นหานักศึกษาที่เข้าข่าย
  const candidates = await prisma.users.findMany({
    where: {
      role: "STUDENT",
      users_id: {
        startsWith: userIdPrefix
      },
      sectionEnrollments: {
        none: {
          section_id: sectionId
        }
      }
    },
    select: {
      users_id: true,
      firstname: true,
      lastname: true,
      email: true
    },
    orderBy: {
      users_id: "asc"
    }
  })

  // 5️⃣ ส่งผลลัพธ์ (แนะนำเท่านั้น)
  return NextResponse.json({
    section_id: section.section_id,
    section_code: section.section_code,
    course_type: section.course_type,
    study_type: section.study_type,
    matched_by: {
      entryYear,
      studyDigit,
      programCode
    },
    total: candidates.length,
    candidates
  })
}
