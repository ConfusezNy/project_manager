import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  
  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div>
      <div className="bg-red-100 p-2 text-sm">Admin Panel</div>
      {children}
    </div>
  )
}