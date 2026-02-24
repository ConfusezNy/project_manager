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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* ต้องมี attribute="class" เพื่อให้ตรงกับ tailwind.config.js ที่ตั้ง darkMode: 'class' */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}