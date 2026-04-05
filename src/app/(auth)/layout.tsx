import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Main">
          <Link
            href="/"
            className="font-extrabold text-xl tracking-tight text-brand-600 hover:text-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
            aria-label="VaultPay home"
          >
            VaultPay
          </Link>
        </nav>
      </header>
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
