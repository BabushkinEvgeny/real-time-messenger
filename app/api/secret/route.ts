import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Parse the query string to get the email
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new NextResponse("Bad Request: Email is required", { status: 400 });
    }

    // Look up the user in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        secretQuestion: true, // Only select the secret question
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Return the secret question
    return new NextResponse(JSON.stringify({ secretQuestion: user.secretQuestion }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error(error, "ERROR FETCHING SECRET QUESTION");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
