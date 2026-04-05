import { ReferralLinkCard } from "@/components/dashboard/referral-link-card";
import { ReferralsTable } from "@/components/dashboard/referrals-table";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { SignOutButton } from "@/components/sign-out-button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your referral stats, share your unique link, and track who joined through you.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Server-side data fetching using Prisma directly (avoiding HTTP roundtrip)
  // Two parallel queries instead of four: user+counts in one via _count, referrals list in another
  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
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
    }),
    prisma.user.findMany({
      where: { referredById: session.sub },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/signin");

  const clicks = user._count.referralClicks;
  const conversions = user._count.referrals;
  const conversionRate = clicks > 0 ? Math.round((conversions / clicks) * 1000) / 10 : 0;

  const referralLink = `${appUrl}/r/${user.referralCode}`;

  const maskedReferrals = referrals.map((r) => ({
    ...r,
    email: maskEmail(r.email),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <nav
          aria-label="Main"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          <span className="font-extrabold text-xl tracking-tight text-brand-600">ArcadeApp</span>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">
              Hi, <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
            </span>
            <SignOutButton />
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10"
      >
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your referrals and conversion performance
          </p>
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
