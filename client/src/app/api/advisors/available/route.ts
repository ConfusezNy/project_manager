import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/advisors/available?project_id=X
 * ดึงรายชื่ออาจารย์ที่สามารถเลือกเป็นที่ปรึกษาได้
 * พร้อมนับจำนวนโปรเจกต์ที่รับอยู่
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get('project_id');

    // ดึงอาจารย์ทั้งหมด
    const advisors = await prisma.users.findMany({
      where: {
        role: 'ADVISOR'
      },
      select: {
        users_id: true,
        titles: true,
        firstname: true,
        lastname: true,
        email: true,
        profilePicture: true
      }
    });

    // นับโปรเจกต์ที่อนุมัติแล้วของแต่ละอาจารย์
    const advisorsWithCount = await Promise.all(
      advisors.map(async (advisor) => {
        const projectCount = await prisma.projectAdvisor.count({
          where: {
            advisor_id: advisor.users_id,
            project: {
              status: 'APPROVED'
            }
          }
        });

        return {
          ...advisor,
          currentProjects: projectCount
        };
      })
    );

    // Logic: อาจารย์เลือกได้ตามปกติ (ไม่เกิน 2 โปรเจกต์)
    const advisorsAvailable = advisorsWithCount.map(advisor => ({
      ...advisor,
      canSelect: advisor.currentProjects < 2,
      reason: advisor.currentProjects >= 2 
        ? 'รับโปรเจกต์เต็มแล้ว (2/2)'
        : null
    }));

    // เรียงตามจำนวนโปรเจกต์น้อยไปมาก
    advisorsAvailable.sort((a, b) => a.currentProjects - b.currentProjects);

    return NextResponse.json(advisorsAvailable);

  } catch (error) {
    console.error('Get available advisors error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
