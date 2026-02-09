import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/submissions/[id]/reject
 * อาจารย์ขอให้แก้ไขงาน
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only ADVISOR or ADMIN can reject
  if (user.role !== "ADVISOR" && user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Forbidden: Only advisors can reject submissions" },
      { status: 403 },
    );
  }

  const submissionId = parseInt(params.id);

  try {
    const body = await req.json();
    const { feedback } = body;

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback is required when rejecting" },
        { status: 400 },
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }

    // อัปเดต submission
    const updatedSubmission = await prisma.submission.update({
      where: { submission_id: submissionId },
      data: {
        status: "NEEDS_REVISION",
        feedback,
        // Reset approval fields
        approvedAt: null,
        approvedBy: null,
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
    console.error("Error rejecting submission:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
