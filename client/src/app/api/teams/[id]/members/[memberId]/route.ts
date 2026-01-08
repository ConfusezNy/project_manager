import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/teams/[id]/members/[memberId]
 * ลบสมาชิกออกจากทีม (ทำได้ก่อนโปรเจกต์อนุมัติ)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const teamId = parseInt(params.id);
    const memberUserId = params.memberId;

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const membership = await prisma.teammember.findFirst({
      where: {
        team_id: teamId,
        user_id: user.user_id
      }
    });

    if (!membership) {
      return NextResponse.json({ 
        message: 'You are not a member of this team' 
      }, { status: 403 });
    }

    // ตรวจสอบว่าทีมมีโปรเจกต์และสถานะ
    const team = await prisma.team.findUnique({
      where: { team_id: teamId },
      include: {
        project: true,
        members: true
      }
    });

    if (!team) {
      return NextResponse.json({ 
        message: 'Team not found' 
      }, { status: 404 });
    }

    // ตรวจสอบว่าโปรเจกต์ยังไม่ได้รับการอนุมัติ
    if (team.project && team.project.status === 'APPROVED') {
      return NextResponse.json({ 
        message: 'ไม่สามารถลบสมาชิกได้หลังจากโปรเจกต์ได้รับการอนุมัติแล้ว' 
      }, { status: 403 });
    }

    // ตรวจสอบว่ามีสมาชิกเหลืออย่างน้อย 2 คน
    if (team.members.length <= 1) {
      return NextResponse.json({ 
        message: 'ไม่สามารถลบสมาชิกได้ ต้องมีสมาชิกอย่างน้อย 1 คน' 
      }, { status: 400 });
    }

    // ลบสมาชิก
    await prisma.teammember.delete({
      where: {
        team_id_user_id: {
          team_id: teamId,
          user_id: memberUserId
        }
      }
    });

    return NextResponse.json({ 
      message: 'ลบสมาชิกออกจากทีมสำเร็จ' 
    });

  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
