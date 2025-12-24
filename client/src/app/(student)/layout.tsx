import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  
  if (!user || user.role !== "STUDENT") {
    redirect("/")
  }

  return (
    <div>
      <div className="bg-green-100 p-2 text-sm">Student Panel</div>
      {children}
    </div>
  )
}