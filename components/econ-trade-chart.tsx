"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";

import type { TradeYear } from "@/lib/econ-data";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="h-[430px] animate-pulse bg-slate-50" />,
});

type WindowKey = "all" | "20" | "10";

const windows: { key: WindowKey; label: string }[] = [
  { key: "all", label: "All years" },
  { key: "20", label: "Last 20" },
  { key: "10", label: "Last 10" },
];

function compact(value: number) {
  return value >= 1000 ? `$${(value / 1000).toFixed(1)}B` : `$${Math.round(value)}M`;
}

export function EconTradeChart({ data }: { data: TradeYear[] }) {
  const [windowKey, setWindowKey] = useState<WindowKey>("20");
  const visible = useMemo(() => {
    if (windowKey === "all") return data;
    return data.slice(-Number(windowKey));
  }, [data, windowKey]);

  const x = visible.map((row) => row.fiscalYear);
  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Exports",
      x,
      y: visible.map((row) => row.exports),
      line: { color: "#0f766e", width: 3 },
      marker: { color: "#0f766e", size: 8 },
      customdata: visible.map((row) => [row.exports, row.imports, row.balance]),
      hovertemplate: "<b>%{x}</b><br>Exports: $%{customdata[0]:,.0f}M<extra></extra>",
    },
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Imports",
      x,
      y: visible.map((row) => row.imports),
      line: { color: "#d97706", width: 3 },
      marker: { color: "#d97706", size: 8 },
      hovertemplate: "<b>%{x}</b><br>Imports: $%{y:,.0f}M<extra></extra>",
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    height: 455,
    margin: { t: 18, r: 20, b: 70, l: 70 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: { family: "Arial, sans-serif", color: "#334155", size: 12 },
    hovermode: "x unified",
    legend: { orientation: "h", y: 1.08, x: 0, font: { size: 13 } },
    xaxis: { title: { text: "Fiscal year" }, showgrid: false, tickangle: -42 },
    yaxis: { title: { text: "Million US$" }, tickprefix: "$", separatethousands: true, gridcolor: "#e2e8f0", zeroline: false },
    hoverlabel: { bgcolor: "#ffffff", bordercolor: "#cbd5e1", font: { color: "#172033", size: 13 } },
  };

  const config: Partial<Config> = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs font-semibold text-slate-500">Interactive view</p>
          <p className="text-sm text-slate-400">Hover for exact values · drag to zoom</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Chart time range">
          {windows.map((item) => (
            <button key={item.key} type="button" onClick={() => setWindowKey(item.key)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${windowKey === item.key ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-1 pt-2 sm:px-4">
        <Plot data={traces} layout={layout} config={config} useResizeHandler style={{ width: "100%" }} />
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-4">
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest exports</p><p className="mt-1 text-lg font-bold text-[#0f766e]">{compact(data.at(-1)?.exports ?? 0)}</p></div>
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest imports</p><p className="mt-1 text-lg font-bold text-[#d97706]">{compact(data.at(-1)?.imports ?? 0)}</p></div>
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trade balance</p><p className="mt-1 text-lg font-bold text-rose-600">{compact(Math.abs(data.at(-1)?.balance ?? 0))} deficit</p></div>
        <div className="bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coverage</p><p className="mt-1 text-lg font-bold text-[#203a63]">{data.length} years</p></div>
      </div>
    </div>
  );
}
