import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ message: 'notificationId required' }, { status: 400 });
    }

    // ตรวจสอบว่า notification นี้เป็นของ user และเป็นคำเชิญเข้ากลุ่ม
    const notification = await prisma.notification.findFirst({
      where: {
        notification_id: notificationId,
        user_id: user.user_id,
        event_type: 'TEAM_INVITE',
        isRead: false
      }
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    // ลบ notification (หรือจะ update isRead = true ก็ได้)
    await prisma.notification.delete({
      where: {
        notification_id: notificationId
      }
    });

    return NextResponse.json({ 
      message: 'ปฏิเสธคำเชิญสำเร็จ'
    });

  } catch (error) {
    console.error('Reject invite error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
