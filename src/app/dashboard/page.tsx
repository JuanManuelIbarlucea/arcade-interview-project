import { SignOutButton } from "@/components/sign-out-button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your VaultPay account overview, balances, and recent transactions.",
  robots: {
    index: false,
    follow: false,
  },
};

const QUICK_ACTIONS = [
  { icon: "💸", label: "Send Money", desc: "Transfer funds to anyone instantly" },
  { icon: "📥", label: "Request", desc: "Request a payment from a friend" },
  { icon: "💳", label: "Pay Bills", desc: "Schedule and manage bill payments" },
  { icon: "📊", label: "Invest", desc: "Explore savings and investment options" },
] as const;

const RECENT_TRANSACTIONS = [
  { name: "Coffee Shop", amount: -4.5, date: "Today", icon: "☕" },
  { name: "Salary Deposit", amount: 3200.0, date: "Yesterday", icon: "🏢" },
  { name: "Grocery Store", amount: -67.32, date: "Yesterday", icon: "🛒" },
  { name: "Subscription", amount: -12.99, date: "2 days ago", icon: "📱" },
  { name: "Refund — Electronics", amount: 149.0, date: "3 days ago", icon: "🔄" },
] as const;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      createdAt: true,
      _count: {
        select: {
          referrals: true,
        },
      },
    },
  });

  if (!user) redirect("/signin");

  const balance = 8_426.73;
  const monthlySpending = 1_234.56;
  const savings = 15_890.0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <nav
          aria-label="Main"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <span className="font-extrabold text-xl tracking-tight text-brand-600">VaultPay</span>
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-2 rounded-lg"
                aria-current="page"
              >
                Dashboard
              </Link>
              <Link
                href="/referral"
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s an overview of your finances
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 shadow-lg shadow-brand-200/50 dark:shadow-none text-white">
            <div className="text-sm font-medium text-brand-100 mb-1">Available Balance</div>
            <div className="text-3xl font-extrabold tracking-tight mb-3">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-brand-200">Main Account &middot; ****4821</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover-lift group">
            <div
              className="inline-flex p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 mb-4 transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              <span className="text-xl">💰</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-1 tracking-tight">
              ${monthlySpending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Monthly Spending
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Across all categories this month
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover-lift group">
            <div
              className="inline-flex p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 mb-4 transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              <span className="text-xl">🏦</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1 tracking-tight">
              ${savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Total Savings
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Earning 4.5% APY in your vault
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="text-lg font-bold text-slate-900 dark:text-white mb-4"
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover-lift group text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:bg-slate-50 dark:active:bg-slate-700"
              >
                <div
                  className="text-2xl mb-3 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {action.icon}
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  {action.label}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {action.desc}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section aria-labelledby="transactions-heading">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="transactions-heading"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Recent Transactions
            </h2>
            <button
              type="button"
              className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-2 py-1"
            >
              View All
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div
                key={`${tx.name}-${tx.date}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0"
                  aria-hidden="true"
                >
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                    {tx.name}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{tx.date}</div>
                </div>
                <div
                  className={`font-semibold text-sm tabular-nums ${
                    tx.amount >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-900 dark:text-slate-200"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : ""}$
                  {Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Referral Banner */}
        <section className="bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 border border-brand-100 dark:border-brand-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Invite friends, earn rewards
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share VaultPay with friends and track your referral performance. You&apos;ve referred{" "}
              {user._count.referrals} {user._count.referrals === 1 ? "person" : "people"} so far.
            </p>
          </div>
          <Link
            href="/referral"
            className="bg-brand-600 text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-brand-700 active:bg-brand-800 transition-all duration-150 btn-press shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap"
          >
            View Referrals
          </Link>
        </section>
      </main>
    </div>
  );
}
