import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function parseSectionCode(code: string) {
  return {
    entryYear: code.substring(0, 2),   // 66
    studyDigit: code.substring(2, 3),  // 3
    programCode: code.substring(3, 5)  // 46
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sectionId = Number(params.id)

  if (isNaN(sectionId)) {
    return NextResponse.json({ message: "Invalid section id" }, { status: 400 })
  }

  const section = await prisma.section.findUnique({
    where: { section_id: sectionId }
  })

  if (!section) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 })
  }

  const { entryYear, studyDigit, programCode } =
    parseSectionCode(section.section_code)

  // ใช้ substring ตรงตำแหน่งจริง
  const candidates = await prisma.$queryRaw<
    {
      users_id: string
      firstname: string | null
      lastname: string | null
      email: string | null
    }[]
  >`
    SELECT u.users_id, u.firstname, u.lastname, u.email
    FROM "Users" u
    WHERE
      u.role = 'STUDENT'
      AND SUBSTRING(u.users_id, 3, 2) = ${entryYear}
      AND SUBSTRING(u.users_id, 5, 1) = ${studyDigit}
      AND SUBSTRING(u.users_id, 7, 2) = ${programCode}
      AND NOT EXISTS (
        SELECT 1
        FROM "Section_Enrollment" se
        WHERE se.users_id = u.users_id
          AND se.section_id = ${sectionId}
      )
    ORDER BY u.users_id ASC
  `

  return NextResponse.json({
    section_id: section.section_id,
    section_code: section.section_code,
    matched_by: {
      entryYear,
      studyDigit,
      programCode,
      logic: "users_id positions 3-4,5,7-8"
    },
    total: candidates.length,
    candidates
  })
}
