import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { FirebaseAnalytics } from "@/components/firebase-analytics";
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
  title: "pktkr — KSE-100 Market Map",
  description:
    "An interactive view of KSE-100 shares, grouped by sector and sized by market cap or trade volume.",
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
      </body>
    </html>
  );
}
