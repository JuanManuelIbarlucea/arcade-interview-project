import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-brand-600">ArcadeApp</span>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-brand-600 text-white rounded-lg px-4 py-2 hover:bg-brand-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-brand-500 rounded-full inline-block" />
          Now in Public Beta
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          Grow Your Network,
          <br />
          <span className="text-brand-600">Track Your Impact</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Share your unique referral link. See exactly who joins. Measure your conversion rate in
          real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-brand-600 text-white font-semibold rounded-xl px-8 py-4 text-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Start for Free
          </Link>
          <Link
            href="/signin"
            className="border border-slate-200 text-slate-700 font-semibold rounded-xl px-8 py-4 text-lg hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🔗",
              title: "Your Unique Link",
              desc: "Every account gets a personal referral link you can share anywhere.",
            },
            {
              icon: "📊",
              title: "Real-Time Analytics",
              desc: "Track clicks and sign-ups. See your conversion rate update live.",
            },
            {
              icon: "👥",
              title: "Full Attribution",
              desc: "Know exactly which friend joined through your link and when.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        ArcadeApp &mdash; Built for the Arcade Engineering Interview
      </footer>
    </div>
  );
}
