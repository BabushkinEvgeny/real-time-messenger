import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, secretQuestion, secretAnswer } = body;
    if (!email || !name || !password || !secretAnswer || !secretQuestion) {
        console.log("Не достаточно данных")
      return new NextResponse("Bad Request", { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        secretQuestion,
        secretAnswer,
      },
    });
    console.log(user);
    console.log("success")
    return NextResponse.json(user);
  } catch (error: any) {
    console.log(error, "REGISTRARION ERROR");
    return new NextResponse("Interval server error", { status: 500 });
  }
}
