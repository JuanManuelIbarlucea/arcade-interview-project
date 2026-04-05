import { ReferralLinkCard } from "@/components/dashboard/referral-link-card";
import { ReferralsTable } from "@/components/dashboard/referrals-table";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/session";
import type { MeResponse, ReferredUser } from "@/types";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard — ArcadeApp",
};

async function getDashboardData(): Promise<{
  me: MeResponse;
  referrals: ReferredUser[];
}> {
  const session = await getSession();
  if (!session) redirect("/signin");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [meRes, referralsRes] = await Promise.all([
    fetch(`${appUrl}/api/me`, {
      headers: { Cookie: `session=${await getSessionToken()}` },
      cache: "no-store",
    }),
    fetch(`${appUrl}/api/referrals`, {
      headers: { Cookie: `session=${await getSessionToken()}` },
      cache: "no-store",
    }),
  ]);

  if (!meRes.ok) redirect("/signin");

  const me = (await meRes.json()) as MeResponse;
  const referralsData = await referralsRes.json();

  return { me, referrals: referralsData.referrals ?? [] };
}

async function getSessionToken(): Promise<string> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value ?? "";
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Server-side data fetching using Prisma directly (avoiding HTTP roundtrip)
  const { prisma } = await import("@/lib/prisma");

  const [user, clicks, conversions, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, name: true, referralCode: true, createdAt: true },
    }),
    prisma.referralClick.count({ where: { userId: session.sub } }),
    prisma.user.count({ where: { referredById: session.sub } }),
    prisma.user.findMany({
      where: { referredById: session.sub },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/signin");

  const conversionRate = clicks > 0 ? Math.round((conversions / clicks) * 1000) / 10 : 0;

  const referralLink = `${appUrl}/r/${user.referralCode}`;

  const maskedReferrals = referrals.map((r) => ({
    ...r,
    email: maskEmail(r.email),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-brand-600">ArcadeApp</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Hi, <span className="font-medium text-slate-900">{user.name}</span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your referrals and conversion performance</p>
        </div>

        {/* Stats */}
        <StatsOverview clicks={clicks} conversions={conversions} conversionRate={conversionRate} />

        {/* Referral Link */}
        <ReferralLinkCard referralLink={referralLink} referralCode={user.referralCode} />

        {/* Referrals Table */}
        <ReferralsTable referrals={maskedReferrals} />
      </main>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***@${domain}`;
}
