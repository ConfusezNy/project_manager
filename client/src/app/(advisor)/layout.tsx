import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

export default async function AdvisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  
  if (!user || user.role !== "ADVISOR") {
    redirect("/")
  }

  return (
    <div>
      <div className="bg-blue-100 p-2 text-sm">Advisor Panel</div>
      {children}
    </div>
  )
}