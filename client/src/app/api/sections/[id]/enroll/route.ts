import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
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

  const body = await req.json();
  const { users_ids } = body as { users_ids: string[] };

  if (!Array.isArray(users_ids) || users_ids.length === 0) {
    return NextResponse.json(
      { message: "users_ids must be a non-empty array" },
      { status: 400 },
    );
  }

  await prisma.section_Enrollment.createMany({
    data: users_ids.map((userId) => ({
      users_id: userId,
      section_id: sectionId,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    message: "Enroll completed",
    enrolledCount: users_ids.length,
  });
}
