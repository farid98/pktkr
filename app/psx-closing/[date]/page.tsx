import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketCloseContent } from "@/components/market-close-content";
import { SiteHeader } from "@/components/site-header";
import { getMarketSessionForDate } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(`${value}T12:00:00+05:00`));
}

type PageProps = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const session = await getMarketSessionForDate(date);
  if (!session) return {};

  const dateLabel = displayDate(session.date);
  return createPageMetadata({
    title: `PSX Closing — ${dateLabel}`,
    description: `PSX closing data for ${dateLabel}: KSE-100 heat map, gainers, losers, volume leaders, and market-close report.`,
    path: `/psx-closing/${session.date}`,
  });
}

export default async function PSXClosingArchivePage({ params }: PageProps) {
  const { date } = await params;
  const session = await getMarketSessionForDate(date);
  if (!session) notFound();

  const dateLabel = displayDate(session.date);
  const sessionPosition = session.index.sessions.findIndex(
    (candidate) => candidate.date === session.date,
  );
  const previousSession = session.index.sessions[sessionPosition - 1];
  const nextSession = session.index.sessions[sessionPosition + 1];

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="market" active="market" />

      <main className="mx-auto max-w-[1880px] px-3 py-4 sm:px-8 sm:py-10">
        <section id="market-map" className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">Daily archive</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">PSX Closing — {dateLabel}</h1>
            <p className="mt-2 text-sm text-slate-500">KSE-100 market-close data, heat map, and report for this trading session.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[#203a63]">
            {previousSession ? (
              <Link href={`/psx-closing/${previousSession.date}`} className="hover:text-slate-900">
                ← Previous closing
              </Link>
            ) : null}
            {nextSession ? (
              <Link href={`/psx-closing/${nextSession.date}`} className="hover:text-slate-900">
                Next closing →
              </Link>
            ) : null}
            <Link href="/" className="hover:text-slate-900">View latest PSX closing →</Link>
          </div>
        </section>

        <MarketCloseContent
          date={session.date}
          rows={session.rows}
          index={session.index}
        />
      </main>
    </div>
  );
}
