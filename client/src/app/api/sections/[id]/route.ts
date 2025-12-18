import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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

  const section = await prisma.section.findUnique({
    where: { section_id: sectionId }
  })

  if (!section) {
    return NextResponse.json(
      { message: "Section not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(section)
}
