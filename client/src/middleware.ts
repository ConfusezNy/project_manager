import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // หน้าที่ไม่ต้อง login
  const publicPaths = ['/singin', '/api/auth','/api']
  
  // เช็คว่า path เริ่มด้วย public paths หรือไม่
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
 
  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL('/singin', request.url))
  }

 if (pathname.startsWith('/sections')) {
    if ((user as any).role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
 
  // ถ้าเข้า /protected แต่ไม่ใช่ admin
 

  return NextResponse.next()
}

// ⚠️ เพิ่ม config matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}