"use client";

import dynamic from "next/dynamic";
import type { Config, Data, Layout } from "plotly.js";

import type { ItExportComparison, ItExportPoint } from "@/lib/economy/it-export-data";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse bg-slate-50" /> });

const chartConfig: Partial<Config> = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] };

export function ItExportAnalysis({ data, comparison }: { data: ItExportPoint[]; comparison: ItExportComparison[] }) {
  const annual = data.filter((row) => row.period.startsWith("FY") && !row.period.includes("YTD"));
  const ytd = data.filter((row) => row.period.includes("YTD"));
  const latestAnnual = annual.at(-1)!;
  const priorAnnual = annual.at(-2)!;
  const annualGrowth = ((latestAnnual.computerServices / priorAnnual.computerServices - 1) * 100).toFixed(1);
  const ytdGrowth = ((ytd[1].computerServices / ytd[0].computerServices - 1) * 100).toFixed(1);
  const shareOfGoods = (latestAnnual.computerServices / 32040) * 100;

  const trendData: Data[] = [{
    type: "bar",
    name: "Computer services",
    x: annual.map((row) => row.periodLabel),
    y: annual.map((row) => row.computerServices),
    marker: { color: "#315a8a" },
    hovertemplate: "%{x}<br>$%{y:,.0f}M<extra></extra>",
  }];
  const trendLayout: Partial<Layout> = {
    autosize: true, height: 420, margin: { t: 24, r: 20, b: 70, l: 70 },
    paper_bgcolor: "#ffffff", plot_bgcolor: "#ffffff", font: { family: "Arial, sans-serif", color: "#334155", size: 12 },
    xaxis: { title: { text: "Fiscal year" }, showgrid: false },
    yaxis: { title: { text: "Million USD" }, tickprefix: "$", separatethousands: true, gridcolor: "#e2e8f0", rangemode: "tozero" },
    showlegend: false,
  };
  const comparisonData: Data[] = [{
    type: "bar",
    orientation: "h",
    x: comparison.map((row) => row.valueMillionUsd),
    y: comparison.map((row) => row.category),
    marker: { color: comparison.map((row) => row.category.startsWith("IT") ? "#0f766e" : "#cbd5e1") },
    text: comparison.map((row) => `$${row.valueMillionUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}M`),
    textposition: "outside",
    cliponaxis: false,
    hovertemplate: "%{y}<br>$%{x:,.0f}M<extra></extra>",
  }];
  const comparisonLayout: Partial<Layout> = {
    autosize: true, height: 420, margin: { t: 24, r: 90, b: 55, l: 150 },
    paper_bgcolor: "#ffffff", plot_bgcolor: "#ffffff", font: { family: "Arial, sans-serif", color: "#334155", size: 12 },
    xaxis: { title: { text: "Million USD" }, tickprefix: "$", separatethousands: true, gridcolor: "#e2e8f0", rangemode: "tozero" },
    yaxis: { showgrid: false, categoryorder: "array", categoryarray: comparison.map((row) => row.category).reverse() },
    showlegend: false,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">FY2025 computer services</p><p className="mt-1 text-2xl font-bold text-[#203a63]">${latestAnnual.computerServices.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</p><p className="mt-1 text-xs text-emerald-700">+{annualGrowth}% year on year</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Jul–Apr FY2026</p><p className="mt-1 text-2xl font-bold text-[#203a63]">${ytd[1].computerServices.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</p><p className="mt-1 text-xs text-emerald-700">+{ytdGrowth}% vs Jul–Apr FY2025</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Share of FY2025 goods exports</p><p className="mt-1 text-2xl font-bold text-[#0f766e]">{shareOfGoods.toFixed(1)}%</p><p className="mt-1 text-xs text-slate-500">scale comparison, not the same export concept</p></div>
      </div>
      <section><p className="mb-2 text-sm font-semibold text-[#203a63]">Computer-services exports have more than doubled since FY2020</p><Plot data={trendData} layout={trendLayout} config={chartConfig} useResizeHandler style={{ width: "100%" }} /></section>
      <section><p className="mb-2 text-sm font-semibold text-[#203a63]">IT services are already comparable with major merchandise categories</p><Plot data={comparisonData} layout={comparisonLayout} config={chartConfig} useResizeHandler style={{ width: "100%" }} /></section>
      <p className="text-xs leading-5 text-slate-500">IT is measured here as SBP computer-services exports, excluding telecom and information services. The comparison uses FY2024–25 PBS merchandise values, so it is a scale benchmark rather than a like-for-like trade classification.</p>
    </div>
  );
}
