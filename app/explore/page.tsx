import { StockExplorer } from "@/components/stock-explorer";
import { SiteHeader } from "@/components/site-header";
import { getMarketSession } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Explore the KSE-100",
  description:
    "Browse Pakistan’s KSE-100 constituents by company, sector, and market capitalisation.",
  path: "/explore",
});

export const dynamic = "force-dynamic";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(`${value}T12:00:00+05:00`));
}

export default async function ExplorePage() {
  const { date, rows } = await getMarketSession();

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="explore" />

      <main className="mx-auto max-w-[1880px] px-3 py-4 sm:px-8 sm:py-10">
        <section className="mb-4 sm:mb-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">Latest session · {displayDate(date)}</p>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">Explore KSE-100</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Browse the current KSE-100 constituents and sort them by company name, sector, or market capitalisation.</p>
        </section>

        <StockExplorer rows={rows} />
      </main>
    </div>
  );
}
