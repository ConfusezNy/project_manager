// src/app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ต้องมี attribute="class" เพื่อให้ตรงกับ tailwind.config.js ที่ตั้ง darkMode: 'class'
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}