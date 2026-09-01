import { MarketHighlights, type MarketMoverRow, type MarketPressureRow } from "@/components/market-highlights";
import type { MarketIndex, MarketRow } from "@/lib/market-types";

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
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
  const totalMarketCap = rows.reduce((total, row) => total + row.marketCap, 0);
  const pressureRows: MarketPressureRow[] = rows
    .map((row) => ({
      symbol: row.symbol,
      percentChange: row.percentChange,
      contribution: totalMarketCap === 0 ? 0 : row.percentChange * (row.marketCap / totalMarketCap),
    }));
  const bulls = pressureRows.filter((row) => row.contribution > 0).sort((left, right) => right.contribution - left.contribution).slice(0, 5);
  const bears = pressureRows.filter((row) => row.contribution < 0).sort((left, right) => left.contribution - right.contribution).slice(0, 5);
  const movers: MarketMoverRow[] = rows.map(({ symbol, percentChange }) => ({ symbol, percentChange }));
  const gainers = movers.filter((row) => row.percentChange > 0).sort((left, right) => right.percentChange - left.percentChange).slice(0, 5);
  const losers = movers.filter((row) => row.percentChange < 0).sort((left, right) => left.percentChange - right.percentChange).slice(0, 5);

  return (
    <>
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="index-summary-title">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(112px,0.7fr)] items-center gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-2 sm:gap-x-4">
              <h2 id="index-summary-title" className="text-3xl font-bold tracking-[-0.05em] text-[#203a63] sm:text-5xl">{session?.indexClose?.toLocaleString("en-PK", { maximumFractionDigits: 2 }) ?? "—"}</h2>
              <span className={`text-sm font-bold leading-5 tabular-nums sm:text-lg ${indexChange == null ? "text-slate-500" : indexChange > 0 ? "text-emerald-600" : indexChange < 0 ? "text-rose-600" : "text-slate-500"}`}>{indexChange == null || indexPoints == null ? "Change unavailable" : `${signedPercent(indexChange)} · ${indexPoints >= 0 ? "+" : ""}${indexPoints.toFixed(2)} pts`}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#0f172a] px-2.5 py-2 sm:px-4 sm:py-2.5" title="Last 30 available sessions"><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 sm:text-[10px] sm:tracking-[0.12em]">30-session trend</div><MiniIndexChart values={history} /></div>
        </div>
      </section>
      <MarketHighlights gainers={gainers} losers={losers} bulls={bulls} bears={bears} />
    </>
  );
}
