"use client";

import { useMemo, useState } from "react";

import type { MarketRow, TickerHistory } from "@/lib/market-types";

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  if (values.length < 2) return <span className="text-xs text-slate-400">No history</span>;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${28 - ((value - min) / range) * 24}`).join(" ");
  return <svg viewBox="0 0 100 32" role="img" aria-label={`30-session ${positive ? "rising" : "falling"} price trend`} className="h-8 w-28"><polyline points={points} fill="none" stroke={positive ? "#0f766e" : "#e11d48"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}

export function TickerBoard({ rows, history }: { rows: MarketRow[]; history: TickerHistory }) {
  const [query, setQuery] = useState("");
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const filteredRows = useMemo(() => rows.filter((row) => `${row.symbol} ${row.company}`.toLowerCase().includes(query.toLowerCase())), [query, rows]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="text-sm font-semibold text-[#203a63]">KSE-100 tickers</p><p className="mt-1 text-xs text-slate-500">{filteredRows.length} of {rows.length} companies · 30-session price trend</p></div>
        <label className="sr-only" htmlFor="ticker-search">Search tickers</label>
        <input id="ticker-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol or company" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#58749b] focus:ring-2 focus:ring-[#dbe7f2] sm:w-64" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-sm md:min-w-[720px]">
          <thead className="bg-[#0f172a] text-[11px] uppercase tracking-[0.06em] text-slate-300"><tr><th className="px-4 py-3 text-left font-bold sm:px-6">Ticker</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">Price</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">Change</th><th className="hidden px-4 py-3 text-right font-bold md:table-cell sm:px-6">30-session trend</th></tr></thead>
          <tbody>{filteredRows.map((row) => {
            const isExpanded = expandedSymbol === row.symbol;
            const changeColor = row.percentChange > 0 ? "text-emerald-700" : row.percentChange < 0 ? "text-rose-700" : "text-slate-500";
            const tickerHistory = history[row.symbol] ?? [];
            const trendPositive = tickerHistory.length >= 2 ? tickerHistory[tickerHistory.length - 1] >= tickerHistory[0] : row.percentChange >= 0;
            return <>
              <tr key={row.symbol} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                <td className="px-4 py-3 sm:px-6">
                  <button type="button" className="w-full text-left md:pointer-events-none" aria-expanded={isExpanded} onClick={() => setExpandedSymbol(isExpanded ? null : row.symbol)}>
                    <span className="block font-bold text-[#203a63]">{row.symbol}</span>
                    <span className="hidden max-w-[300px] truncate text-xs text-slate-500 md:block">{row.company}</span>
                    <span className="mt-1 flex items-center gap-3 text-xs md:hidden"><span className="font-medium tabular-nums text-slate-700">PKR {row.close.toFixed(2)}</span><span className={`font-semibold tabular-nums ${changeColor}`}>{signedPercent(row.percentChange)}</span><span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-slate-400">{isExpanded ? "Hide" : "View"}</span></span>
                  </button>
                </td>
                <td className="hidden px-3 py-3 text-right font-medium tabular-nums text-slate-700 md:table-cell">PKR {row.close.toFixed(2)}</td>
                <td className={`hidden px-3 py-3 text-right font-semibold tabular-nums md:table-cell ${changeColor}`}>{signedPercent(row.percentChange)}</td>
                <td className="hidden px-4 py-3 md:table-cell sm:px-6"><div className="flex justify-end"><Sparkline values={tickerHistory} positive={trendPositive} /></div></td>
              </tr>
              {isExpanded && <tr key={`${row.symbol}-details`} className="border-b border-slate-100 bg-slate-50/60 md:hidden"><td colSpan={4} className="px-4 pb-4 pt-1"><div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">{row.company}</span><Sparkline values={tickerHistory} positive={trendPositive} /></div></td></tr>}
            </>;
          })}</tbody>
        </table>
      </div>
    </section>
  );
}
