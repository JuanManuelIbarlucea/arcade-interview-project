import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";
import { clearRefCode, getRefCode, setSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 422 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address", field: "email" }, { status: 422 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters", field: "password" },
        { status: 422 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters", field: "name" },
        { status: 422 }
      );
    }

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists", field: "email" },
        { status: 409 }
      );
    }

    // Read referral code from cookie (set by /r/[code] redirect)
    // Falls back to query param in case cookie wasn't set
    const refCodeFromCookie = await getRefCode();
    const refCodeFromBody = body.refCode;
    const refCode = refCodeFromCookie ?? refCodeFromBody ?? null;

    let referredById: string | null = null;

    if (refCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: refCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Generate a unique referral code with collision retry
    let newReferralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const collision = await prisma.user.findUnique({
        where: { referralCode: newReferralCode },
      });
      if (!collision) break;
      newReferralCode = generateReferralCode();
      attempts++;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash,
        referralCode: newReferralCode,
        ...(referredById ? { referredById } : {}),
      },
    });

    // Clear the referral cookie after use
    if (refCodeFromCookie) {
      await clearRefCode();
    }

    await setSession({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
