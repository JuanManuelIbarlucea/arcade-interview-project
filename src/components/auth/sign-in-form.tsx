"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const inputClasses =
  "w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent transition-all duration-200 motion-reduce:transition-none";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Sign in failed. Please try again.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="signin-form" noValidate>
      {error && (
        <div
          id="signin-error"
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="signin-email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "signin-error" : undefined}
          className={inputClasses}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="signin-password"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "signin-error" : undefined}
          className={inputClasses}
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-600 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-brand-700 active:bg-brand-800 transition-all duration-150 motion-reduce:transition-none disabled:opacity-60 disabled:cursor-not-allowed mt-2 btn-press shadow-sm hover:shadow-md disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
