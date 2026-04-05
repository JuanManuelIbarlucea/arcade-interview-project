import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex < 0) return "***";
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await prisma.user.findMany({
      where: { referredById: session.sub },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      referrals: referrals.map((r) => ({
        id: r.id,
        name: r.name,
        email: maskEmail(r.email),
        createdAt: r.createdAt.toISOString(),
      })),
      total: referrals.length,
    });
  } catch (error) {
    console.error("GET /api/referrals error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
