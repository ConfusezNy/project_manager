import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(req: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { teamId, teamname } = await req.json()
  if (!teamId || !teamname) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
  }

  const team = await prisma.team.update({
    where: { team_id: Number(teamId) },
    data: { teamname }
  })

  return NextResponse.json(team)
}
