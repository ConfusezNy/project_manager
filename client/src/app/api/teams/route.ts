import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

// GET: ทีมที่ user เป็นสมาชิก
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: {
      Teammember: {
        some: { user_id: user.users_id },
      },
    },
    include: {
      Section: true,
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

  return NextResponse.json(teams);
}

// POST: student สร้างทีม (temp)
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { sectionId } = await req.json();
    console.log(
      `[POST /api/teams] User: ${user.users_id}, sectionId: ${sectionId}`,
    );

    if (!sectionId) {
      return NextResponse.json(
        { message: "sectionId is required" },
        { status: 400 },
      );
    }

    // Check if user is enrolled in this section first
    const enrollment = await prisma.section_Enrollment.findFirst({
      where: {
        section_id: Number(sectionId),
        users_id: user.users_id,
      },
    });

    if (!enrollment) {
      console.log(
        `[POST /api/teams] User ${user.users_id} not enrolled in section ${sectionId}`,
      );
      return NextResponse.json(
        { message: "คุณยังไม่ได้ลงทะเบียนในรายวิชานี้" },
        { status: 400 },
      );
    }

    // เช็กว่ามีทีมใน section นี้แล้วหรือยัง (ผ่าน team.section_id)
    const exists = await prisma.teammember.findFirst({
      where: {
        user_id: user.users_id,
        Team: { section_id: Number(sectionId) },
      },
    });

    if (exists) {
      console.log(
        `[POST /api/teams] User ${user.users_id} already has team in section ${sectionId}`,
      );
      return NextResponse.json(
        { message: "คุณมีทีมในรายวิชานี้แล้ว" },
        { status: 400 },
      );
    }

    console.log(
      `[POST /api/teams] Creating team for user ${user.users_id} in section ${sectionId}`,
    );

    // ดึง section info เพื่อเอา semester
    const section = await prisma.section.findUnique({
      where: { section_id: Number(sectionId) },
      include: { Term: true },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    // สร้างทีม temp
    const team = await prisma.team.create({
      data: {
        section_id: Number(sectionId),
        name: `Temporary Team`,
        groupNumber: `TEMP-${Date.now()}`,
        semester:
          section.Term?.semester && section.Term?.academicYear
            ? `${section.Term.semester}/${section.Term.academicYear}`
            : "1/2568",
      },
    });

    // เพิ่มตัวเองเป็นสมาชิก (ไม่ต้องใส่ section_id แล้ว)
    await prisma.teammember.create({
      data: {
        team_id: team.team_id,
        user_id: user.users_id,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 },
    );
  }
}
