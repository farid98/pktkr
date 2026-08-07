import Link from "next/link";

import { DailyReport } from "@/components/daily-report";
import { getLatestNews } from "@/lib/market-data";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const newsMarkdown = await getLatestNews();

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
            <Link href="/#market-map" className="hover:text-slate-900">
              <span className="sm:hidden">Map</span>
              <span className="hidden sm:inline">Market map</span>
            </Link>
            <Link href="/#daily-report" className="hover:text-slate-900">
              <span className="sm:hidden">Summary</span>
              <span className="hidden sm:inline">Daily report</span>
            </Link>
            <Link href="/explore" className="hover:text-slate-900">
              Explore
            </Link>
            <span className="text-[#203a63]" aria-current="page">
              News
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1880px] px-3 py-4 sm:px-8 sm:py-10">
        <section className="mb-4 sm:mb-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">
            Latest briefing
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">
            PSX News
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            The latest market, company, macroeconomic, and regulatory developments.
          </p>
        </section>

        {newsMarkdown ? (
          <DailyReport id="news" markdown={newsMarkdown} />
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No news briefing is available yet.
          </p>
        )}
      </main>
    </div>
  );
}
