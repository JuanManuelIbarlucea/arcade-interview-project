import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 422 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Use the same error message for missing user and wrong password
    // to prevent email enumeration attacks
    const INVALID_CREDENTIALS = "Invalid email or password";

    if (!user) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    await setSession({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
