import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events/[id]
 * ดึงข้อมูล Event เดียว พร้อม submissions
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const eventId = parseInt(params.id);

  try {
    const event = await prisma.event.findUnique({
      where: { event_id: eventId },
      include: {
        Section: true,
        Submission: {
          include: {
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
        },
      },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/events/[id]
 * แก้ไข Event (Admin only)
 */
export async function PUT(
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

  const eventId = parseInt(params.id);

  try {
    const body = await req.json();
    const { name, type, description, order, dueDate } = body;

    const event = await prisma.event.update({
      where: { event_id: eventId },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/events/[id]
 * Partial update Event (Admin only)
 */
export async function PATCH(
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

  const eventId = parseInt(params.id);

  try {
    const body = await req.json();
    const { name, type, description, order, dueDate } = body;

    const event = await prisma.event.update({
      where: { event_id: eventId },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/events/[id]
 * ลบ Event (Admin only)
 */
export async function DELETE(
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

  const eventId = parseInt(params.id);

  try {
    // Delete submissions first (cascade)
    await prisma.submission.deleteMany({
      where: { event_id: eventId },
    });

    // Delete event
    await prisma.event.delete({
      where: { event_id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
