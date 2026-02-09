import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/submissions/[id]/approve
 * อาจารย์อนุมัติงาน
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only ADVISOR or ADMIN can approve
  if (user.role !== "ADVISOR" && user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Forbidden: Only advisors can approve submissions" },
      { status: 403 },
    );
  }

  const submissionId = parseInt(params.id);

  try {
    const body = await req.json();
    const { feedback } = body;

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
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: user.users_id,
        feedback: feedback || null,
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
        ApprovedByUser: {
          select: {
            users_id: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
