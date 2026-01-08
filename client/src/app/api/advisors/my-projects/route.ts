import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/advisors/my-projects
 * ดึงรายการโปรเจกต์ที่อาจารย์เป็นที่ปรึกษา
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'ADVISOR') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    // ดึงโปรเจกต์ที่อาจารย์เป็นที่ปรึกษา
    const projectAdvisors = await prisma.projectAdvisor.findMany({
      where: {
        advisor_id: user.user_id
      },
      include: {
        project: {
          include: {
            team: {
              include: {
                section: {
                  include: {
                    term: true
                  }
                },
                members: {
                  include: {
                    user: {
                      select: {
                        users_id: true,
                        firstname: true,
                        lastname: true,
                        email: true,
                        titles: true
                      }
                    }
                  }
                }
              }
            },
            advisors: {
              include: {
                advisor: {
                  select: {
                    users_id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    titles: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        project: {
          createdAt: 'desc'
        }
      }
    });

    // Map ข้อมูลให้อยู่ในรูปแบบที่ใช้งานง่าย
    const projects = projectAdvisors.map(pa => pa.project);

    return NextResponse.json(projects);

  } catch (error) {
    console.error('Get advisor projects error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
