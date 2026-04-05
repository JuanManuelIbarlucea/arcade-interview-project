"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-150 motion-reduce:transition-none disabled:opacity-60 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {isPending ? "..." : "Sign Out"}
    </button>
  );
}
