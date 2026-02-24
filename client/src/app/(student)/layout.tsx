/**
 * Student Layout
 * - เดิม: getAuthUser() จาก @/lib/auth (NextAuth server-side)
 * - ใหม่: auth ตรวจสอบที่ middleware.ts + useAuth() ในแต่ละ page
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
