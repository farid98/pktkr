import { Clock3 } from "lucide-react";
import Image from "next/image";

import { DateSelector } from "@/components/date-selector";
import { MarketCloseReport } from "@/components/market-close-report";
import { MarketTreemap } from "@/components/market-treemap";
import { SiteHeader } from "@/components/site-header";
import { getMarketCloseChart, getMarketSession } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "KSE-100 Market Close",
  description:
    "Explore the KSE-100 market close by sector, market capitalisation, trading volume, and daily performance.",
  path: "/",
});

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
  const { date, rows, index } = await getMarketSession(requestedDate);
  const marketCloseChart = await getMarketCloseChart(date);
  const updatedAt = rows[0]?.downloadedAtUtc;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="market" active="market" />

      <main className="mx-auto max-w-[1880px] px-3 py-4 sm:px-8 sm:py-10">
        <section
          id="market-map"
          className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-5"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">
              KSE-100 Market Close
            </h1>
          </div>
          <div className="flex flex-wrap items-center">
            <DateSelector
              currentDate={date}
              sessions={[...index.sessions].reverse()}
            />
          </div>
        </section>

        {marketCloseChart ? (
          <section
            aria-label={`KSE-100 market close chart for ${date}`}
            className="mb-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:mx-auto lg:mb-6 lg:w-2/3"
          >
            <Image
              src={marketCloseChart}
              alt={`KSE-100 market close chart for ${date}`}
              width={3600}
              height={2250}
              sizes="100vw"
              className="block h-auto w-full"
            />
          </section>
        ) : null}

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

        <MarketCloseReport rows={rows} />
      </main>
    </div>
  );
}
