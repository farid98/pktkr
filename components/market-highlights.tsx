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

function formatBasisPoints(value: number) {
  return `${value >= 0 ? "+" : "−"}${Math.round(Math.abs(value * 100))} bps`;
}

function RankedList({ rows, view, direction }: { rows: MarketMoverRow[] | MarketPressureRow[]; view: View; direction: "up" | "down" }) {
  const positive = direction === "up";
  const accentClass = positive ? "text-green-600" : "text-red-600";
  const fillClass = positive ? "bg-green-500/30" : "bg-red-500/30";
  const metric = (row: MarketMoverRow | MarketPressureRow) =>
    view === "pressure" ? Math.abs((row as MarketPressureRow).contribution) : Math.abs(row.percentChange);
  const maxMetric = Math.max(...rows.map(metric), 0.001);
  const hasContribution = view === "pressure";

  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        const contribution = hasContribution ? (row as MarketPressureRow).contribution : null;
        return (
          <div key={row.symbol} className={`grid items-center gap-2 text-xs ${hasContribution ? "grid-cols-[20px_minmax(0,1fr)_66px]" : "grid-cols-[20px_minmax(0,1fr)_52px]"}`}>
            <span className="text-slate-500">{index + 1}</span>
            <span className="relative overflow-hidden rounded-md px-2 py-2 font-bold text-slate-800">
              <span className={`absolute inset-y-0 left-0 ${fillClass}`} style={{ width: `${(metric(row) / maxMetric) * 100}%` }} />
              <span className="relative">{row.symbol}</span>
            </span>
            <span className="text-right tabular-nums">
              <span className="block text-[10px] font-semibold text-slate-500">{signedPercent(row.percentChange)}</span>
              {contribution !== null ? <span className={`block text-sm font-bold ${accentClass}`}>{formatBasisPoints(contribution)}</span> : null}
            </span>
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
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="KSE-100 market highlights">
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.03em] text-[#203a63]">{isMovers ? "Daily movers" : "Mkt-cap-weighted"}</h2>
          <p className="mt-1 text-xs text-slate-500">{isMovers ? "" : "Est. basket impact · 1 bp = 0.01%"}</p>
        </div>
        <div className="flex shrink-0 rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-bold">
          <button type="button" onClick={() => setView("movers")} aria-pressed={isMovers} className={`rounded-md px-2.5 py-1.5 transition sm:px-3 ${isMovers ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>Movers</button>
          <button type="button" onClick={() => setView("pressure")} aria-pressed={!isMovers} className={`rounded-md px-2.5 py-1.5 transition sm:px-3 ${!isMovers ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>Bulls & bears</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-[-0.02em] text-green-600">{leftHeading} <span>↑</span></h3>
          <RankedList rows={leftRows} view={view} direction="up" />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-[-0.02em] text-red-600">{rightHeading} <span>↓</span></h3>
          <RankedList rows={rightRows} view={view} direction="down" />
        </div>
      </div>
    </section>
  );
}
