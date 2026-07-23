"use client";

import dynamic from "next/dynamic";
import { Maximize2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";

import type { MarketRow } from "@/lib/market-types";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Building market map…
    </div>
  ),
});

type Metric = "marketCap" | "volume";

const metricLabels: Record<Metric, string> = {
  marketCap: "Market Cap",
  volume: "Trade Volume",
};

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function makeTrace(rows: MarketRow[], metric: Metric): Data {
  const sectors = Array.from(new Set(rows.map(({ sector }) => sector))).sort();
  const valueFor = (row: MarketRow) =>
    Math.max(metric === "marketCap" ? row.marketCap : row.volume, 1);
  const total = rows.reduce((sum, row) => sum + valueFor(row), 0);

  const ids: string[] = ["market"];
  const labels: string[] = [""];
  const parents: string[] = [""];
  const values: number[] = [total];
  const colors: number[] = [0];
  const text: string[] = [""];
  const customdata: (string | number)[][] = [["", "", "", 0, 0, 0, "root"]];
  const hovertemplate: string[] = ["<extra></extra>"];

  for (const sector of sectors) {
    const sectorRows = rows.filter((row) => row.sector === sector);
    const sectorValue = sectorRows.reduce((sum, row) => sum + valueFor(row), 0);
    const sectorId = `sector:${sector}`;
    ids.push(sectorId);
    labels.push(sector);
    parents.push("market");
    values.push(sectorValue);
    colors.push(0);
    text.push(sector);
    customdata.push([sector, "", sector, 0, 0, sectorValue, "sector"]);
    hovertemplate.push(`<b>${sector}</b><extra></extra>`);

    for (const row of sectorRows) {
      ids.push(`stock:${row.symbol}`);
      labels.push(row.symbol);
      parents.push(sectorId);
      values.push(valueFor(row));
      colors.push(row.percentChange);
      text.push(`${row.symbol}<br>${signedPercent(row.percentChange)}`);
      customdata.push([
        row.company,
        row.symbol,
        row.sector,
        row.close,
        row.percentChange,
        row.marketCap,
        row.volume,
      ]);
      hovertemplate.push(
        "<b>%{customdata[0]}</b><br>" +
          "Symbol: %{customdata[1]}<br>" +
          "Sector: %{customdata[2]}<br>" +
          "Close: PKR %{customdata[3]:,.2f}<br>" +
          "Change: %{customdata[4]:+.2f}%<br>" +
          "Volume: %{customdata[6]:,.0f}<br>" +
          "Market cap: PKR %{customdata[5]:,.0f}<extra></extra>",
      );
    }
  }

  return {
    type: "treemap",
    ids,
    labels,
    parents,
    values,
    text,
    texttemplate: "%{text}",
    customdata,
    hovertemplate,
    branchvalues: "total",
    marker: {
      colors,
      coloraxis: "coloraxis",
      line: { color: "#ffffff", width: 1.5 },
    },
    root: { color: "#3f3f3f" },
    tiling: { packing: "squarify", pad: 3 },
    pathbar: { visible: true, thickness: 26 },
    textfont: { family: "Arial, sans-serif", size: 13, color: "#30343b" },
  } as Data;
}

export function MarketTreemap({
  rows,
  date,
}: {
  rows: MarketRow[];
  date: string;
}) {
  const [metric, setMetric] = useState<Metric>("marketCap");
  const chartShell = useRef<HTMLDivElement>(null);
  const trace = useMemo(() => makeTrace(rows, metric), [rows, metric]);
  const maxChange = Math.max(
    ...rows.map(({ percentChange }) => Math.abs(percentChange)),
    1,
  );

  const layout = {
    autosize: true,
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: { family: "Arial, sans-serif", color: "#2c4265", size: 13 },
    margin: { t: 8, l: 0, r: 86, b: 0 },
    coloraxis: {
      colorscale: [
        [0, "#b2182b"],
        [0.5, "#f7f7f7"],
        [1, "#1a9850"],
      ],
      cmin: -maxChange,
      cmax: maxChange,
      cmid: 0,
      colorbar: {
        title: { text: "Daily % change", side: "top" },
        thickness: 28,
        len: 0.94,
        x: 1.015,
        xanchor: "left",
        outlinewidth: 0,
        tickfont: { size: 12 },
      },
    },
    hoverlabel: {
      bgcolor: "#ffffff",
      bordercolor: "#94a3b8",
      font: { color: "#172033", size: 15 },
      align: "left",
    },
    uniformtext: { minsize: 10, mode: "hide" },
  } as Partial<Layout>;

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
    scrollZoom: false,
  };

  async function enterFullscreen() {
    if (chartShell.current?.requestFullscreen) {
      await chartShell.current.requestFullscreen();
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            KSE-100 by {metricLabels[metric]}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click a sector to zoom. Hover over a company for details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
            aria-label="Rectangle size"
          >
            {(Object.keys(metricLabels) as Metric[]).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setMetric(value)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                  metric === value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-pressed={metric === value}
              >
                {metricLabels[value]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={enterFullscreen}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Open chart fullscreen"
          >
            <Maximize2 size={17} />
          </button>
        </div>
      </div>
      <div
        ref={chartShell}
        className="h-[72vh] min-h-[570px] max-h-[920px] bg-white p-2 sm:min-h-[650px] sm:p-3 [&:fullscreen]:h-screen [&:fullscreen]:max-h-none [&:fullscreen]:p-5"
      >
        <Plot
          key={`${date}-${metric}`}
          data={[trace]}
          layout={layout}
          config={config}
          useResizeHandler
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
