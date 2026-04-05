import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

export async function GET() {
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
}
