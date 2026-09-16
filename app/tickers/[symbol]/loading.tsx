import { SiteHeader } from "@/components/site-header";

export default function LoadingTickerDetail() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="tickers" />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12" aria-busy="true" aria-live="polite">
        <p className="text-sm font-semibold text-[#315a8a]">Loading price chart…</p>
        <section className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="mt-3 h-11 max-w-md rounded bg-slate-200" />
          <div className="mt-3 h-4 w-56 rounded bg-slate-100" />
        </section>
        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["price", "move", "volume", "market-cap"].map((card) => <div key={card} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="h-3 w-20 rounded bg-slate-100" /><div className="mt-3 h-7 w-28 rounded bg-slate-200" /></div>)}
        </section>
        <div className="mt-5 h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </main>
    </div>
  );
}
