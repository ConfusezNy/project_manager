import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

/**
 * POST /api/admin/teams/[teamId]/members
 * Admin: เพิ่มสมาชิกเข้าทีม
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;
  const teamIdNum = parseInt(teamId);

  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { message: "กรุณาระบุ user_id" },
        { status: 400 },
      );
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { team_id: teamIdNum },
      include: { Section: true },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if user exists and is a student
    const targetUser = await prisma.users.findUnique({
      where: { users_id: user_id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้ในระบบ" },
        { status: 404 },
      );
    }

    if (targetUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "สามารถเพิ่มได้เฉพาะนักศึกษาเท่านั้น" },
        { status: 400 },
      );
    }

    // Check if user is already in this team
    const existingMember = await prisma.teammember.findFirst({
      where: {
        team_id: teamIdNum,
        user_id: user_id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "ผู้ใช้นี้เป็นสมาชิกในทีมอยู่แล้ว" },
        { status: 400 },
      );
    }

    // Check if user is enrolled in this section
    const enrollment = await prisma.section_Enrollment.findFirst({
      where: {
        users_id: user_id,
        section_id: team.section_id,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "ผู้ใช้นี้ยังไม่ได้ลงทะเบียนใน Section นี้" },
        { status: 400 },
      );
    }

    // Check if user is already in another team in this section
    const existingTeamMember = await prisma.teammember.findFirst({
      where: {
        user_id: user_id,
        Team: {
          section_id: team.section_id,
        },
      },
    });

    if (existingTeamMember) {
      return NextResponse.json(
        { message: "ผู้ใช้นี้อยู่ในทีมอื่นใน Section เดียวกันแล้ว" },
        { status: 400 },
      );
    }

    // Add user to team
    const newMember = await prisma.teammember.create({
      data: {
        team_id: teamIdNum,
        user_id: user_id,
      },
      include: {
        Users: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "เพิ่มสมาชิกเรียบร้อย",
      member: newMember,
    });
  } catch (error) {
    console.error("Admin add team member error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/teams/[teamId]/members
 * Admin: ดึงรายชื่อสมาชิกในทีม
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;

  try {
    const members = await prisma.teammember.findMany({
      where: { team_id: parseInt(teamId) },
      include: {
        Users: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Admin get team members error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
