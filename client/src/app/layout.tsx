import type { Metadata } from "next";
import { K2D } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import { Providers } from "./providers";

/**
 * Root Layout
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - ลบ SessionProvider (NextAuth) → ใช้ AuthProvider ใน providers.tsx แทน
 * - ลบ getServerSession() → ไม่ต้องดึง session จาก server แล้ว
 * - layout เป็น server component ได้เลย (ไม่ต้อง "use client")
 */

const k2d = K2D({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-k2d",
});

export const metadata: Metadata = {
  title: "Project Manager",
  description: "ระบบจัดการข้อมูลโครงงานนักศึกษา",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={k2d.className}>
        <Providers>
          <DashboardWrapper>{children}</DashboardWrapper>
        </Providers>
      </body>
    </html>
  );
}
