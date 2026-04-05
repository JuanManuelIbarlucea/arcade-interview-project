interface StatsOverviewProps {
  clicks: number;
  conversions: number;
  conversionRate: number;
}

const STAT_META = [
  {
    label: "Link Clicks",
    description: "Total times your referral link was clicked",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    icon: "🔗",
  },
  {
    label: "Conversions",
    description: "People who signed up via your link",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    icon: "✅",
  },
  {
    label: "Conversion Rate",
    description: "Percentage of clicks that led to sign-ups",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/30",
    icon: "📈",
  },
] as const;

export function StatsOverview({ clicks, conversions, conversionRate }: StatsOverviewProps) {
  const stats = [
    { ...STAT_META[0], value: clicks.toLocaleString() },
    { ...STAT_META[1], value: conversions.toLocaleString() },
    { ...STAT_META[2], value: `${conversionRate}%` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover-lift group"
        >
          <div
            className={`inline-flex p-2.5 rounded-xl ${stat.bg} mb-4 transition-transform duration-200 group-hover:scale-105`}
            aria-hidden="true"
          >
            <span className="text-xl">{stat.icon}</span>
          </div>
          <div
            className={`text-3xl font-extrabold ${stat.color} mb-1 tracking-tight`}
            aria-label={`${stat.label}: ${stat.value}`}
          >
            {stat.value}
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {stat.label}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
            {stat.description}
          </div>
        </div>
      ))}
    </div>
  );
}
