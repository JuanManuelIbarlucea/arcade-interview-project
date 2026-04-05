"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function SignUpFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get("ref");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            ...(refFromUrl ? { refCode: refFromUrl } : {}),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.field) {
            setErrors({ [data.field]: data.error });
          } else {
            setServerError(data.error ?? "Sign up failed. Please try again.");
          }
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch {
        setServerError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
      {serverError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
            errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
          }`}
          placeholder="Jane Doe"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
            errors.email ? "border-red-300 bg-red-50" : "border-slate-200"
          }`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
            errors.password ? "border-red-300 bg-red-50" : "border-slate-200"
          }`}
          placeholder="Min. 8 characters"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-600 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse bg-slate-100 rounded-lg" />}>
      <SignUpFormInner />
    </Suspense>
  );
}
