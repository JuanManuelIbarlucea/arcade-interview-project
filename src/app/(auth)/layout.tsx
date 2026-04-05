import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col">
      <nav className="px-4 py-4">
        <Link
          href="/"
          className="font-bold text-xl text-brand-600 hover:text-brand-700 transition-colors"
        >
          ArcadeApp
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
