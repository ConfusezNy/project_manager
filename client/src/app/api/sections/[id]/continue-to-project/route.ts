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
    const { new_term_id, team_ids } = await req.json();

    if (!new_term_id) {
      return NextResponse.json(
        {
          message: "new_term_id is required",
        },
        { status: 400 },
      );
    }

    // Validate team_ids if provided
    if (team_ids !== undefined && !Array.isArray(team_ids)) {
      return NextResponse.json(
        {
          message: "team_ids must be an array of team IDs",
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
        team_locked: oldSection.team_locked,
      },
    });

    // 3. กรอง Team ที่จะย้าย
    const teamsToMove = team_ids
      ? oldSection.Team.filter((t) => team_ids.includes(t.team_id))
      : oldSection.Team;

    if (teamsToMove.length === 0) {
      return NextResponse.json(
        {
          message: "ไม่มีทีมที่เลือกอยู่ใน Section นี้",
        },
        { status: 400 },
      );
    }

    // 4. รวบรวม user_id ของสมาชิกใน Team ที่จะย้าย
    const memberUserIds = new Set<string>();
    for (const team of teamsToMove) {
      for (const member of team.Teammember) {
        memberUserIds.add(member.user_id);
      }
    }

    // 5. คัดลอก SectionEnrollment เฉพาะสมาชิกที่เลือก
    const enrollmentData = oldSection.Section_Enrollment.filter((e) =>
      memberUserIds.has(e.users_id),
    ).map((e) => ({
      users_id: e.users_id,
      section_id: newSection.section_id,
    }));

    if (enrollmentData.length > 0) {
      await prisma.section_Enrollment.createMany({
        data: enrollmentData,
        skipDuplicates: true,
      });
    }

    // 6. อัพเดท Team (เฉพาะที่เลือก)
    for (const team of teamsToMove) {
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
      teams_moved: teamsToMove.length,
      teams_total: oldSection.Team.length,
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
