/**
 * Middleware — Route protection + Role-based access
 *
 * ใช้ jose เพื่อ verify JWT signature จริง (ป้องกัน token tampering)
 * ถ้า signature ไม่ตรง → ถือว่า user = null → redirect ไป signin
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  exp: number;
}

// หน้าที่ไม่ต้อง login
const publicPaths = ["/signin", "/signup", "/forgot-password", "/reset-password"];

// JWT Secret — ต้องตรงกับ backend (docker-compose JWT_SECRET)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "p7TevVUKL215n9yzT7rSAWRlwGQgIaVvBKsmsW5+Ynud+gHg2Ruww/wDqNM="
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // เช็คว่าเป็น public path หรือไม่
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // อ่าน JWT จาก cookie แล้ว VERIFY signature
  const tokenCookie = request.cookies.get("access_token")?.value;
  let user: JwtPayload | null = null;

  if (tokenCookie) {
    try {
      const { payload } = await jwtVerify(tokenCookie, JWT_SECRET);
      // ตรวจ token หมดอายุ (jose ทำให้อัตโนมัติ แต่เช็คซ้ำเพื่อความชัดเจน)
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        user = payload as unknown as JwtPayload;
      }
    } catch {
      // signature ไม่ตรง หรือ token หมดอายุ → ถือว่าไม่ได้ login
      user = null;
    }
  }

  // ถ้ายังไม่ login + ไม่ใช่ public path → redirect to signin
  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // ถ้า login แล้ว + เข้า public path → redirect ตาม role
  if (isPublicPath && user) {
    const redirectPath =
      user.role === "ADMIN"
        ? "/admin-dashboard"
        : user.role === "ADVISOR"
          ? "/advisor-dashboard"
          : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Role-based route protection
  if (user) {
    // Admin routes
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      const redirectPath =
        user.role === "ADVISOR" ? "/advisor-dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Advisor routes
    if (pathname.startsWith("/advisor") && user.role !== "ADVISOR") {
      const redirectPath =
        user.role === "ADMIN" ? "/admin-dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Student routes (dashboard, tasks, events, teams, classmates)
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/teams") ||
        pathname.startsWith("/classmates")) &&
      user.role !== "STUDENT"
    ) {
      const redirectPath =
        user.role === "ADMIN" ? "/admin-dashboard" : "/advisor-dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
