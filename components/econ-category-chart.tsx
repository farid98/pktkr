"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";

import type { TradeCategory } from "@/lib/econ-data";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse bg-slate-50" />,
});

type TradeType = "exports" | "imports";
type CategoryLevel = "major_groups" | "selected_commodities";
type View = "value" | "share";

const palette = ["#0f766e", "#155e75", "#2563eb", "#4f46e5", "#7c3aed", "#a855f7", "#c026d3", "#db2777", "#e11d48", "#ea580c", "#d97706"];

function formatValue(value: number) {
  return value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}T` : `$${(value / 1000).toFixed(1)}B`;
}

export function EconCategoryChart({ data }: { data: TradeCategory[] }) {
  const [tradeType, setTradeType] = useState<TradeType>("exports");
  const [categoryLevel, setCategoryLevel] = useState<CategoryLevel>("selected_commodities");
  const [view, setView] = useState<View>("value");
  const filtered = useMemo(() => data.filter((row) => row.tradeType === tradeType && row.categoryLevel === categoryLevel), [data, tradeType, categoryLevel]);
  const years = useMemo(() => Array.from(new Set(filtered.map((row) => row.fiscalYear))), [filtered]);
  const categories = useMemo(() => {
    const latest = years.at(-1);
    return Array.from(new Set(filtered.map((row) => row.category))).sort((a, b) => {
      const av = filtered.find((row) => row.fiscalYear === latest && row.category === a)?.valueMillionUsd ?? 0;
      const bv = filtered.find((row) => row.fiscalYear === latest && row.category === b)?.valueMillionUsd ?? 0;
      return bv - av;
    });
  }, [filtered, years]);

  const totals = useMemo(() => Object.fromEntries(years.map((year) => [year, filtered.filter((row) => row.fiscalYear === year).reduce((sum, row) => sum + row.valueMillionUsd, 0)])), [filtered, years]);
  const traces: Data[] = categories.map((category, index) => ({
    type: "bar",
    name: category,
    x: years,
    y: years.map((year) => {
      const value = filtered.find((row) => row.fiscalYear === year && row.category === category)?.valueMillionUsd ?? 0;
      return view === "share" ? (value / (totals[year] || 1)) * 100 : value;
    }),
    marker: { color: palette[index % palette.length] },
    customdata: years.map((year) => {
      const value = filtered.find((row) => row.fiscalYear === year && row.category === category)?.valueMillionUsd ?? 0;
      return [value, totals[year] || 0, (value / (totals[year] || 1)) * 100];
    }),
    hovertemplate: view === "share"
      ? `<b>${category}</b><br>%{x}<br>%{y:.1f}% of selected ${tradeType}<br>Value: $%{customdata[0]:,.0f}M<extra></extra>`
      : `<b>${category}</b><br>%{x}<br>$%{y:,.0f}M<extra></extra>`,
  }));

  const latestTotal = totals[years.at(-1) ?? ""] ?? 0;
  const latestTop = categories[0];
  const latestTopValue = filtered.find((row) => row.fiscalYear === years.at(-1) && row.category === latestTop)?.valueMillionUsd ?? 0;
  const layout: Partial<Layout> = {
    autosize: true,
    height: 560,
    margin: { t: 28, r: 20, b: 88, l: 74 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    barmode: "stack",
    barnorm: view === "share" ? "percent" : undefined,
    font: { family: "Arial, sans-serif", color: "#334155", size: 12 },
    legend: { orientation: "h", y: -0.23, x: 0, font: { size: 10 } },
    xaxis: { title: { text: "Fiscal year" }, showgrid: false, type: "category" },
    yaxis: view === "share"
      ? { title: { text: "Share of selected categories" }, ticksuffix: "%", range: [0, 100], gridcolor: "#e2e8f0" }
      : { title: { text: "Million USD" }, tickprefix: "$", separatethousands: true, gridcolor: "#e2e8f0", zeroline: false },
    hovermode: "closest",
    hoverlabel: { bgcolor: "#ffffff", bordercolor: "#cbd5e1", font: { color: "#172033", size: 13 } },
  };
  const config: Partial<Config> = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] };

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="text-xs font-semibold text-slate-500">{categoryLevel === "major_groups" ? "Major commodity groups" : "Selected commodities"} · {years[0]} to {years.at(-1)}</p><p className="text-sm text-slate-400">Values shown in million USD · stacked categories show the mix by fiscal year</p></div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Trade type">
            {(["exports", "imports"] as TradeType[]).map((item) => <button key={item} type="button" onClick={() => setTradeType(item)} className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${tradeType === item ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item}</button>)}
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Category level">
            {(["selected_commodities", "major_groups"] as CategoryLevel[]).map((item) => <button key={item} type="button" onClick={() => setCategoryLevel(item)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${categoryLevel === item ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item === "selected_commodities" ? "Recent commodities" : "Major groups"}</button>)}
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Chart units">
            <button type="button" onClick={() => setView("value")} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "value" ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Value</button>
            <button type="button" onClick={() => setView("share")} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "share" ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Share</button>
          </div>
        </div>
      </div>
      <div className="px-1 pt-2 sm:px-4"><Plot data={traces} layout={layout} config={config} useResizeHandler style={{ width: "100%" }} /></div>
      <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3">
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected total</p><p className="mt-1 text-lg font-bold text-[#203a63]">{formatValue(latestTotal)}</p></div>
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Largest category</p><p className="mt-1 truncate text-sm font-bold text-slate-700" title={latestTop}>{latestTop}</p></div>
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Largest share</p><p className="mt-1 text-lg font-bold text-[#0f766e]">{((latestTopValue / (latestTotal || 1)) * 100).toFixed(1)}%</p></div>
      </div>
    </div>
  );
}
