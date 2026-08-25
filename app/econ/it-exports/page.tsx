import { ItExportAnalysis } from "@/components/economy/it-export-analysis";
import { SiteHeader } from "@/components/site-header";
import { getItExportComparison, getItExportData } from "@/lib/economy/it-export-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pakistan IT Exports",
  description:
    "See how Pakistan’s computer-services exports have grown and compare them with major merchandise export categories.",
  path: "/econ/it-exports",
});

export const revalidate = 3600;

export default async function ItExportsPage() {
  const data = await getItExportData();
  const comparison = await getItExportComparison();

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="economy" active="it-exports" />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 max-w-3xl"><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#58749b]">Pakistan economy · services exports</p><h1 className="text-3xl font-bold tracking-[-0.045em] text-[#203a63] sm:text-5xl">Pakistan&apos;s IT exports are becoming material.</h1><p className="mt-3 text-base leading-7 text-slate-500">Computer-services exports have grown rapidly, reaching roughly $3.2bn in FY2025. That is still much smaller than total merchandise exports, but it is already in the same range as several major goods categories.</p></section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"><ItExportAnalysis data={data} comparison={comparison} /></section>
        <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-[#203a63]">What the evidence says</h2><p className="mt-3 text-sm leading-6 text-slate-600">The trend is strong: computer-services exports rose from about $1.1bn in FY2020 to $3.24bn in FY2025. Growth was not perfectly smooth—FY2023 was broadly flat—but the level resumed rising in FY2024 and FY2025.</p><p className="mt-3 text-sm leading-6 text-slate-600">The latest provisional comparison is also positive: Jul–Apr FY2026 computer-services exports were $3.215bn, up about 20% from $2.680bn in Jul–Apr FY2025.</p></div><div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-[#203a63]">How significant?</h2><p className="mt-3 text-sm leading-6 text-slate-600">At $3.24bn, computer-services exports were about 10% of FY2025 merchandise exports. They were slightly larger than PBS bed-wear exports and slightly smaller than rice exports, while knitwear remained substantially larger.</p><p className="mt-3 text-sm leading-6 text-slate-600">The strategic importance is higher than the share alone suggests: IT is a service export with limited physical-input dependence and a growing freelance component. But the comparison should not be interpreted as a direct contribution to the goods trade balance.</p></div></section>
        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 text-sm leading-6 text-slate-500 shadow-sm"><h2 className="font-bold text-slate-700">Definitions and sources</h2><p className="mt-2">The analysis uses SBP&apos;s “computer services” export category. Broader ICT exports add telecommunications and information services. FY2020–FY2024 values come from SBP&apos;s FY2024 annual report; FY2025 comes from SBP&apos;s June 2025 export release; Jul–Apr FY2026 is provisional SBP data. Merchandise comparison values come from PBS FY2024–25 external-trade data.</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1"><a className="text-[#315a8a] underline" href="https://www.sbp.org.pk/reports/annual/aarFY24/Chapter-06.pdf">SBP annual report</a><a className="text-[#315a8a] underline" href="https://www.sbp.org.pk/publications/export/2025/Jun/2.pdf">SBP June 2025 release</a><a className="text-[#315a8a] underline" href="https://www.sbp.org.pk/ecodata/dt.pdf">SBP current services table</a><a className="text-[#315a8a] underline" href="https://www.pbs.gov.pk/external-trade-statistics/">PBS external trade statistics</a></div></section>
      </main>
    </div>
  );
}
