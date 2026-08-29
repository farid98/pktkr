import type { MarketIndex, MarketRow } from "@/lib/market-types";

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function MoverBars({ rows, direction }: { rows: MarketRow[]; direction: "up" | "down" }) {
  const movers = [...rows]
    .filter((row) => direction === "up" ? row.percentChange > 0 : row.percentChange < 0)
    .sort((left, right) => direction === "up" ? right.percentChange - left.percentChange : left.percentChange - right.percentChange)
    .slice(0, 5);
  const max = Math.max(...movers.map((row) => Math.abs(row.percentChange)), 1);

  return (
    <div className="space-y-3.5">
      {movers.map((row, index) => (
        <div key={row.symbol} className="grid grid-cols-[72px_1fr_62px] items-center gap-3 text-sm">
          <span className="font-bold tracking-tight text-slate-100">{row.symbol}</span>
          <div className={`h-3 overflow-hidden rounded-full ${direction === "up" ? "bg-emerald-950/80" : "bg-rose-950/80"}`}>
            <div className={`mover-bar-fill h-full rounded-full ${direction === "up" ? "bg-[#34d399]" : "bg-[#fb7185]"}`} style={{ width: `${(Math.abs(row.percentChange) / max) * 100}%`, animationDelay: `${index * 75}ms` }} />
          </div>
          <span className={`text-right font-semibold tabular-nums ${direction === "up" ? "text-[#6ee7b7]" : "text-[#fda4af]"}`}>{signedPercent(row.percentChange)}</span>
        </div>
      ))}
    </div>
  );
}

function MiniIndexChart({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="h-14 rounded-lg bg-slate-100" aria-label="Index history unavailable" />;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${52 - ((value - min) / range) * 44}`).join(" ");
  return <svg viewBox="0 0 100 56" role="img" aria-label="Recent KSE-100 closing levels" className="h-16 w-full overflow-visible"><polyline points={points} fill="none" stroke={values.at(-1)! >= values[0] ? "#34d399" : "#fb7185"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}

export function MarketSummary({ date, rows, index }: { date: string; rows: MarketRow[]; index: MarketIndex }) {
  const session = index.sessions.find((candidate) => candidate.date === date);
  const history = index.sessions.filter((candidate) => candidate.indexClose !== undefined).slice(-30).map((candidate) => candidate.indexClose!);
  const indexChange = session?.indexChange;
  const indexPoints = session?.indexPoints;

  return (
    <>
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="index-summary-title">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#58749b]">KSE-100 Index · {date}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 id="index-summary-title" className="text-4xl font-bold tracking-[-0.05em] text-[#203a63] sm:text-5xl">{session?.indexClose?.toLocaleString("en-PK", { maximumFractionDigits: 2 }) ?? "—"}</h2>
              <span className={`text-lg font-bold tabular-nums ${indexChange == null ? "text-slate-500" : indexChange > 0 ? "text-emerald-600" : indexChange < 0 ? "text-rose-600" : "text-slate-500"}`}>{indexChange == null || indexPoints == null ? "Change unavailable" : `${signedPercent(indexChange)} · ${indexPoints >= 0 ? "+" : ""}${indexPoints.toFixed(2)} pts`}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#0f172a] px-4 py-2.5" title="Last 30 available sessions"><div className="mb-0.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"><span>30-session trend</span><span>KSE-100</span></div><MiniIndexChart values={history} /></div>
        </div>
      </section>
      <section className="mb-6 grid gap-4 lg:grid-cols-2" aria-label="Top five KSE-100 movers">
        <div className="movers-panel rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-lg shadow-slate-900/10 sm:p-6"><div className="mb-5 flex items-baseline justify-between"><h2 className="text-xl font-bold tracking-[-0.03em] text-white">Top 5 gainers <span className="ml-1 text-[#34d399]">↑</span></h2><span className="text-xs text-slate-400">daily change</span></div><MoverBars rows={rows} direction="up" /></div>
        <div className="movers-panel rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-lg shadow-slate-900/10 sm:p-6"><div className="mb-5 flex items-baseline justify-between"><h2 className="text-xl font-bold tracking-[-0.03em] text-white">Top 5 losers <span className="ml-1 text-[#fb7185]">↓</span></h2><span className="text-xs text-slate-400">daily change</span></div><MoverBars rows={rows} direction="down" /></div>
      </section>
    </>
  );
}
