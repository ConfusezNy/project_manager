// src/app/providers.tsx
"use client";

/**
 * Providers — ครอบ App ด้วย Auth + Theme
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - เพิ่ม AuthProvider จาก lib/auth-context.tsx
 * - SessionProvider (NextAuth) ถูกลบออกจาก layout.tsx แล้ว
 */

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}