import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

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
  });

  if (!section) {
    return NextResponse.json({ message: "Section not found" }, { status: 404 });
  }

  return NextResponse.json(section);
}

/**
 * DELETE /api/sections/[id]
 * ลบ Section (Admin only)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const sectionId = Number(params.id);

  if (isNaN(sectionId)) {
    return NextResponse.json(
      { message: "Invalid section id" },
      { status: 400 },
    );
  }

  try {
    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { section_id: sectionId },
      include: {
        Team: true,
        Section_Enrollment: true,
      },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    // Safety check: Don't allow delete if has teams
    if (section.Team.length > 0) {
      return NextResponse.json(
        {
          message: `ไม่สามารถลบได้ มี ${section.Team.length} ทีมใน Section นี้`,
          teams: section.Team.length,
        },
        { status: 400 },
      );
    }

    // Delete enrollments first (cascade)
    if (section.Section_Enrollment.length > 0) {
      await prisma.section_Enrollment.deleteMany({
        where: { section_id: sectionId },
      });
    }

    // Delete section
    await prisma.section.delete({
      where: { section_id: sectionId },
    });

    return NextResponse.json({
      message: "ลบ Section เรียบร้อย",
      deleted_section_id: sectionId,
    });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/sections/[id]
 * อัปเดต Section settings (Admin only)
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const sectionId = Number(params.id);

  if (isNaN(sectionId)) {
    return NextResponse.json(
      { message: "Invalid section id" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const { team_locked, project_deadline, min_team_size, max_team_size } =
      body;

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { section_id: sectionId },
    });

    if (!section) {
      return NextResponse.json(
        { message: "Section not found" },
        { status: 404 },
      );
    }

    // Build update data
    const updateData: any = {};
    if (typeof team_locked === "boolean") {
      updateData.team_locked = team_locked;
    }
    if (project_deadline) {
      updateData.project_deadline = new Date(project_deadline);
    }
    if (min_team_size !== undefined) {
      updateData.min_team_size = min_team_size;
    }
    if (max_team_size !== undefined) {
      updateData.max_team_size = max_team_size;
    }

    const updatedSection = await prisma.section.update({
      where: { section_id: sectionId },
      data: updateData,
      include: { Term: true },
    });

    return NextResponse.json({
      message: "อัปเดต Section เรียบร้อย",
      section: updatedSection,
    });
  } catch (error) {
    console.error("Patch section error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
