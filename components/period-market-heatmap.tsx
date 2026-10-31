"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Config, Data, Layout } from "plotly.js";

import type { PeriodHeatmapRow } from "@/lib/period-heatmap";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-slate-400">Building period heatmap…</div>,
});

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function makeTrace(rows: PeriodHeatmapRow[]): Data {
  const sectors = [...new Set(rows.map((row) => row.sector))].sort();
  const total = rows.reduce((sum, row) => sum + row.marketCap, 0);
  const ids = ["market"];
  const labels = [""];
  const parents = [""];
  const values = [total];
  const colors = [0];
  const text = [""];
  const customdata: (string | number)[][] = [["", "", "", 0, 0, 0, 0]];
  const hovertemplate = ["<extra></extra>"];

  for (const sector of sectors) {
    const members = rows.filter((row) => row.sector === sector);
    const sectorId = `sector:${sector}`;
    ids.push(sectorId);
    labels.push(sector);
    parents.push("market");
    values.push(members.reduce((sum, row) => sum + row.marketCap, 0));
    colors.push(0);
    text.push(sector);
    customdata.push([sector, "", "", 0, 0, 0, 0]);
    hovertemplate.push("<b>%{label}</b><extra></extra>");

    for (const row of members) {
      ids.push(`stock:${row.symbol}`);
      labels.push(row.symbol);
      parents.push(sectorId);
      values.push(row.marketCap);
      colors.push(row.returnPercent);
      text.push(`${row.symbol}<br>${signedPercent(row.returnPercent)}`);
      customdata.push([
        row.company, row.symbol, row.sector, row.startClose,
        row.endClose, row.returnPercent, row.marketCap,
      ]);
      hovertemplate.push(
        "<b>%{customdata[0]}</b><br>" +
        "Symbol: %{customdata[1]}<br>Sector: %{customdata[2]}<br>" +
        "Start close: PKR %{customdata[3]:,.2f}<br>" +
        "End close: PKR %{customdata[4]:,.2f}<br>" +
        "Return: %{customdata[5]:+.2f}%<br>" +
        "End market cap: PKR %{customdata[6]:,.0f}<extra></extra>",
      );
    }
  }

  return {
    type: "treemap", ids, labels, parents, values, text,
    texttemplate: "%{text}", textposition: "middle center",
    customdata, hovertemplate, branchvalues: "total",
    marker: {
      colors, coloraxis: "coloraxis",
      line: { color: "#ffffff", width: 1 },
      pad: { t: 26, l: 4, r: 4, b: 2 },
    },
    root: { color: "#3f3f3f" },
    tiling: { packing: "squarify", pad: 1 },
    pathbar: { visible: true, thickness: 26, textfont: { color: "#e2e8f0" } },
    textfont: { family: "Arial, sans-serif", size: 12, color: "#30343b" },
  } as Data;
}

export function PeriodMarketHeatmap({ rows, startDate, endDate }: {
  rows: PeriodHeatmapRow[];
  startDate: string;
  endDate: string;
}) {
  const trace = useMemo(() => makeTrace(rows), [rows]);
  const maxReturn = Math.max(5, ...rows.map((row) => Math.abs(row.returnPercent)));
  const layout = {
    autosize: true,
    paper_bgcolor: "#0f172a",
    plot_bgcolor: "#0f172a",
    font: { family: "Arial, sans-serif", color: "#e2e8f0", size: 13 },
    margin: { t: 8, l: 0, r: 0, b: 0 },
    coloraxis: {
      showscale: false,
      colorscale: [[0, "#b2182b"], [0.5, "#f7f7f7"], [1, "#1a9850"]],
      cmin: -maxReturn, cmax: maxReturn, cmid: 0,
    },
    hoverlabel: {
      bgcolor: "#ffffff", bordercolor: "#94a3b8",
      font: { color: "#172033", size: 15 }, align: "left",
    },
    uniformtext: { minsize: 9 },
  } as Partial<Layout>;
  const config: Partial<Config> = {
    responsive: true, displayModeBar: false, displaylogo: false, scrollZoom: false,
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_70px_-42px_rgba(15,23,42,0.55)]">
      <div className="h-[62vh] min-h-[480px] max-h-[950px] bg-[#0f172a] p-2 sm:h-[76vh] sm:min-h-[650px] sm:p-3">
        <Plot data={[trace]} layout={layout} config={config} useResizeHandler className="h-full w-full" />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-slate-600 sm:px-6">
        <span>Tile area: {endDate} market cap · Colour: adjusted price return, {startDate} to {endDate}</span>
        <span>Green = gain · Red = loss</span>
      </figcaption>
    </figure>
  );
}
