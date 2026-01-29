import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/**
 * GET /api/sections/my-section
 * ดึงรายวิชาที่นักศึกษากำลังเรียน (ผ่าน SectionEnrollment)
 */
export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // ดึง section ที่นักศึกษาลงทะเบียนเรียน
  const enrollment = await prisma.section_Enrollment.findFirst({
    where: {
      users_id: user.users_id,
    },
    include: {
      Section: {
        include: {
          Term: true,
        },
      },
    },
    orderBy: {
      section_id: "desc", // เอาล่าสุดก่อน
    },
  });

  if (!enrollment) {
    return NextResponse.json(
      { message: "No section enrollment found" },
      { status: 404 },
    );
  }

  return NextResponse.json(enrollment.Section);
}
