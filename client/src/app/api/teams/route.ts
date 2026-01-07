import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- ส่วนดึงข้อมูลกลุ่มทั้งหมด (GET) ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // ตรวจสอบว่าเป็น ADMIN หรือไม่
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");

    const teams = await prisma.team.findMany({
      where: term ? { semester: term } : {},
      include: {
        members: true, // ดึงข้อมูลสมาชิกในกลุ่ม
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

// --- ส่วนสร้างกลุ่มใหม่ (POST) ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const body = await req.json();
    const userEmail = session.user.email;

    // 1. ค้นหาข้อมูล User และเช็คว่ามีกลุ่มหรือยัง
    const user = await prisma.users.findUnique({
      where: { email: userEmail },
      select: { users_id: true, teamId: true } // ใช้ users_id ให้ตรงตาม Schema
    });

    if (user?.teamId) {
      return NextResponse.json({ error: "คุณมีกลุ่มอยู่แล้ว" }, { status: 400 });
    }

    // 2. 🛡️ แก้ไขปัญหา Section: ค้นหาหมู่เรียนที่มีอยู่ในระบบก่อน
    // ป้องกันการ Hardcode เลข 1 แล้วบันทึกไม่ผ่านเพราะไม่มีข้อมูลในตาราง Section
    const existingSection = await prisma.section.findFirst();
    
    if (!existingSection) {
      return NextResponse.json({ 
        error: "ไม่สามารถสร้างกลุ่มได้เนื่องจากยังไม่มีข้อมูล 'หมู่เรียน' (Section) ในฐานข้อมูล กรุณาติดต่อ Admin เพื่อเพิ่ม Section ก่อน" 
      }, { status: 400 });
    }

    // 3. สร้างเลขกลุ่มอัตโนมัติ (เช่น CPE-68-001)
    const groupCount = await prisma.team.count();
    const groupNumber = `CPE-68-${(groupCount + 1).toString().padStart(3, '0')}`;

    // 4. บันทึกข้อมูลกลุ่มใหม่
    const newTeam = await prisma.team.create({
      data: {
        name: body.name,
        groupNumber: groupNumber,
        semester: body.semester,
        topicThai: body.topicThai,
        description: body.description,
        // ผูกกับ Section ID ที่หาได้จากข้อ 2
        section_id: existingSection.section_id, 
        // ผูกสมาชิกคนแรก (หัวหน้ากลุ่ม) เข้ากับ Users ทันที
        members: {
          connect: { users_id: user?.users_id }
        }
      }
    });

    return NextResponse.json(newTeam);
  } catch (error: any) {
    console.error("Create Team Error Details:", error);
    return NextResponse.json({ 
      error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (error.message || "Unknown Error") 
    }, { status: 500 });
  }
}