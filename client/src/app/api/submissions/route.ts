import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/submissions?event_id=X or ?team_id=X
 * ดึงรายการ Submission
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const event_id = searchParams.get("event_id");
  const team_id = searchParams.get("team_id");

  try {
    const where: any = {};

    if (event_id) {
      where.event_id = parseInt(event_id);
    }

    if (team_id) {
      where.team_id = parseInt(team_id);
    }

    // ถ้าเป็น Student ให้ดูได้เฉพาะของตัวเอง
    if (user.role === "STUDENT") {
      const teammember = await prisma.teammember.findFirst({
        where: { user_id: user.users_id },
      });

      if (teammember) {
        where.team_id = teammember.team_id;
      } else {
        return NextResponse.json([]);
      }
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        Event: {
          select: {
            event_id: true,
            name: true,
            type: true,
            dueDate: true,
            order: true,
            description: true,
            Section: {
              select: {
                section_id: true,
                section_code: true,
                course_type: true,
                Term: {
                  select: {
                    term_id: true,
                    semester: true,
                    academicYear: true,
                  },
                },
              },
            },
          },
        },
        Team: {
          select: {
            team_id: true,
            name: true,
            groupNumber: true,
          },
        },
        ApprovedByUser: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: [
        { Event: { Section: { section_code: "asc" } } },
        { Event: { order: "asc" } },
      ],
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
