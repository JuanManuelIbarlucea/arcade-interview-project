import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free ArcadeApp account to get your unique referral link and start tracking sign-ups.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/signup",
  },
};

export default function SignUpPage() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 sm:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Join ArcadeApp and start tracking your referrals
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
