import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  const enrollments = await prisma.section_Enrollment.findMany({
    where: { section_id: sectionId },
    include: {
      Users: {
        select: {
          users_id: true,
          firstname: true,
          lastname: true,
        },
      },
    },
    orderBy: {
      enrolledAt: "asc",
    },
  });

  return NextResponse.json(enrollments);
}
