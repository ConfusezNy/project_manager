import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/projects/[id]/advisor
 * เพิ่มอาจารย์ที่ปรึกษาให้โปรเจกต์
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const projectId = parseInt(params.id);
    const { advisor_id } = await req.json();

    if (!advisor_id) {
      return NextResponse.json({ 
        message: 'advisor_id required' 
      }, { status: 400 });
    }

    // ตรวจสอบว่าโปรเจกต์มีอยู่และ user เป็นสมาชิกของทีม
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        team: {
          include: {
            members: true
          }
        },
        advisors: true
      }
    });

    if (!project) {
      return NextResponse.json({ 
        message: 'Project not found' 
      }, { status: 404 });
    }

    // ตรวจสอบว่า user เป็นสมาชิกของทีม
    const isMember = project.team.members.some(
      (m) => m.user_id === user.user_id
    );

    if (!isMember) {
      return NextResponse.json({ 
        message: 'You are not a member of this team' 
      }, { status: 403 });
    }

    // ตรวจสอบว่าโปรเจกต์ยังไม่ได้รับการอนุมัติ
    if (project.status === 'APPROVED') {
      return NextResponse.json({ 
        message: 'Cannot change advisor for approved project' 
      }, { status: 403 });
    }

    // ตรวจสอบว่าอาจารย์ยังรับได้หรือไม่ (นับเฉพาะโปรเจกต์ที่อนุมัติแล้ว)
    const advisorProjectCount = await prisma.projectAdvisor.count({
      where: {
        advisor_id: advisor_id,
        project: {
          status: 'APPROVED'
        }
      }
    });

    if (advisorProjectCount >= 2) {
      return NextResponse.json({ 
        message: 'อาจารย์ท่านนี้รับโปรเจกต์เต็มแล้ว' 
      }, { status: 400 });
    }

    // ลบอาจารย์เก่าออก (ถ้ามี)
    await prisma.projectAdvisor.deleteMany({
      where: { project_id: projectId }
    });

    // เพิ่มอาจารย์ใหม่
    await prisma.projectAdvisor.create({
      data: {
        project_id: projectId,
        advisor_id: advisor_id
      }
    });

    // อัพเดทสถานะเป็น PENDING (มีอาจารย์แล้ว)
    await prisma.project.update({
      where: { project_id: projectId },
      data: { status: 'PENDING' }
    });

    return NextResponse.json({ 
      message: 'เพิ่มอาจารย์ที่ปรึกษาสำเร็จ' 
    });

  } catch (error) {
    console.error('Add advisor error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]/advisor
 * ลบอาจารย์ที่ปรึกษา (ถ้ายังไม่อนุมัติ)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projectId = parseInt(params.id);

    // ตรวจสอบโปรเจกต์และสิทธิ์
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        team: {
          include: {
            members: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ 
        message: 'Project not found' 
      }, { status: 404 });
    }

    const isMember = project.team.members.some(
      (m) => m.user_id === user.user_id
    );

    if (!isMember) {
      return NextResponse.json({ 
        message: 'You are not a member of this team' 
      }, { status: 403 });
    }

    if (project.status === 'APPROVED') {
      return NextResponse.json({ 
        message: 'Cannot remove advisor from approved project' 
      }, { status: 403 });
    }

    // ลบอาจารย์
    await prisma.projectAdvisor.deleteMany({
      where: { project_id: projectId }
    });

    // เปลี่ยนสถานะกลับเป็น DRAFT
    await prisma.project.update({
      where: { project_id: projectId },
      data: { status: 'DRAFT' }
    });

    return NextResponse.json({ 
      message: 'ลบอาจารย์ที่ปรึกษาแล้ว' 
    });

  } catch (error) {
    console.error('Remove advisor error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
