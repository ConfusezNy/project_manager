import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/");
  }

  return <div>{children}</div>;
}
