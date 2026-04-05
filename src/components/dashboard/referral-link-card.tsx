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
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Your Referral Link</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Share this link to invite friends. Each signup will be attributed to you.
          </p>
        </div>
        <div className="bg-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-600">
          {referralCode}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600 font-mono truncate">
          {referralLink}
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className={`shrink-0 font-medium text-sm rounded-lg px-4 py-2.5 transition-all ${
            copied
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
          aria-label="Copy referral link to clipboard"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        When someone clicks your link and signs up, they&apos;ll be attributed to you automatically.
      </p>
    </div>
  );
}
