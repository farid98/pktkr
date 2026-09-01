"use client";

import { Fragment, useMemo, useState } from "react";

import type { MarketRow, TickerHistory } from "@/lib/market-types";

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatVolume(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

type SortKey = "symbol" | "price" | "change" | "volume" | "trend";
type SortRule = { key: SortKey; direction: "asc" | "desc" };

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "change", label: "Daily change" },
  { key: "volume", label: "Volume" },
  { key: "price", label: "Price" },
  { key: "trend", label: "30-session trend" },
  { key: "symbol", label: "Ticker" },
];

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
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const filteredRows = useMemo(() => {
    const matchingRows = rows.filter((row) => `${row.symbol} ${row.company}`.toLowerCase().includes(query.toLowerCase()));
    if (!sortRules.length) return matchingRows;
    return [...matchingRows].sort((a, b) => {
      for (const rule of sortRules) {
        let comparison = 0;
        if (rule.key === "symbol") comparison = a.symbol.localeCompare(b.symbol);
        if (rule.key === "price") comparison = a.close - b.close;
        if (rule.key === "change") comparison = a.percentChange - b.percentChange;
        if (rule.key === "volume") comparison = a.volume - b.volume;
        if (rule.key === "trend") {
          const aHistory = history[a.symbol] ?? [];
          const bHistory = history[b.symbol] ?? [];
          const aTrend = aHistory.length >= 2 ? aHistory.at(-1)! / aHistory[0] - 1 : 0;
          const bTrend = bHistory.length >= 2 ? bHistory.at(-1)! / bHistory[0] - 1 : 0;
          comparison = aTrend - bTrend;
        }
        if (comparison) return rule.direction === "asc" ? comparison : -comparison;
      }
      return a.symbol.localeCompare(b.symbol);
    });
  }, [history, query, rows, sortRules]);

  function sortBy(nextKey: SortKey) {
    if (sortRules[0]?.key === nextKey) {
      setSortRules([{ key: nextKey, direction: sortRules[0].direction === "asc" ? "desc" : "asc" }]);
    } else {
      setSortRules([{ key: nextKey, direction: "asc" }]);
    }
  }

  function setMobileSort(index: number, value: string) {
    setSortRules((rules) => {
      const nextRules = [...rules];
      if (!value) {
        nextRules.splice(index, 1);
      } else {
        nextRules[index] = { key: value as SortKey, direction: nextRules[index]?.direction ?? "desc" };
      }
      return nextRules;
    });
  }

  function setMobileDirection(index: number, direction: "asc" | "desc") {
    setSortRules((rules) => rules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, direction } : rule));
  }

  function sortLabel(key: SortKey, label: string) {
    const activeRule = sortRules.find((rule) => rule.key === key);
    return <button type="button" onClick={() => sortBy(key)} className="inline-flex items-center gap-1 font-bold hover:text-white" aria-label={`Sort by ${label}`}><span>{label}</span><span aria-hidden="true" className={activeRule ? "text-white" : "text-slate-500"}>{activeRule ? activeRule.direction === "asc" ? "↑" : "↓" : "↕"}</span></button>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col items-end gap-2 border-b border-slate-100 px-4 py-4 sm:px-6">
        <label className="sr-only" htmlFor="ticker-search">Search tickers</label>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <input id="ticker-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol or company" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#58749b] focus:ring-2 focus:ring-[#dbe7f2] sm:w-64 sm:flex-none" />
          <button type="button" className="h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800" aria-expanded={showSortOptions} onClick={() => setShowSortOptions((visible) => !visible)}>Sort</button>
        </div>
        {showSortOptions && <div className="grid w-full grid-cols-[1fr_auto] gap-2 rounded-lg bg-slate-50 p-3">
          <label className="self-center text-xs font-semibold text-slate-600" htmlFor="primary-sort">Primary sort</label>
          <div className="flex gap-2"><select id="primary-sort" value={sortRules[0]?.key ?? ""} onChange={(event) => setMobileSort(0, event.target.value)} className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="">Source order</option>{sortOptions.map((option) => <option value={option.key} key={option.key}>{option.label}</option>)}</select>{sortRules[0] && <select aria-label="Primary sort direction" value={sortRules[0].direction} onChange={(event) => setMobileDirection(0, event.target.value as "asc" | "desc")} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="desc">Desc</option><option value="asc">Asc</option></select>}</div>
          <label className="self-center text-xs font-semibold text-slate-600" htmlFor="secondary-sort">Then by</label>
          <div className="flex gap-2"><select id="secondary-sort" value={sortRules[1]?.key ?? ""} disabled={!sortRules[0]} onChange={(event) => setMobileSort(1, event.target.value)} className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 disabled:bg-slate-100"><option value="">None</option>{sortOptions.filter((option) => option.key !== sortRules[0]?.key).map((option) => <option value={option.key} key={option.key}>{option.label}</option>)}</select>{sortRules[1] && <select aria-label="Secondary sort direction" value={sortRules[1].direction} onChange={(event) => setMobileDirection(1, event.target.value as "asc" | "desc")} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value="desc">Desc</option><option value="asc">Asc</option></select>}</div>
        </div>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-sm md:min-w-[720px]">
          <thead className="bg-[#0f172a] text-[11px] uppercase tracking-[0.06em] text-slate-300"><tr><th className="px-4 py-3 text-left font-bold sm:px-6">{sortLabel("symbol", "Ticker")}</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">{sortLabel("price", "Price")}</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">{sortLabel("change", "Change")}</th><th className="hidden px-3 py-3 text-right font-bold md:table-cell">{sortLabel("volume", "Volume")}</th><th className="hidden px-4 py-3 text-right font-bold md:table-cell sm:px-6">{sortLabel("trend", "30-session trend")}</th></tr></thead>
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
                <td className="hidden px-3 py-3 text-right font-medium tabular-nums text-slate-600 md:table-cell">{formatVolume(row.volume)}</td>
                <td className="px-2 py-3 sm:px-6 md:table-cell"><div className="flex justify-end"><Sparkline values={tickerHistory} positive={trendPositive} /></div></td>
              </tr>
              {isExpanded && <tr className="border-b border-slate-100 bg-slate-50/60 md:hidden"><td colSpan={5} className="px-4 pb-4 pt-1"><div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">{row.company}</span><span className="shrink-0 text-xs tabular-nums text-slate-500">Volume {formatVolume(row.volume)}</span></div></td></tr>}
            </Fragment>;
          })}</tbody>
        </table>
      </div>
    </section>
  );
}
