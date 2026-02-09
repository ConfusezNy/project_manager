import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events?section_id=X
 * ดึงรายการ Event (กำหนดการ) ของ Section
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const section_id = searchParams.get("section_id");

  if (!section_id) {
    return NextResponse.json(
      { message: "section_id is required" },
      { status: 400 },
    );
  }

  try {
    // ตรวจสอบว่ามี Section นี้จริง
    const section = await prisma.section.findUnique({
      where: { section_id: parseInt(section_id) },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    const events = await prisma.event.findMany({
      where: { section_id: parseInt(section_id) },
      orderBy: { order: "asc" },
      include: {
        Submission: {
          include: {
            Team: {
              select: {
                team_id: true,
                name: true,
                groupNumber: true,
              },
            },
          },
        },
        _count: {
          select: {
            Submission: true,
          },
        },
      },
    });

    // คำนวณสถิติสำหรับแต่ละ event
    const eventsWithStats = events.map((event) => {
      const totalTeams = event.Submission.length;
      const submitted = event.Submission.filter(
        (s) => s.status === "SUBMITTED" || s.status === "APPROVED",
      ).length;
      const approved = event.Submission.filter(
        (s) => s.status === "APPROVED",
      ).length;

      return {
        ...event,
        stats: {
          totalTeams,
          submitted,
          approved,
          pending: totalTeams - submitted,
        },
      };
    });

    return NextResponse.json(eventsWithStats);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/events
 * สร้าง Event ใหม่ (Admin only)
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only Admin can create events
  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      type,
      description,
      order,
      dueDate,
      section_id,
      createSubmissionsForAllTeams,
    } = body;

    // Validate required fields
    if (!name || !type || order === undefined || !dueDate || !section_id) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: name, type, order, dueDate, section_id",
        },
        { status: 400 },
      );
    }

    // Validate EventType
    const validTypes = [
      "PROGRESS_REPORT",
      "DOCUMENT",
      "POSTER",
      "EXAM",
      "FINAL_SUBMISSION",
      "SEMINAR",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 },
      );
    }

    // Check section exists
    const section = await prisma.section.findUnique({
      where: { section_id: parseInt(section_id) },
      include: {
        Team: true,
      },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        type,
        description: description || null,
        order: parseInt(order),
        dueDate: new Date(dueDate),
        section_id: parseInt(section_id),
      },
    });

    // Optionally create submissions for all teams in section
    if (createSubmissionsForAllTeams && section.Team.length > 0) {
      await prisma.submission.createMany({
        data: section.Team.map((team) => ({
          event_id: event.event_id,
          team_id: team.team_id,
          status: "PENDING",
        })),
      });
    }

    // Return created event with submissions
    const eventWithSubmissions = await prisma.event.findUnique({
      where: { event_id: event.event_id },
      include: {
        Submission: {
          include: {
            Team: {
              select: {
                team_id: true,
                name: true,
                groupNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(eventWithSubmissions, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
