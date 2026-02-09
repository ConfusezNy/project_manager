import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

/**
 * GET /api/admin/teams/[teamId]/available-members
 * Admin: ดึงรายชื่อนักศึกษาที่สามารถเพิ่มเข้าทีมได้
 * (ลงทะเบียนใน Section เดียวกัน และยังไม่อยู่ในทีมใด)
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
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    // Get team's section
    const team = await prisma.team.findUnique({
      where: { team_id: parseInt(teamId) },
      select: { section_id: true },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Get users enrolled in this section who are NOT in any team
    const enrolledUsers = await prisma.section_Enrollment.findMany({
      where: {
        section_id: team.section_id,
        Users: {
          role: "STUDENT",
          OR: search
            ? [
                { firstname: { contains: search, mode: "insensitive" } },
                { lastname: { contains: search, mode: "insensitive" } },
                { users_id: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ]
            : undefined,
        },
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

    // Filter out users who are already in a team in this section
    const usersWithTeam = await prisma.teammember.findMany({
      where: {
        Team: {
          section_id: team.section_id,
        },
      },
      select: {
        user_id: true,
      },
    });

    const usersInTeamIds = new Set(usersWithTeam.map((m) => m.user_id));

    const availableUsers = enrolledUsers
      .filter((e) => !usersInTeamIds.has(e.Users.users_id))
      .map((e) => e.Users);

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error("Admin get available members error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
