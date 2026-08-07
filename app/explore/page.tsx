import Link from "next/link";

import { StockExplorer } from "@/components/stock-explorer";
import { getMarketSession } from "@/lib/market-data";

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
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-[1880px] items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="pktkr home">
            <span className="grid size-9 place-items-center rounded-xl bg-[#203a63] text-sm font-black tracking-tight text-white">pk</span>
            <span className="text-lg font-bold tracking-[-0.03em] text-[#203a63]">pktkr</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-slate-500 sm:gap-5 sm:text-sm">
            <Link href="/#market-map" className="hover:text-slate-900">Map</Link>
            <Link href="/#daily-report" className="hover:text-slate-900">Summary</Link>
            <Link href="/news" className="hover:text-slate-900">News</Link>
            <span className="text-[#203a63]" aria-current="page">Explore</span>
          </nav>
        </div>
      </header>

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
