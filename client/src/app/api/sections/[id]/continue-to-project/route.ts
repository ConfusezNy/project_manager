import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/sections/[id]/continue-to-project
 * ต่อวิชาจาก PRE_PROJECT -> PROJECT (ย้ายทีมไปเทอมใหม่)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const sectionId = parseInt(params.id);
    const { new_term_id } = await req.json();

    if (!new_term_id) {
      return NextResponse.json(
        {
          message: "new_term_id is required",
        },
        { status: 400 },
      );
    }

    // 1. ดึง Section เดิมและเทอมใหม่
    const [oldSection, newTerm] = await Promise.all([
      prisma.section.findUnique({
        where: { section_id: sectionId },
        include: {
          Section_Enrollment: true,
          Team: {
            include: { Teammember: true },
          },
        },
      }),
      prisma.term.findUnique({
        where: { term_id: parseInt(new_term_id) },
      }),
    ]);

    if (!oldSection) {
      return NextResponse.json(
        {
          message: "Section not found",
        },
        { status: 404 },
      );
    }

    if (oldSection.course_type !== "PRE_PROJECT") {
      return NextResponse.json(
        {
          message: "Only PRE_PROJECT can continue to PROJECT",
        },
        { status: 400 },
      );
    }

    if (!newTerm) {
      return NextResponse.json(
        {
          message: "Term not found",
        },
        { status: 404 },
      );
    }

    // 2. สร้าง Section ใหม่ (PROJECT)
    const newSection = await prisma.section.create({
      data: {
        section_code: oldSection.section_code,
        course_type: "PROJECT",
        study_type: oldSection.study_type,
        term_id: parseInt(new_term_id),
        min_team_size: oldSection.min_team_size,
        max_team_size: oldSection.max_team_size,
        project_deadline: oldSection.project_deadline,
        team_deadline: oldSection.team_deadline,
      },
    });

    // 3. คัดลอก SectionEnrollment
    const enrollmentData = oldSection.Section_Enrollment.map((e) => ({
      users_id: e.users_id,
      section_id: newSection.section_id,
    }));

    if (enrollmentData.length > 0) {
      await prisma.section_Enrollment.createMany({
        data: enrollmentData,
      });
    }

    // 4. อัพเดท Team (ไม่ต้อง sync Teammember แล้ว เพราะ section_id อยู่ที่เดียว)
    for (const team of oldSection.Team) {
      // อัพเดท Team.section_id (Single Source of Truth)
      // Grade และ Task ไม่มี section_id - ถูกเชื่อมผ่าน Project -> Team -> Section
      await prisma.team.update({
        where: { team_id: team.team_id },
        data: {
          section_id: newSection.section_id,
        },
      });
    }

    // ✅ ไม่รีเซ็ตสถานะโปรเจกต์ - ใช้สถานะเดิมต่อ

    return NextResponse.json({
      message: "ต่อวิชาเรียบร้อย",
      new_section_id: newSection.section_id,
      enrollments: enrollmentData.length,
      teams: oldSection.Team.length,
    });
  } catch (error) {
    console.error("Continue to project error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
