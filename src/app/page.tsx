import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VaultPay — Smart Money Management for Everyone",
  description:
    "Send, save, and grow your money with VaultPay. Instant transfers, high-yield savings vaults, and smart budgeting tools — all in one app.",
  alternates: {
    canonical: "/",
  },
};

const FEATURES = [
  {
    icon: "💸",
    title: "Instant Transfers",
    desc: "Send money to anyone in seconds. No fees, no waiting — just tap and done.",
  },
  {
    icon: "🏦",
    title: "Smart Savings Vaults",
    desc: "Earn 4.5% APY on your savings. Set goals, automate deposits, watch your money grow.",
  },
  {
    icon: "📊",
    title: "Budget Insights",
    desc: "See where your money goes with real-time spending analytics and smart categories.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Nav */}
      <nav
        aria-label="Main"
        className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-extrabold text-xl tracking-tight text-brand-600"
            aria-label="VaultPay home"
          >
            VaultPay
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-brand-600 text-white rounded-lg px-4 py-2 hover:bg-brand-700 active:bg-brand-800 transition-all duration-150 btn-press shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main id="main-content">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-28 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border border-brand-100 dark:border-brand-800">
            <span
              className="w-2 h-2 bg-brand-500 rounded-full inline-block animate-pulse"
              aria-hidden="true"
            />
            Now in Public Beta
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
            Your Money,
            <br />
            <span className="text-brand-600 dark:text-brand-400 bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-400 dark:to-brand-300 bg-clip-text text-transparent">
              Your Vault
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Send, save, and grow your money — all in one place. Smart budgeting, high-yield savings,
            and instant transfers with zero fees.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-brand-600 text-white font-semibold rounded-xl px-8 py-4 text-lg hover:bg-brand-700 active:bg-brand-800 transition-all duration-200 shadow-lg shadow-brand-200/50 dark:shadow-none hover:shadow-xl hover:shadow-brand-200/60 btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Open Your Vault
            </Link>
            <Link
              href="/signin"
              className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl px-8 py-4 text-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 active:bg-slate-100 transition-all duration-200 btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28"
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-7 shadow-sm hover-lift group"
              >
                <div
                  className="text-3xl mb-4 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
        <span className="font-semibold text-slate-500 dark:text-slate-400">VaultPay</span> &mdash;
        Built for the Arcade Engineering Interview
      </footer>
    </div>
  );
}
