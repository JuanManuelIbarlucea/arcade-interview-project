"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

const baseInputClasses =
  "w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent transition-all duration-200 motion-reduce:transition-none";

const defaultBorderClasses = "border-slate-200 dark:border-slate-600";
const errorBorderClasses = "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20";

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

  function inputClasses(field: string) {
    return `${baseInputClasses} ${errors[field] ? errorBorderClasses : defaultBorderClasses}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form" noValidate>
      {serverError && (
        <div
          id="signup-server-error"
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div>
        <label
          htmlFor="signup-name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "signup-name-error" : undefined}
          className={inputClasses("name")}
          placeholder="Jane Doe"
        />
        {errors.name && (
          <p
            id="signup-name-error"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          className={inputClasses("email")}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p
            id="signup-email-error"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={errors.password ? "true" : undefined}
          aria-describedby={errors.password ? "signup-password-error" : "signup-password-hint"}
          className={inputClasses("password")}
          placeholder="Min. 8 characters"
        />
        <p id="signup-password-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Minimum 8 characters required.
        </p>
        {errors.password && (
          <p
            id="signup-password-error"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-600 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-brand-700 active:bg-brand-800 transition-all duration-150 motion-reduce:transition-none disabled:opacity-60 disabled:cursor-not-allowed mt-2 btn-press shadow-sm hover:shadow-md disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  return (
    <Suspense
      fallback={
        <div
          className="h-48 animate-pulse motion-reduce:animate-none bg-slate-100 dark:bg-slate-700 rounded-lg"
          role="status"
          aria-label="Loading sign-up form"
        />
      }
    >
      <SignUpFormInner />
    </Suspense>
  );
}
