"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Root page — redirect to role-specific dashboard
 * ถ้ายังไม่ login → redirect ไป /signin
 * ถ้า login แล้ว → redirect ตาม role
 */
export default function Home() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !user) {
      router.replace("/signin");
      return;
    }

    // Redirect based on role
    switch (user.role) {
      case "ADMIN":
        router.replace("/admin-dashboard");
        break;
      case "ADVISOR":
        router.replace("/advisor-dashboard");
        break;
      case "STUDENT":
      default:
        router.replace("/dashboard");
        break;
    }
  }, [user, status, router]);

  // Show loading while determining role
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </main>
  );
}
