import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/sections
 * ใช้สำหรับหน้า list (Frontend)
 */
export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        Term: true,
      },
      orderBy: {
        section_id: "asc",
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("GET /api/sections error:", error);
    return NextResponse.json(
      { message: "Failed to fetch sections" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/sections
 * สร้าง section (โค้ดคุณดีอยู่แล้ว ใช้ต่อได้)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      section_code,
      course_type,
      study_type,
      min_team_size,
      max_team_size,
      project_deadline,
      team_deadline,
      term_id,
    } = body ?? {};

    // validation (ของคุณดีอยู่แล้ว)
    const minT = Number(min_team_size);
    const maxT = Number(max_team_size);
    const termIdNum = Number(term_id);

    const projDate = new Date(project_deadline);
    const teamDate = new Date(team_deadline);

    const term = await prisma.term.findUnique({
      where: { term_id: termIdNum },
    });
    if (!term) {
      return NextResponse.json({ message: "Term not found" }, { status: 404 });
    }

    const newSection = await prisma.section.create({
      data: {
        section_code,
        course_type,
        study_type,
        min_team_size: minT,
        max_team_size: maxT,
        project_deadline: projDate,
        team_deadline: teamDate,
        term_id: termIdNum,
      },
    });

    return NextResponse.json(newSection, { status: 201 });
  } catch (error: any) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
