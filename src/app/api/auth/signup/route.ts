import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";
import { clearRefCode, getRefCode, setSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

async function findReferredById(refCode: string | null): Promise<string | null> {
  if (!refCode) return null;
  const referrer = await prisma.user.findUnique({
    where: { referralCode: refCode },
  });
  return referrer?.id ?? null;
}

async function generateUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const collision = await prisma.user.findUnique({
      where: { referralCode: code },
    });
    if (!collision) return code;
    code = generateReferralCode();
  }
  return code;
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

    // Start hashing password immediately — it's independent of referral/code checks
    const passwordHashPromise = hashPassword(password);

    // Read referral code from cookie (set by /r/[code] redirect)
    // Falls back to query param in case cookie wasn't set
    const refCodeFromCookie = await getRefCode();
    const refCodeFromBody = body.refCode;
    const refCode = refCodeFromCookie ?? refCodeFromBody ?? null;

    // Resolve referrer lookup, unique referral code generation, and password hashing in parallel
    const [referredById, newReferralCode, passwordHash] = await Promise.all([
      findReferredById(refCode),
      generateUniqueReferralCode(),
      passwordHashPromise,
    ]);

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
