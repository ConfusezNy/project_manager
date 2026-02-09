import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ดึงเฉพาะ users ที่ลงทะเบียนใน Section
    const users = await prisma.users.findMany({
      where: {
        Section_Enrollment: {
          some: {}, // มี enrollment อย่างน้อย 1 รายการ
        },
      },
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
      orderBy: { users_id: "asc" },
    });

    // Format response with section info
    const formattedUsers = users.map((user) => ({
      users_id: user.users_id,
      titles: user.titles,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      tel_number: user.tel_number,
      role: user.role,
      profilePicture: user.profilePicture,
      sections: user.Section_Enrollment.map((e) => ({
        section_id: e.Section.section_id,
        section_code: e.Section.section_code,
        course_type: e.Section.course_type,
      })),
      teams: user.Teammember.map((t) => ({
        team_id: t.Team.team_id,
        name: t.Team.name,
        groupNumber: t.Team.groupNumber,
      })),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}
