import { ReferralLinkCard } from "@/components/dashboard/referral-link-card";
import { ReferralsTable } from "@/components/dashboard/referrals-table";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { SignOutButton } from "@/components/sign-out-button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Referrals",
  description:
    "View your referral stats, share your unique link, and track who joined through you.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReferralPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const appUrl = process.env.VERCEL_URL ?? "http://localhost:3000";

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
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-extrabold text-xl tracking-tight text-brand-600"
              aria-label="VaultPay home"
            >
              VaultPay
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/referral"
                className="text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-2 rounded-lg"
                aria-current="page"
              >
                Referrals
              </Link>
            </div>
          </div>
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Referrals</h1>
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
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  if (local.length <= 1) return `${local}***${domain}`;
  return `${local[0]}***${domain}`;
}
