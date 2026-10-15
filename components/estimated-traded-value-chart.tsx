"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";
import type { TradingActivityPoint } from "@/lib/market-types";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading market activity…</div>,
});

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(`${date}T12:00:00+05:00`));
}

export function EstimatedTradedValueChart({ points, asOf }: { points: TradingActivityPoint[]; asOf: string }) {
  const [period, setPeriod] = useState<30 | 90 | 120>(120);


  const visible = useMemo(() => {
    const start = new Date(`${asOf}T12:00:00Z`);
    start.setUTCDate(start.getUTCDate() - period + 1);
    const cutoff = start.toISOString().slice(0, 10);
    return points.filter((point) => point.date >= cutoff && point.date <= asOf);
  }, [asOf, period, points]);
  const data = useMemo<Data[]>(() => [
    {
      type: "scatter", mode: "lines", name: "KSE-100 · left", x: visible.map((p) => p.date), y: visible.map((p) => p.indexClose),
      line: { color: "#265f9c", width: 2.3 }, connectgaps: false,
      hovertemplate: "KSE-100: %{y:,.2f} points<extra></extra>",
    },
    {
      type: "scatter", mode: "lines", name: "Est. traded value · right", x: visible.map((p) => p.date),
      y: visible.map((p) => p.estimatedTradedValue === null ? null : p.estimatedTradedValue / 1e9),
      customdata: visible.map((p) => p.estimatedTradedValue), yaxis: "y2",
      line: { color: "#a56719", width: 2 }, connectgaps: false,
      hovertemplate: "Estimated Traded Value: PKR %{customdata:,.0f}<extra></extra>",
    },
  ], [visible]);
  const layout: Partial<Layout> = {
    autosize: true, margin: { l: 62, r: 57, t: 12, b: 48 },
    paper_bgcolor: "#ffffff", plot_bgcolor: "#ffffff",
    font: { family: "Arial, sans-serif", size: 11, color: "#526271" },
    hovermode: "x unified", showlegend: false,
    xaxis: { type: "date", tickformat: "%d %b", tickvals: [...new Set([0, Math.floor((visible.length - 1) / 3), Math.floor(2 * (visible.length - 1) / 3), visible.length - 1])].filter((i) => i >= 0 && visible[i]).map((i) => visible[i].date), showgrid: false, zeroline: false, fixedrange: false },
    yaxis: { tickformat: ",.0f", nticks: 5, color: "#265f9c", gridcolor: "#e4e8ed", zeroline: false, automargin: true },
    yaxis2: { title: { text: "Estimated Traded Value (PKR billion)", font: { size: 11 }, standoff: 12 }, overlaying: "y", side: "right", rangemode: "tozero", ticksuffix: "B", tickformat: ".0f", nticks: 5, color: "#a56719", showgrid: false, zeroline: false, automargin: true },
    uirevision: `${asOf}-${period}`,
  };
  const config: Partial<Config> = { responsive: true, displayModeBar: false, scrollZoom: false };

  return (
    <section aria-labelledby="estimated-traded-value-heading" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-5 sm:px-6">
        <div>
          <h2 id="estimated-traded-value-heading" className="text-xl font-bold tracking-[-0.02em] text-[#203a63] sm:text-2xl">KSE-100 & estimated traded value</h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{visible.length ? `${displayDate(visible[0].date)}–${displayDate(visible[visible.length - 1].date)}` : "No sessions available"}</p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold" aria-label="Market activity period">
          {([30, 90, 120] as const).map((days) => <button key={days} type="button" aria-pressed={period === days} onClick={() => setPeriod(days)} className={`rounded-md px-3 py-1.5 transition ${period === days ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{days}D</button>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 px-4 text-xs font-medium sm:px-6" aria-label="Chart axes">
        <span className="text-[#265f9c]">━ KSE-100 · points · left</span>
        <span className="text-[#a56719]">━ Estimated Traded Value · PKR billion · right</span>
      </div>
      <div className="h-[320px] sm:h-[420px]" role="img" aria-label="Interactive daily KSE-100 index and estimated traded value. Hover or tap for each session’s values. Estimated value is the sum of downloaded stock volume multiplied by closing price.">
        {visible.length >= 2 ? <Plot data={data} layout={layout} config={config} useResizeHandler style={{ width: "100%", height: "100%" }} /> : <p className="p-6 text-sm text-slate-500">Not enough history is available for this period.</p>}
      </div>
    </section>
  );
}
