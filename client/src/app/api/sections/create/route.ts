import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const sectionId = Number(params.id);

  if (isNaN(sectionId)) {
    return NextResponse.json(
      { message: "Invalid section id" },
      { status: 400 },
    );
  }

  const section = await prisma.section.findUnique({
    where: { section_id: sectionId },
    include: {
      Term: true,
    },
  });

  if (!section) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 });
  }

  return NextResponse.json(section);
}
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
      team_locked,
      term_id,
    } = body ?? {};

    const missing: string[] = [];
    if (!section_code) missing.push("section_code");
    if (!course_type) missing.push("course_type");
    if (!study_type) missing.push("study_type");
    if (min_team_size == null) missing.push("min_team_size");
    if (max_team_size == null) missing.push("max_team_size");
    if (!project_deadline) missing.push("project_deadline");
    // team_locked is optional boolean, default to false
    if (term_id == null) missing.push("term_id");
    if (missing.length > 0) {
      return NextResponse.json(
        { message: "Missing fields", missing },
        { status: 400 },
      );
    }

    const allowedCourse = ["PRE_PROJECT", "PROJECT"];
    const allowedStudy = ["REG", "LE"];
    if (!allowedCourse.includes(course_type)) {
      return NextResponse.json(
        { message: "Invalid course_type", allowedCourse },
        { status: 400 },
      );
    }
    if (!allowedStudy.includes(study_type)) {
      return NextResponse.json(
        { message: "Invalid study_type", allowedStudy },
        { status: 400 },
      );
    }

    const minT = Number(min_team_size);
    const maxT = Number(max_team_size);
    const termIdNum = Number(term_id);
    if (Number.isNaN(minT) || Number.isNaN(maxT) || Number.isNaN(termIdNum)) {
      return NextResponse.json(
        { message: "min_team_size, max_team_size and term_id must be numbers" },
        { status: 400 },
      );
    }
    if (minT <= 0 || maxT <= 0 || minT > maxT) {
      return NextResponse.json(
        { message: "Invalid team size range" },
        { status: 400 },
      );
    }

    const projDate = new Date(project_deadline);
    if (isNaN(projDate.valueOf())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 },
      );
    }

    // ตรวจว่า term มีอยู่จริง
    const term = await prisma.term.findUnique({
      where: { term_id: termIdNum },
    });
    if (!term) {
      return NextResponse.json({ message: "Term not found" }, { status: 404 });
    }

    // ดีบัก: แสดง body ที่ได้รับ (เฉพาะ dev)
    console.info("CreateSection body:", {
      section_code,
      course_type,
      study_type,
      min_team_size: minT,
      max_team_size: maxT,
      project_deadline: projDate.toISOString(),
      team_locked: Boolean(team_locked),
      term_id: termIdNum,
    });

    // สร้าง section
    try {
      const newSection = await prisma.section.create({
        data: {
          section_code,
          course_type,
          study_type,
          min_team_size: minT,
          max_team_size: maxT,
          project_deadline: projDate,
          team_locked: Boolean(team_locked),
          term_id: termIdNum,
        },
      });

      return NextResponse.json(newSection, { status: 201 });
    } catch (err: any) {
      console.error("Prisma create error:", err);
      if (err?.code === "P2002") {
        return NextResponse.json(
          { message: "Section code already exists", detail: err.meta },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { message: "Create failed", detail: err?.message || String(err) },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Create section error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        detail: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
