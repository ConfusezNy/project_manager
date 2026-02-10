import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/grades
 * - ?section_id=X → ดึงเกรดทุกคนใน section (Admin only)
 * - ?student_id=X → ดึงเกรดของนักศึกษาคนนั้น
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const section_id = searchParams.get("section_id");
    const student_id = searchParams.get("student_id");

    // ดึงเกรดโดย section_id (Admin only)
    if (section_id) {
      if (user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      // ดึง section พร้อม term_id
      const sectionData = await prisma.section.findUnique({
        where: { section_id: parseInt(section_id) },
      });

      if (!sectionData) {
        return NextResponse.json(
          { message: "Section not found" },
          { status: 404 },
        );
      }

      // ดึง teams ใน section → project_ids
      const teams = await prisma.team.findMany({
        where: { section_id: parseInt(section_id) },
        include: {
          Project: true,
          Teammember: {
            include: {
              Users: {
                select: {
                  users_id: true,
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
      });

      const projectIds = teams
        .filter((t) => t.Project)
        .map((t) => t.Project!.project_id);

      // ดึงเกรดโดย filter ทั้ง project_id และ term_id
      const grades = await prisma.grade.findMany({
        where: {
          project_id: { in: projectIds },
          term_id: sectionData.term_id,
        },
        include: {
          Users_Grade_evaluator_idToUsers: {
            select: { firstname: true, lastname: true },
          },
          Users_Grade_student_idToUsers: {
            select: { users_id: true, firstname: true, lastname: true },
          },
          Project: {
            select: { project_id: true, projectname: true },
          },
          Term: {
            select: { term_id: true, semester: true, academicYear: true },
          },
        },
      });

      return NextResponse.json(grades);
    }

    // ดึงเกรดของนักศึกษาคนนั้น
    if (student_id) {
      // นักศึกษาดูได้เฉพาะของตัวเอง
      if (user.role === "STUDENT" && user.users_id !== student_id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const grades = await prisma.grade.findMany({
        where: { student_id },
        include: {
          Users_Grade_evaluator_idToUsers: {
            select: { firstname: true, lastname: true, titles: true },
          },
          Project: {
            select: { project_id: true, projectname: true },
          },
          Term: {
            select: { term_id: true, semester: true, academicYear: true },
          },
        },
      });

      return NextResponse.json(grades);
    }

    return NextResponse.json(
      { message: "section_id or student_id required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Get grades error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/grades
 * Batch save — ส่งเกรดหลายคนพร้อมกัน (Admin only)
 * ใช้ upsert: ถ้ามีอยู่แล้ว → อัปเดต, ไม่มี → สร้างใหม่
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { section_id, grades } = await req.json();

    if (!section_id || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { message: "section_id and grades array required" },
        { status: 400 },
      );
    }

    // ดึง term_id จาก section
    const section = await prisma.section.findUnique({
      where: { section_id: parseInt(section_id) },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    const term_id = section.term_id;
    const validScores = ["A", "B_PLUS", "B", "C_PLUS", "C", "D_PLUS", "D", "F"];

    const results = [];

    for (const grade of grades) {
      const { student_id, project_id, score } = grade;

      if (!student_id || !project_id || !score) {
        continue;
      }

      if (!validScores.includes(score)) {
        continue;
      }

      const pid =
        typeof project_id === "number" ? project_id : parseInt(project_id);

      // ตรวจสอบว่ามีเกรดอยู่แล้วไหม
      const existing = await prisma.grade.findFirst({
        where: {
          student_id,
          project_id: pid,
          term_id,
        },
      });

      if (existing) {
        // อัปเดตเกรดที่มีอยู่
        const updated = await prisma.grade.update({
          where: { grade_id: existing.grade_id },
          data: {
            score,
            evaluator_id: user.users_id,
          },
        });
        results.push(updated);
      } else {
        // สร้างเกรดใหม่
        const created = await prisma.grade.create({
          data: {
            student_id,
            project_id: pid,
            term_id,
            evaluator_id: user.users_id,
            score,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json({
      message: `บันทึกเกรดสำเร็จ ${results.length} รายการ`,
      count: results.length,
      grades: results,
    });
  } catch (error) {
    console.error("Save grades error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
