import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your ArcadeApp account to manage referrals and track your network growth.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/signin",
  },
};

export default function SignInPage() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to your ArcadeApp account</p>
      </div>

      <SignInForm />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
