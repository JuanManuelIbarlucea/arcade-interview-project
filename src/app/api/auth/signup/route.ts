import { Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";
import { clearRefCode, getRefCode, setSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

// TODO: Add rate limiting to prevent abuse (e.g., 3 signups per hour per IP)

async function findReferredById(refCode: string | null): Promise<string | null> {
  if (!refCode) return null;
  // Only select `id` — we don't need the full user record
  const referrer = await prisma.user.findUnique({
    where: { referralCode: refCode },
    select: { id: true },
  });
  return referrer?.id ?? null;
}

async function generateUniqueReferralCode(): Promise<string> {
  const MAX_ATTEMPTS = 5;
  for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
    const code = generateReferralCode();
    // Use count instead of findUnique to avoid transferring row data — we only need existence
    const exists = await prisma.user.count({
      where: { referralCode: code },
    });
    if (exists === 0) return code;
  }
  throw new Error("Failed to generate a unique referral code after maximum attempts");
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
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true,
        createdAt: true,
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const meta = error.meta as {
        target?: unknown;
        driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } };
      };
      const legacyTarget = meta?.target;
      const legacyFields =
        Array.isArray(legacyTarget) ? legacyTarget : legacyTarget != null ? [legacyTarget] : [];
      const adapterFields = meta?.driverAdapterError?.cause?.constraint?.fields ?? [];
      const conflictFields = [...legacyFields.map(String), ...adapterFields];
      if (conflictFields.includes("email")) {
        return NextResponse.json(
          { error: "An account with this email already exists", field: "email" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
