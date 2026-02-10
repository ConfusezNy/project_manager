import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * ดึงข้อมูล user รายบุคคล
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const targetUser = await prisma.users.findUnique({
      where: { users_id: id },
      include: {
        Section_Enrollment: {
          include: {
            Section: {
              select: {
                section_id: true,
                section_code: true,
                course_type: true,
              },
            },
          },
        },
        Teammember: {
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

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      users_id: targetUser.users_id,
      titles: targetUser.titles,
      firstname: targetUser.firstname,
      lastname: targetUser.lastname,
      email: targetUser.email,
      tel_number: targetUser.tel_number,
      role: targetUser.role,
      profilePicture: targetUser.profilePicture,
      sections: targetUser.Section_Enrollment.map((e) => ({
        section_id: e.Section.section_id,
        section_code: e.Section.section_code,
        course_type: e.Section.course_type,
      })),
      teams: targetUser.Teammember.map((t) => ({
        team_id: t.Team.team_id,
        name: t.Team.name,
        groupNumber: t.Team.groupNumber,
      })),
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Admin: อัปเดตข้อมูล user (รวมถึง role)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { role, firstname, lastname, email, tel_number, titles } = body;

    // Check if user exists
    const targetUser = await prisma.users.findUnique({
      where: { users_id: id },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Validate role
    const validRoles = ["ADMIN", "ADVISOR", "STUDENT"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (firstname !== undefined) updateData.firstname = firstname;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (email !== undefined) updateData.email = email;
    if (tel_number !== undefined) updateData.tel_number = tel_number;
    if (titles !== undefined) updateData.titles = titles;

    const updatedUser = await prisma.users.update({
      where: { users_id: id },
      data: updateData,
    });

    return NextResponse.json({
      message: "อัปเดตข้อมูลผู้ใช้เรียบร้อย",
      user: {
        users_id: updatedUser.users_id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Patch user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Admin: ลบ user
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Check if user exists
    const targetUser = await prisma.users.findUnique({
      where: { users_id: id },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (id === user.users_id) {
      return NextResponse.json(
        { message: "ไม่สามารถลบบัญชีของตัวเองได้" },
        { status: 400 },
      );
    }

    // Delete related records first
    await prisma.section_Enrollment.deleteMany({
      where: { users_id: id },
    });

    await prisma.teammember.deleteMany({
      where: { user_id: id },
    });

    // Delete user
    await prisma.users.delete({
      where: { users_id: id },
    });

    return NextResponse.json({
      message: "ลบผู้ใช้เรียบร้อย",
      deleted_user_id: id,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
