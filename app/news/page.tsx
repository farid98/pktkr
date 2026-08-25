import { DailyReport } from "@/components/daily-report";
import { getLatestNews } from "@/lib/market-data";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "PSX News Briefing",
  description:
    "The latest Pakistan stock market, company, macroeconomic, and regulatory developments.",
  path: "/news",
});

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const newsMarkdown = await getLatestNews();

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="market" active="news" />

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
