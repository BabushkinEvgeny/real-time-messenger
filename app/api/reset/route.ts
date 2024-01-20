import prisma from "@/app/libs/prismadb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, secretAnswer, newPassword } = body;

    if (!email || !secretAnswer || !newPassword) {
      return new NextResponse(`Bad Request: All fields are required: ${email} ${secretAnswer} ${newPassword}`, { status: 400 });
    }

    // Look up the user in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the secret answer
    // Consider hashing the secret answer if it's stored in hashed format
    if (user.secretAnswer !== secretAnswer) {
      return new NextResponse("Invalid secret answer", { status: 401 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    return new NextResponse("Password successfully changed", { status: 200 });
  } catch (error: any) {
    console.error(error, "PASSWORD CHANGE ERROR");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
