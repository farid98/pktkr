import { Clock3 } from "lucide-react";
import Link from "next/link";

import { DailyReport } from "@/components/daily-report";
import { DateSelector } from "@/components/date-selector";
import { MarketTreemap } from "@/components/market-treemap";
import { getMarketSession } from "@/lib/market-data";

export const dynamic = "force-dynamic";

function displayTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: requestedDate } = await searchParams;
  const { date, rows, index, reportMarkdown } =
    await getMarketSession(requestedDate);
  const updatedAt = rows[0]?.downloadedAtUtc;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-[1880px] items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="pktkr home">
            <span className="grid size-9 place-items-center rounded-xl bg-[#203a63] text-sm font-black tracking-tight text-white">
              pk
            </span>
            <span className="text-lg font-bold tracking-[-0.03em] text-[#203a63]">
              pktkr
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-slate-500 sm:gap-5 sm:text-sm">
            <a href="#market-map" className="hover:text-slate-900">
              <span className="sm:hidden">Map</span>
              <span className="hidden sm:inline">Market map</span>
            </a>
            {reportMarkdown ? (
              <a href="#daily-report" className="hover:text-slate-900">
                <span className="sm:hidden">Summary</span>
                <span className="hidden sm:inline">Daily report</span>
              </a>
            ) : null}
            <a href="/news" className="hover:text-slate-900">
              News
            </a>
            <a href="#methodology" className="hidden hover:text-slate-900 sm:inline">
              Methodology
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1880px] px-3 py-4 sm:px-8 sm:py-10">
        <section
          id="market-map"
          className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-5"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Market close
            </div>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">
              KSE-100 Market Map
            </h1>
          </div>
          <div className="flex flex-wrap items-center">
            <DateSelector
              currentDate={date}
              sessions={[...index.sessions].reverse()}
            />
          </div>
        </section>

        <MarketTreemap rows={rows} date={date} />

        <section
          id="methodology"
          className="py-6 text-sm text-slate-500"
        >
          <div className="max-w-4xl leading-6">
            <p>
              <strong className="font-semibold text-slate-700">How to read it:</strong>{" "}
              all shares in the KSE-100 are grouped by sector. Larger rectangles
              represent larger companies or heavier trading, depending on the
              selected view. Green indicates a positive daily change and red a
              negative change. Figures are informational and are not investment
              advice.
            </p>
            {updatedAt ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock3 size={13} />
                Data collected {displayTimestamp(updatedAt)}
              </p>
            ) : null}
          </div>
        </section>

        {reportMarkdown ? <DailyReport markdown={reportMarkdown} /> : null}
      </main>
    </div>
  );
}
