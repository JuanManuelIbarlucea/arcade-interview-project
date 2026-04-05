import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";

export const metadata = {
  title: "Sign In — ArcadeApp",
};

export default function SignInPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 mt-1">Sign in to your ArcadeApp account</p>
      </div>

      <SignInForm />

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-600 font-medium hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
