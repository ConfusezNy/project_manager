/**
 * Middleware — Route protection + Role-based access
 * ย้ายมาจาก: client/src/middleware.ts (เวอร์ชัน NextAuth)
 *
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - เดิม: ใช้ getToken() จาก next-auth/jwt
 * - ใหม่: อ่าน JWT จาก cookie 'access_token' + decode ด้วย jwt-decode
 * - ใช้ jwt-decode (ไม่ verify signature) เพราะ middleware ทำหน้าที่แค่ route guard
 * - การ verify จริงอยู่ที่ NestJS backend (JwtStrategy)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  exp: number;
}

// หน้าที่ไม่ต้อง login
const publicPaths = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // เช็คว่าเป็น public path หรือไม่
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // อ่าน JWT จาก cookie
  const tokenCookie = request.cookies.get("access_token")?.value;
  let user: JwtPayload | null = null;

  if (tokenCookie) {
    try {
      const decoded = jwtDecode<JwtPayload>(tokenCookie);
      // เช็ค token หมดอายุ
      if (decoded.exp * 1000 > Date.now()) {
        user = decoded;
      }
    } catch {
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

    // Student routes (dashboard, tasks, events, teams)
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/Teams")) &&
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
     * - api routes (ถ้ายังมี Next.js API routes เหลืออยู่)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
