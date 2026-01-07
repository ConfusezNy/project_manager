import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: any) {
  try {
    // ดึงข้อมูลทั้งหมดจากตาราง users
    const users = await prisma.users.findMany({
      orderBy: { users_id: 'asc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}