"use client";

import { Fragment, useMemo, useState } from "react";

import type { MarketRow, TickerHistory } from "@/lib/market-types";

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

type SortKey = "symbol" | "price" | "change" | "trend";

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
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const filteredRows = useMemo(() => {
    const matchingRows = rows.filter((row) => `${row.symbol} ${row.company}`.toLowerCase().includes(query.toLowerCase()));
    if (!sortKey) return matchingRows;
    return [...matchingRows].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "symbol") comparison = a.symbol.localeCompare(b.symbol);
      if (sortKey === "price") comparison = a.close - b.close;
      if (sortKey === "change") comparison = a.percentChange - b.percentChange;
      if (sortKey === "trend") {
        const aHistory = history[a.symbol] ?? [];
        const bHistory = history[b.symbol] ?? [];
        const aTrend = aHistory.length >= 2 ? aHistory.at(-1)! / aHistory[0] - 1 : 0;
        const bTrend = bHistory.length >= 2 ? bHistory.at(-1)! / bHistory[0] - 1 : 0;
        comparison = aTrend - bTrend;
      }
      return (sortDirection === "asc" ? comparison : -comparison) || a.symbol.localeCompare(b.symbol);
    });
  }, [history, query, rows, sortDirection, sortKey]);

  function sortBy(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(nextKey);
      setSortDirection("asc");
    }
  }

  function sortLabel(key: SortKey, label: string) {
    const active = sortKey === key;
    return <button type="button" onClick={() => sortBy(key)} className="inline-flex items-center gap-1 font-bold hover:text-white" aria-label={`Sort by ${label}`}><span>{label}</span><span aria-hidden="true" className={active ? "text-white" : "text-slate-500"}>{active ? sortDirection === "asc" ? "↑" : "↓" : "↕"}</span></button>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="text-sm font-semibold text-[#203a63]">KSE-100 tickers</p><p className="mt-1 text-xs text-slate-500">{filteredRows.length} of {rows.length} companies · 30-session price trend</p></div>
        <label className="sr-only" htmlFor="ticker-search">Search tickers</label>
        <input id="ticker-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol or company" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#58749b] focus:ring-2 focus:ring-[#dbe7f2] sm:w-64" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-sm md:min-w-[720px]">
          <thead className="bg-[#0f172a] text-[11px] uppercase tracking-[0.06em] text-slate-300"><tr><th className="px-4 py-3 text-left font-bold sm:px-6">{sortLabel("symbol", "Ticker")}</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">{sortLabel("price", "Price")}</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">{sortLabel("change", "Change")}</th><th className="hidden px-4 py-3 text-right font-bold md:table-cell sm:px-6">{sortLabel("trend", "30-session trend")}</th></tr></thead>
          <tbody>{filteredRows.map((row) => {
            const isExpanded = expandedSymbol === row.symbol;
            const changeColor = row.percentChange > 0 ? "text-emerald-700" : row.percentChange < 0 ? "text-rose-700" : "text-slate-500";
            const tickerHistory = history[row.symbol] ?? [];
            const trendPositive = tickerHistory.length >= 2 ? tickerHistory[tickerHistory.length - 1] >= tickerHistory[0] : row.percentChange >= 0;
            return <Fragment key={row.symbol}>
              <tr className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#58749b]" tabIndex={0} role="button" aria-expanded={isExpanded} onClick={() => setExpandedSymbol(isExpanded ? null : row.symbol)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExpandedSymbol(isExpanded ? null : row.symbol); } }}>
                <td className="px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <a href={`https://dps.psx.com.pk/company/${encodeURIComponent(row.symbol)}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="font-bold text-[#203a63] underline decoration-slate-200 underline-offset-2 hover:text-[#315a8a]">{row.symbol}</a>
                  </div>
                  <span className="hidden max-w-[300px] truncate text-xs text-slate-500 md:block">{row.company}</span>
                  <span className="mt-1 flex items-center gap-3 text-xs md:hidden"><span className="font-medium tabular-nums text-slate-700">PKR {row.close.toFixed(2)}</span><span className={`font-semibold tabular-nums ${changeColor}`}>{signedPercent(row.percentChange)}</span></span>
                </td>
                <td className="hidden px-3 py-3 text-right font-medium tabular-nums text-slate-700 md:table-cell">PKR {row.close.toFixed(2)}</td>
                <td className={`hidden px-3 py-3 text-right font-semibold tabular-nums md:table-cell ${changeColor}`}>{signedPercent(row.percentChange)}</td>
                <td className="px-2 py-3 sm:px-6 md:table-cell"><div className="flex justify-end"><Sparkline values={tickerHistory} positive={trendPositive} /></div></td>
              </tr>
              {isExpanded && <tr className="border-b border-slate-100 bg-slate-50/60 md:hidden"><td colSpan={4} className="px-4 pb-4 pt-1"><div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">{row.company}</span><span className="shrink-0 text-xs tabular-nums text-slate-500">Volume {new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(row.volume)}</span></div></td></tr>}
            </Fragment>;
          })}</tbody>
        </table>
      </div>
    </section>
  );
}
