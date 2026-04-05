import { prisma } from "@/lib/prisma";
import { REF_COOKIE } from "@/lib/session";
import { after } from "next/server";
import { type NextRequest, NextResponse } from "next/server";

// Referral codes are 8-character uppercase alphanumeric strings
const REFERRAL_CODE_PATTERN = /^[0-9A-Z]{8}$/;

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const appUrl = process.env.VERCEL_URL ?? "http://localhost:3000";
  const signupUrl = new URL("/signup", appUrl);

  try {
    // Validate referral code format before hitting the database
    if (!REFERRAL_CODE_PATTERN.test(code)) {
      return NextResponse.redirect(signupUrl);
    }

    // Find the user who owns this referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!referrer) {
      // Invalid code — just redirect to signup without attribution
      return NextResponse.redirect(signupUrl);
    }

    // Capture request metadata before the response is sent
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent") ?? null;
    const referrerId = referrer.id;

    // Record the click after the redirect response is sent (non-blocking)
    after(async () => {
      try {
        await prisma.referralClick.create({
          data: {
            userId: referrerId,
            ip,
            userAgent,
          },
        });
      } catch (clickError) {
        // Log but don't propagate — click tracking should never break the user flow
        console.error("Failed to record referral click:", clickError);
      }
    });

    // Set a short-lived cookie to carry the referral code through to signup
    const response = NextResponse.redirect(signupUrl);
    response.cookies.set(REF_COOKIE, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Referral redirect error:", error);
    // On any error, gracefully redirect to signup without attribution
    return NextResponse.redirect(signupUrl);
  }
}
