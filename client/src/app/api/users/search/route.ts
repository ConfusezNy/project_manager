import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const users_id = searchParams.get("id");

    if (!users_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const user = await prisma.users.findUnique({
      where: { users_id: users_id },
      select: {
        users_id: true,
        firstname: true,
        lastname: true,
        teamId: true,
        role: true
      }
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}