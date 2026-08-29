import Link from "next/link";

import { EconCategoryChart } from "@/components/economy/category-chart";
import { EconTradeChart } from "@/components/economy/trade-chart";
import { SiteHeader } from "@/components/site-header";
import { getEconomicTradeCategories, getEconomicTradeData } from "@/lib/economy/trade-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pakistan Exports and Imports",
  description:
    "Track Pakistan’s annual merchandise exports, imports, trade deficit, and major trade categories in U.S. dollars.",
  path: "/econ/trade",
  imagePath: "/econ/trade/opengraph-image",
});

export const revalidate = 3600;

export default async function EconPage() {
  const data = await getEconomicTradeData();
  const categoryData = await getEconomicTradeCategories();
  const latest = data.at(-1)!;
  const previous = data.at(-2)!;
  const importGrowth = ((latest.imports / previous.imports - 1) * 100).toFixed(1);
  const exportGrowth = ((latest.exports / previous.exports - 1) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="economy" active="trade" />

      <main className="mx-auto max-w-[1440px] px-3 py-5 sm:px-8 sm:py-10">
        <section className="mb-6 max-w-3xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#58749b]">Pakistan economy · external trade</p>
          <h1 className="text-3xl font-bold tracking-[-0.045em] text-[#203a63] sm:text-5xl">Exports are growing. The gap is still wide.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Pakistan&apos;s annual merchandise exports and imports, shown in million U.S. dollars across fiscal years. Use the range controls to zoom into the recent trend.</p>
        </section>

        <Link href="/econ/it-exports" className="mb-6 block rounded-xl border border-[#bfd2e7] bg-[#eef5fb] px-4 py-3 text-sm font-semibold text-[#315a8a] hover:bg-[#e4f0fa]">New analysis: Pakistan IT exports → growth, scale, and comparison with major export categories</Link>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-400">Exports · {latest.fiscalYear}</p><p className="mt-2 text-3xl font-bold tracking-tight text-[#0f766e]">${latest.exports.toLocaleString()}M</p><p className="mt-1 text-xs text-slate-500"><span className="font-semibold text-emerald-700">+{exportGrowth}%</span> year on year</p></div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-400">Imports · {latest.fiscalYear}</p><p className="mt-2 text-3xl font-bold tracking-tight text-[#d97706]">${latest.imports.toLocaleString()}M</p><p className="mt-1 text-xs text-slate-500"><span className="font-semibold text-amber-700">+{importGrowth}%</span> year on year</p></div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-400">Trade balance · {latest.fiscalYear}</p><p className="mt-2 text-3xl font-bold tracking-tight text-rose-600">−${Math.abs(latest.balance).toLocaleString()}M</p><p className="mt-1 text-xs text-slate-500">merchandise trade deficit</p></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm" aria-label="Pakistan exports and imports chart">
          <div className="border-b border-slate-100 px-4 pb-3 pt-5 sm:px-6"><h2 className="text-lg font-bold tracking-tight text-[#203a63]">Pakistan&apos;s trade story</h2><p className="mt-1 text-sm text-slate-500">Exports vs imports · fiscal year July–June</p></div>
          <EconTradeChart data={data} />
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm" aria-label="Pakistan trade categories chart">
          <div className="border-b border-slate-100 px-4 pb-3 pt-5 sm:px-6"><h2 className="text-lg font-bold tracking-tight text-[#203a63]">What makes up the trade?</h2><p className="mt-1 text-sm text-slate-500">PBS commodity groups and selected commodities · million USD</p></div>
          <EconCategoryChart data={categoryData} />
        </section>

        <section className="mt-6 grid gap-6 text-sm text-slate-500 lg:grid-cols-[1fr_320px]">
          <div className="leading-6"><p><strong className="font-semibold text-slate-700">Reading the chart:</strong> the gap between the two lines represents the merchandise trade deficit. Values are reported in million U.S. dollars and cover goods trade only, not services.</p><p className="mt-2">The annual totals come from PBS customs-based external-trade statistics. Category values are PBS major commodity groups, converted from million PKR to million USD using the documented fiscal-year exchange rates.</p></div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-xs leading-5 shadow-sm"><p className="font-bold text-slate-700">Source</p><a className="mt-1 block text-[#315a8a] underline decoration-slate-300 underline-offset-2" href="https://www.pbs.gov.pk/external-trade-statistics/">Pakistan Bureau of Statistics · External Trade Statistics</a></div>
        </section>
      </main>
    </div>
  );
}
