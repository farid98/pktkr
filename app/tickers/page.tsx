import { TickerBoard } from "@/components/ticker-board";
import { SiteHeader } from "@/components/site-header";
import { getMarketSession, getMarketTickerHistory } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "KSE-100 Tickers",
  description: "Browse all 100 KSE-100 stocks with current prices, daily changes, and 30-session price trends.",
  path: "/tickers",
});

export const dynamic = "force-dynamic";

export default async function TickersPage() {
  const { rows, index } = await getMarketSession();
  const history = await getMarketTickerHistory(index);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="market" active="tickers" />
      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 sm:py-12">
        <section className="mb-6"><h1 className="text-3xl font-bold tracking-[-0.045em] text-[#203a63] sm:text-5xl">KSE-100 Tickers</h1><p className="mt-1 text-sm text-slate-500">Prices, daily moves, and 30-session trends.</p></section>
        <TickerBoard rows={rows} history={history} />
      </main>
    </div>
  );
}
