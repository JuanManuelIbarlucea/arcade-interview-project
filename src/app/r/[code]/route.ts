import { prisma } from "@/lib/prisma";
import { REF_COOKIE } from "@/lib/session";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Find the user who owns this referral code
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });

  if (!referrer) {
    // Invalid code — just redirect to signup without attribution
    return NextResponse.redirect(new URL("/signup", appUrl));
  }

  // Record the click
  const headersList = await headers();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = headersList.get("user-agent") ?? null;

  await prisma.referralClick.create({
    data: {
      userId: referrer.id,
      ip,
      userAgent,
    },
  });

  // Set a short-lived cookie to carry the referral code through to signup
  const response = NextResponse.redirect(new URL("/signup", appUrl));
  response.cookies.set(REF_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}
