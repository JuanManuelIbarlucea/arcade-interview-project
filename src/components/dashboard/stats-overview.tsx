interface StatsOverviewProps {
  clicks: number;
  conversions: number;
  conversionRate: number;
}

const STAT_META = [
  {
    label: "Link Clicks",
    description: "Total times your referral link was clicked",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: "🔗",
  },
  {
    label: "Conversions",
    description: "People who signed up via your link",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: "✅",
  },
  {
    label: "Conversion Rate",
    description: "Percentage of clicks that led to sign-ups",
    color: "text-violet-600",
    bg: "bg-violet-50",
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
        >
          <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-4`}>
            <span className="text-xl">{stat.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          <div className="text-sm font-medium text-slate-700">{stat.label}</div>
          <div className="text-xs text-slate-400 mt-1">{stat.description}</div>
        </div>
      ))}
    </div>
  );
}
