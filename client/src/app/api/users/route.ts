import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    let users: any[] = [];

    if (user.role === "ADMIN" || user.role === "ADVISOR") {
      // Admin และ Advisor เห็น users ทั้งหมด
      const where: any = {};
      if (roleFilter && roleFilter !== "All") {
        where.role = roleFilter;
      }

      users = await prisma.users.findMany({
        where,
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
        orderBy: [{ role: "asc" }, { users_id: "asc" }],
      });
    } else {
      // Student เห็นเฉพาะคนใน Section เดียวกัน
      // หา sections ที่ student นี้ลงทะเบียนอยู่
      const enrollments = await prisma.section_Enrollment.findMany({
        where: { users_id: user.users_id },
        select: { section_id: true },
      });

      const sectionIds = enrollments.map((e) => e.section_id);

      if (sectionIds.length > 0) {
        users = await prisma.users.findMany({
          where: {
            Section_Enrollment: {
              some: {
                section_id: { in: sectionIds },
              },
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
          orderBy: [{ users_id: "asc" }],
        });
      }
    }

    // Format response
    const formattedUsers = users.map((u) => ({
      users_id: u.users_id,
      titles: u.titles,
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      tel_number: u.tel_number,
      role: u.role,
      profilePicture: u.profilePicture,
      sections: u.Section_Enrollment.map((e: any) => ({
        section_id: e.Section.section_id,
        section_code: e.Section.section_code,
        course_type: e.Section.course_type,
      })),
      teams: u.Teammember.map((t: any) => ({
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
