import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      referralCode: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch click count and conversion count in parallel
  const [clicks, conversions] = await Promise.all([
    prisma.referralClick.count({ where: { userId: user.id } }),
    prisma.user.count({ where: { referredById: user.id } }),
  ]);

  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

  return NextResponse.json({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      clicks,
      conversions,
      conversionRate: Math.round(conversionRate * 10) / 10,
    },
  });
}
