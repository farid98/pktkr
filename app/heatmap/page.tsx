import Link from "next/link";

import { PeriodMarketHeatmap } from "@/components/period-market-heatmap";
import { SiteHeader } from "@/components/site-header";
import { getMarketSession, getTickerOhlcvHistory } from "@/lib/market-data";
import { buildPeriodHeatmap, HEATMAP_PERIODS, type HeatmapPeriod } from "@/lib/period-heatmap";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "KSE-100 Period Heatmap",
  description: "Compare KSE-100 constituent price returns over 7, 30, 60, 90, or 120 calendar days.",
  path: "/heatmap",
});

export default async function PeriodHeatmapPage({ searchParams }: {
  searchParams: Promise<{ date?: string; period?: string }>;
}) {
  const { date: requestedDate, period: requestedPeriod } = await searchParams;
  const parsedPeriod = Number(requestedPeriod);
  const period: HeatmapPeriod = HEATMAP_PERIODS.find((days) => days === parsedPeriod) ?? 30;
  const { date, rows } = await getMarketSession(requestedDate);
  const histories = new Map(await Promise.all(rows.map(async (row) => [
    row.symbol,
    await getTickerOhlcvHistory(row.symbol),
  ] as const)));
  const heatmap = buildPeriodHeatmap(rows, histories, date, period);
  const backHref = `/?date=${date}`;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="market" />
      <main className="mx-auto max-w-[1880px] px-3 py-5 sm:px-8 sm:py-10">
        <Link href={backHref} className="text-sm font-semibold text-[#315a8a] hover:text-[#203a63]">← Back to daily market</Link>
        <div className="mb-5 mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">KSE-100 market map</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">Period heatmap</h1>
            <p className="mt-2 text-sm text-slate-600">
              Price change from {heatmap.actualStart ?? heatmap.requestedStart} to {date} · {heatmap.rows.length} current constituents
            </p>
          </div>
          <nav aria-label="Heatmap period" className="flex flex-wrap gap-2">
            {HEATMAP_PERIODS.map((days) => (
              <Link
                key={days}
                href={`/heatmap?date=${date}&period=${days}`}
                aria-current={days === period ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${days === period ? "bg-[#203a63] text-white" : "border border-slate-200 bg-white text-[#315a8a] hover:bg-[#eef5fb]"}`}
              >
                {days}D
              </Link>
            ))}
          </nav>
        </div>

        {heatmap.actualStart && heatmap.rows.length ? (
          <PeriodMarketHeatmap rows={heatmap.rows} startDate={heatmap.actualStart} endDate={date} />
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No complete adjusted price history is available for this period.</p>
        )}
        <p className="mt-3 text-xs leading-5 text-slate-500">
          The {period}D selection covers calendar days; the comparison starts on the first trading day shared by the included stocks in that window.
          Returns use split- and bonus-adjusted closing prices from pktkr&apos;s exported ticker histories; they exclude dividends. Tile sizes use market capitalisation at the ending session.
          {heatmap.omittedSymbols.length > 0 && ` ${heatmap.omittedSymbols.length} current constituent(s) lack prices at both endpoints and are omitted: ${heatmap.omittedSymbols.join(", ")}.`}
        </p>
      </main>
    </div>
  );
}
