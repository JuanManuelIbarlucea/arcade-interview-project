"use client";

import { useState } from "react";

interface ReferralLinkCardProps {
  referralLink: string;
  referralCode: string;
}

export function ReferralLinkCard({ referralLink, referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = referralLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover-lift">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Your Referral Link
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Share this link to invite friends. Each signup will be attributed to you.
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 shrink-0 self-start">
          {referralCode}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label htmlFor="referral-link" className="sr-only">
          Your referral link
        </label>
        <output
          id="referral-link"
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-mono truncate min-w-0"
        >
          {referralLink}
        </output>
        <button
          type="button"
          onClick={copyToClipboard}
          className={`shrink-0 font-semibold text-sm rounded-lg px-4 py-2.5 transition-all duration-200 motion-reduce:transition-none btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
            copied
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm"
              : "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow-md"
          }`}
          aria-label="Copy referral link to clipboard"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        {copied ? "Referral link copied to clipboard" : ""}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
        When someone clicks your link and signs up, they&apos;ll be attributed to you automatically.
      </p>
    </div>
  );
}
