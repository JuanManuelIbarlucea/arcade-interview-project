import { prisma } from "@/lib/prisma";

export const INT_TEST_EMAIL_DOMAIN = "@int-test.local";

export function intTestEmail(label: string): string {
  return `${label}${INT_TEST_EMAIL_DOMAIN}`;
}

export async function wipeIntTestUsers(): Promise<void> {
  const rows = await prisma.user.findMany({
    where: { email: { endsWith: INT_TEST_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return;

  await prisma.user.updateMany({
    where: { referredById: { in: ids } },
    data: { referredById: null },
  });
  await prisma.referralClick.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
