import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "VaultPay — Smart Money Management for Everyone",
    template: "%s | VaultPay",
  },
  description:
    "Send, save, and grow your money with VaultPay. Instant transfers, high-yield savings vaults, and smart budgeting tools — all in one app.",
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    type: "website",
    siteName: "VaultPay",
    title: "VaultPay — Smart Money Management for Everyone",
    description:
      "Send, save, and grow your money with VaultPay. Instant transfers, high-yield savings vaults, and smart budgeting tools.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VaultPay — Smart Money Management for Everyone",
    description:
      "Send, save, and grow your money with VaultPay. Instant transfers, high-yield savings vaults, and smart budgeting tools.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data requires dangerouslySetInnerHTML
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "VaultPay",
              url: APP_URL,
              applicationCategory: "FinanceApplication",
              description:
                "Send, save, and grow your money with VaultPay. Instant transfers, high-yield savings vaults, and smart budgeting tools.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
