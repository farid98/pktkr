"use client";

import { ArrowDownAZ, ArrowUpAZ, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import type { MarketRow } from "@/lib/market-types";

type SortField = "company" | "sector" | "marketCap";
type SortDirection = "asc" | "desc";

const sortLabels: Record<SortField, string> = {
  company: "Name",
  sector: "Category",
  marketCap: "Market cap",
};

function formatMarketCap(value: number) {
  const absolute = Math.abs(value);
  for (const [threshold, suffix] of [
    [1_000_000_000_000, "T"],
    [1_000_000_000, "B"],
    [1_000_000, "M"],
  ] as const) {
    if (absolute >= threshold) return `PKR ${(value / threshold).toFixed(2)}${suffix}`;
  }
  return `PKR ${value.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function changeClass(value: number) {
  return value > 0
    ? "text-emerald-700"
    : value < 0
      ? "text-rose-700"
      : "text-slate-500";
}

export function StockExplorer({ rows }: { rows: MarketRow[] }) {
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const sortedRows = useMemo(() => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortField];
      const rightValue = right[sortField];
      const comparison =
        typeof leftValue === "string" && typeof rightValue === "string"
          ? leftValue.localeCompare(rightValue)
          : Number(leftValue) - Number(rightValue);
      return comparison === 0 ? left.symbol.localeCompare(right.symbol) : comparison * multiplier;
    });
  }, [rows, sortDirection, sortField]);

  const selectSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection(field === "marketCap" ? "desc" : "asc");
  };

  const SortIcon = sortDirection === "asc" ? ChevronUp : ChevronDown;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-500">{rows.length} KSE-100 companies</p>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sort-companies" className="font-medium text-slate-600">Sort by</label>
          <select
            id="sort-companies"
            value={sortField}
            onChange={(event) => {
              const field = event.target.value as SortField;
              setSortField(field);
              setSortDirection(field === "marketCap" ? "desc" : "asc");
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {Object.entries(sortLabels).map(([field, label]) => (
              <option key={field} value={field}>{label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
          >
            {sortDirection === "asc" ? <ArrowUpAZ size={17} /> : <ArrowDownAZ size={17} />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.06em] text-slate-500">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-bold sm:px-6">Symbol</th>
              {(Object.keys(sortLabels) as SortField[]).map((field) => (
                <th key={field} className={`border-b border-slate-200 px-3 py-3 font-bold ${field === "marketCap" ? "text-right" : ""}`}>
                  <button
                    type="button"
                    onClick={() => selectSort(field)}
                    className={`inline-flex items-center gap-1 transition hover:text-slate-900 ${field === "marketCap" ? "justify-end" : ""}`}
                    aria-label={`Sort by ${sortLabels[field]}`}
                  >
                    {sortLabels[field]}
                    {field === sortField ? <SortIcon size={14} aria-hidden="true" /> : null}
                  </button>
                </th>
              ))}
              <th className="border-b border-slate-200 px-3 py-3 text-right font-bold">Close</th>
              <th className="border-b border-slate-200 px-4 py-3 text-right font-bold sm:px-6">Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.symbol} className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-b-0">
                <td className="whitespace-nowrap px-4 py-3 font-bold text-[#203a63] sm:px-6">{row.symbol}</td>
                <td className="px-3 py-3 text-slate-700">{row.company}</td>
                <td className="px-3 py-3 text-slate-600">{titleCase(row.sector)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700">{formatMarketCap(row.marketCap)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700">PKR {row.close.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-semibold tabular-nums sm:px-6 ${changeClass(row.percentChange)}`}>
                  {row.percentChange >= 0 ? "+" : ""}{row.percentChange.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
