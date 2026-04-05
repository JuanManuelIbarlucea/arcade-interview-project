import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";

export const metadata = {
  title: "Sign Up — ArcadeApp",
};

export default function SignUpPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
        <p className="text-slate-500 mt-1">Join ArcadeApp and start tracking your referrals</p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href="/signin" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
