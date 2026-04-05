import type { ReferredUser } from "@/types";

interface ReferralsTableProps {
  referrals: ReferredUser[];
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ReferralsTable({ referrals }: ReferralsTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          People You&apos;ve Referred
        </h2>
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full px-2.5 py-1">
          {referrals.length} total
        </span>
      </div>

      {referrals.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="text-4xl mb-3" aria-hidden="true">
            👋
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No referrals yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Share your referral link above to start inviting friends!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Referred users">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th
                  scope="col"
                  className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {referrals.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors duration-150 motion-reduce:transition-none"
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-brand-50 dark:ring-brand-900/60"
                        aria-hidden="true"
                      >
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs hidden sm:table-cell">
                    {r.email}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-400 dark:text-slate-500 text-xs">
                    {timeAgo(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
