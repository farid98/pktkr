"use client";

import { useState } from "react";

export type MarketMoverRow = {
  symbol: string;
  percentChange: number;
};

export type MarketPressureRow = MarketMoverRow & {
  contribution: number;
};

type View = "movers" | "pressure";

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function RankedList({ rows, view, direction }: { rows: MarketMoverRow[] | MarketPressureRow[]; view: View; direction: "up" | "down" }) {
  const positive = direction === "up";
  const accentClass = positive ? "text-[#34d399]" : "text-[#fb7185]";
  const fillClass = positive ? "bg-emerald-400/20" : "bg-rose-400/20";
  const metric = (row: MarketMoverRow | MarketPressureRow) =>
    view === "pressure" ? Math.abs((row as MarketPressureRow).contribution) : Math.abs(row.percentChange);
  const maxMetric = Math.max(...rows.map(metric), 0.001);

  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        return (
          <div key={row.symbol} className="grid grid-cols-[20px_minmax(0,1fr)_52px] items-center gap-2 text-xs">
            <span className="text-slate-500">{index + 1}</span>
            <span className="relative overflow-hidden rounded-md bg-slate-800/70 px-2 py-2 font-bold text-slate-100">
              <span className={`absolute inset-y-0 left-0 ${fillClass}`} style={{ width: `${(metric(row) / maxMetric) * 100}%` }} />
              <span className="relative">{row.symbol}</span>
            </span>
            <span className={`text-right font-semibold tabular-nums ${accentClass}`}>{signedPercent(row.percentChange)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MarketHighlights({
  gainers,
  losers,
  bulls,
  bears,
}: {
  gainers: MarketMoverRow[];
  losers: MarketMoverRow[];
  bulls: MarketPressureRow[];
  bears: MarketPressureRow[];
}) {
  const [view, setView] = useState<View>("movers");
  const isMovers = view === "movers";
  const leftRows = isMovers ? gainers : bulls;
  const rightRows = isMovers ? losers : bears;
  const leftHeading = isMovers ? "Top 5 gainers" : "Top 5 bulls";
  const rightHeading = isMovers ? "Top 5 losers" : "Top 5 bears";

  return (
    <section className="mb-6 rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-lg shadow-slate-900/10 sm:p-5" aria-label="KSE-100 market highlights">
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.03em] text-white">{isMovers ? "Daily movers" : "Market-cap-weighted pressure"}</h2>
          <p className="mt-1 text-xs text-slate-400">{isMovers ? "Largest percentage moves in the selected session" : "Largest positive and negative pulls on the market-cap basket"}</p>
        </div>
        <div className="flex shrink-0 rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-bold">
          <button type="button" onClick={() => setView("movers")} aria-pressed={isMovers} className={`rounded-md px-2.5 py-1.5 transition sm:px-3 ${isMovers ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>Movers</button>
          <button type="button" onClick={() => setView("pressure")} aria-pressed={!isMovers} className={`rounded-md px-2.5 py-1.5 transition sm:px-3 ${!isMovers ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>Bulls & bears</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-[-0.02em] text-[#34d399]">{leftHeading} <span>↑</span></h3>
          <RankedList rows={leftRows} view={view} direction="up" />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-[-0.02em] text-[#fb7185]">{rightHeading} <span>↓</span></h3>
          <RankedList rows={rightRows} view={view} direction="down" />
        </div>
      </div>
    </section>
  );
}
