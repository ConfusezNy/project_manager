import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstname, lastname, email, password } = body as {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
    };

    // สร้าง users_id จากอีเมล เช่น 116630462036-0
    const users_id = email.split("@")[0].trim();

    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // บันทึกลง DB
    const newUser = await prisma.users.create({
      data: {
        users_id,
        firstname,
        lastname,
        email,
        passwordHash: hashedPassword,
        role: "STUDENT"   // ใส่ default role ได้ตรงนี้ (ถ้ามี enum)
      }
    });

    return Response.json(
      {
        message: "User created successfully",
        data: newUser
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup Error:", error);
    return Response.json(
      { error: "Internal server error", detail: error },
      { status: 500 }
    );
  }
}
