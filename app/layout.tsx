import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { SiteDisclaimer } from "@/components/site-disclaimer";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "pktkr — Pakistan market and economy data",
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  keywords: [
    "Pakistan stock market",
    "KSE-100",
    "Pakistan economy",
    "Pakistan exports",
    "Pakistan imports",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "pktkr — Pakistan market and economy data",
    description: defaultDescription,
    url: "/",
    siteName,
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "pktkr — Pakistan market and economy data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pktkr — Pakistan market and economy data",
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f7f9fc]">
        <Suspense fallback={null}>
          <FirebaseAnalytics />
        </Suspense>
        {children}
        <SiteDisclaimer />
      </body>
    </html>
  );
}
