"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-60"
    >
      {loading ? "..." : "Sign Out"}
    </button>
  );
}
