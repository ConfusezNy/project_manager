import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/submissions/[id]/submit
 * นักศึกษาส่งงาน
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const submissionId = parseInt(params.id);

  try {
    // ดึง submission และตรวจสอบสิทธิ์
    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      include: {
        Team: {
          include: {
            Teammember: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const isMember = submission.Team.Teammember.some(
      (m) => m.user_id === user.users_id,
    );

    if (!isMember && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden: You are not a member of this team" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { file } = body;

    // อัปเดต submission
    const updatedSubmission = await prisma.submission.update({
      where: { submission_id: submissionId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        file: file || null,
      },
      include: {
        Event: {
          select: {
            event_id: true,
            name: true,
            type: true,
          },
        },
        Team: {
          select: {
            team_id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("Error submitting:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
