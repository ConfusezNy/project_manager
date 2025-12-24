import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getAuthUser() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  return session.user   
}

export async function requireAdmin() {
  const user = await getAuthUser()
  if (!user || user.role !== "ADMIN") return null
  return user
}

export async function requireAdvisorOrAdmin() {
  const user = await getAuthUser()
  if (!user || !["ADMIN", "ADVISOR"].includes(user.role)) return null
  return user
}