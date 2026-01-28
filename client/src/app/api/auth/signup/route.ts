import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request) {
  try {
    console.log("Signup API called");
    const body = await request.json();
    console.log("Signup Body:", body);
    const { titles, firstname, lastname, tel_number, email, password } =
      body as {
        titles: string;
        firstname: string;
        lastname: string;
        tel_number: string;
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
        titles,
        users_id,
        firstname,
        lastname,
        tel_number,
        email,
        passwordHash: hashedPassword,
        role: "STUDENT", // ใส่ default role ได้ตรงนี้ (ถ้ามี enum)
      },
    });

    return Response.json(
      {
        message: "User created successfully",
        data: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return Response.json(
      { error: "Internal server error", detail: error },
      { status: 500 },
    );
  }
}
