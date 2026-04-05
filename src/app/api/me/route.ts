import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Single query: fetch user fields + relation counts via _count
    // Eliminates two separate COUNT queries (N+1 prevention)
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true,
        createdAt: true,
        _count: {
          select: {
            referralClicks: true,
            referrals: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clicks = user._count.referralClicks;
    const conversions = user._count.referrals;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        createdAt: user.createdAt.toISOString(),
      },
      stats: {
        clicks,
        conversions,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error("GET /api/me error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
