import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { TickerPriceChart } from "@/components/ticker-price-chart";
import { getMarketSession, getTickerOhlcvHistory, getTickerOhlcvHistoryFromSupabase } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ symbol: string }> };

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const session = await getMarketSession();
  const ticker = session.rows.find((row) => row.symbol === symbol.toUpperCase());
  if (!ticker) return {};
  return createPageMetadata({
    title: `${ticker.symbol} share price and trend`,
    description: `${ticker.company}: current PSX price, daily move, volume, market capitalisation, and 30-session closing-price trend.`,
    path: `/tickers/${ticker.symbol}`,
  });
}

export default async function TickerDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  const session = await getMarketSession();
  const ticker = session.rows.find((row) => row.symbol === symbol.toUpperCase());
  if (!ticker) notFound();
  const supabaseSeries = await getTickerOhlcvHistoryFromSupabase(ticker.symbol, session.date);
  const series = supabaseSeries ?? await getTickerOhlcvHistory(ticker.symbol);
  const latest = series.at(-1);
  const lastPrice = latest?.close ?? ticker.close;
  const dailyChange = latest?.percentChange ?? ticker.percentChange;
  const dailyVolume = latest?.volume ?? ticker.volume;
  const positive = dailyChange >= 0;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="tickers" />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <Link href="/tickers" className="text-sm font-semibold text-[#203a63] hover:text-slate-900">← All tickers</Link>
        <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)] sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div>
            <p className="text-sm font-bold text-[#58749b]">{ticker.symbol}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-5xl">{ticker.company}</h1>
            <p className="mt-2 text-sm text-slate-500">{ticker.sector} · latest available PSX session</p>
          </div>
          <a href={`https://dps.psx.com.pk/company/${encodeURIComponent(ticker.symbol)}`} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#203a63] transition hover:border-[#58749b] hover:bg-slate-50">View on DPS ↗</a>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">Last price</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">PKR {lastPrice.toFixed(2)}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">Daily move</p><p className={`mt-1 text-xl font-bold tabular-nums ${positive ? "text-emerald-700" : "text-rose-700"}`}>{positive ? "+" : ""}{dailyChange.toFixed(2)}%</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">Volume</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{compactNumber(dailyVolume)}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">Market cap</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">PKR {compactNumber(ticker.marketCap)}</p></div>
        </section>

        <div className="mt-5"><TickerPriceChart symbol={ticker.symbol} points={series} /></div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Daily OHLCV history is read from the split- and bonus-adjusted PSX price view in Supabase, with the exported static history used only if Supabase is unavailable. Figures are informational only and are not investment advice.</p>
      </main>
    </div>
  );
}
