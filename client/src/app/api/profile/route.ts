import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(); // ดึงข้อมูลผู้ใช้ที่ Login อยู่
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const body = await req.json();
    const { firstname, lastname, tel_number, profilePicture } = body;

    // ตรวจสอบความยาวเบอร์โทรศัพท์ (Schema จำกัดไว้ที่ 10 หลัก)
    if (tel_number && tel_number.length > 10) {
      return NextResponse.json({ error: "เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก" }, { status: 400 });
    }

    const updatedUser = await prisma.users.update({
      where: { email: session.user.email },
      data: {
        firstname,
        lastname,
        tel_number,    // ต้องตรงกับ Schema
        profilePicture, // ต้องตรงกับ Schema
      },
    });

    return NextResponse.json({ message: "บันทึกสำเร็จ", data: updatedUser });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}