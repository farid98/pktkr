"use client";

import dynamic from "next/dynamic";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

function signedPercent(value: number, precision = 2) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(precision)}%`;
}

function makeTrace(
  rows: MarketRow[],
  metric: Metric,
  compactLabels: boolean,
): Data {
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
  // 0 means "no override" (falls back to the base textfont size below);
  // sector headers get an explicit bump so they stay readable even when
  // the leaf tiles' font is shrunk down for compact/mobile layouts.
  const headerFontSize = compactLabels ? 9 : 15;
  const insideFontSizes: number[] = [0];

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
    insideFontSizes.push(headerFontSize);

    for (const row of sectorRows) {
      ids.push(`stock:${row.symbol}`);
      labels.push(row.symbol);
      parents.push(sectorId);
      values.push(valueFor(row));
      colors.push(row.percentChange);
      text.push(
        compactLabels
          ? `${row.symbol}<br>${signedPercent(row.percentChange, 1)}`
          : `${row.symbol}<br>${signedPercent(row.percentChange)}`,
      );
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
      insideFontSizes.push(0);
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
    textposition: "middle center",
    customdata,
    hovertemplate,
    branchvalues: "total",
    marker: {
      colors,
      coloraxis: "coloraxis",
      line: { color: "#ffffff", width: 1 },
      // Plotly's default header strip is `textfont.size * 2`, so in
      // compact mode (textfont.size 4, for tiny leaf tiles) sector
      // headers were only given ~8px of height to render in — not
      // enough room for their own text, so Plotly's per-element
      // constrained fit shrunk them down to a barely-visible scale.
      // Give headers a fixed, readable strip independent of the leaf
      // tiles' font size.
      pad: { t: compactLabels ? 18 : 30, l: 4, r: 4, b: 2 },
    },
    root: { color: "#3f3f3f" },
    tiling: { packing: "squarify", pad: 1 },
    pathbar: { visible: true, thickness: 26 },
    textfont: {
      family: "Arial, sans-serif",
      size: compactLabels ? 4 : 13,
      color: "#30343b",
    },
    // Per-point override so sector headers render larger than the
    // (possibly tiny) leaf-tile font; 0 entries fall back to `textfont`.
    insidetextfont: { size: insideFontSizes },
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
  const [compactLabels, setCompactLabels] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const chartShell = useRef<HTMLDivElement>(null);
  const trace = useMemo(
    () => makeTrace(rows, metric, compactLabels),
    [rows, metric, compactLabels],
  );
  const maxChange = Math.max(
    ...rows.map(({ percentChange }) => Math.abs(percentChange)),
    1,
  );

  const layout = {
    autosize: true,
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: { family: "Arial, sans-serif", color: "#2c4265", size: 13 },
    margin: { t: 8, l: 0, r: 0, b: 0 },
    coloraxis: {
      showscale: false,
      colorscale: [
        [0, "#b2182b"],
        [0.5, "#f7f7f7"],
        [1, "#1a9850"],
      ],
      cmin: -maxChange,
      cmax: maxChange,
      cmid: 0,
    },
    hoverlabel: {
      bgcolor: "#ffffff",
      bordercolor: "#94a3b8",
      font: { color: "#172033", size: 15 },
      align: "left",
    },
    // No `mode: "hide"` here: that forces one shared font size across the
    // whole trace and drops (display:none) any label that can't fit it —
    // with sectors ranging from huge to tiny, that hid most sector
    // headers entirely instead of just shrinking them.
    uniformtext: { minsize: compactLabels ? 4 : 10 },
  } as Partial<Layout>;

  useEffect(() => {
    const chart = chartShell.current;
    if (!chart) return;

    const updateLabelMode = () => setCompactLabels(chart.clientWidth < 640);
    updateLabelMode();

    const observer = new ResizeObserver(updateLabelMode);
    observer.observe(chart);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const chart = chartShell.current;
    if (!chart || !compactLabels) return;

    const applyLabelSizes = () => {
      const slices = chart.querySelectorAll<SVGGElement>(".treemaplayer g.slice");

      slices.forEach((slice) => {
        const rectangle = slice.querySelector<SVGPathElement>("path.surface");
        const label = slice.querySelector<SVGTextElement>("text.slicetext");
        if (!rectangle || !label || !rectangle.getAttribute("d")) return;

        // Sector headers render a single line and only get a thin strip
        // (marker.pad.t, derived from the base font size) reserved for
        // them at the top of the whole sector rectangle. Only leaf tiles
        // have the two-line "SYMBOL / %change" label this sizing is for —
        // resizing headers off the full sector area overflows that strip
        // and gets painted over by the sector's own child tiles.
        const lines = label.querySelectorAll<SVGTSpanElement>("tspan.line");
        if (lines.length < 2) return;

        const { width, height } = rectangle.getBBox();
        const area = width * height;
        const fontSize =
          area >= 18_000
            ? 12
            : area >= 8_000
              ? 10
              : area >= 3_000
                ? 8
                : area >= 900
                  ? 6
                  : 4;

        label.style.fontSize = `${fontSize}px`;

        // Safari doesn't reliably re-resolve `em`-based tspan offsets
        // against a font size set dynamically on the parent afterwards,
        // so pin each line's size and spacing to explicit px values
        // (1.3 matches Plotly's own line-spacing constant).
        lines.forEach((line, index) => {
          line.style.fontSize = `${fontSize}px`;
          line.setAttribute("dy", index === 0 ? "0px" : `${fontSize * 1.3}px`);
        });
      });
    };

    const frame = requestAnimationFrame(applyLabelSizes);
    const observer = new MutationObserver(applyLabelSizes);
    observer.observe(chart, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [compactLabels, date, metric]);

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
    scrollZoom: false,
  };

  useEffect(() => {
    if (!expanded) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  return (
    <section
      className={`overflow-hidden border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)] ${
        expanded
          ? "fixed inset-0 z-50 rounded-none shadow-2xl sm:inset-4 sm:rounded-2xl"
          : "rounded-2xl"
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            KSE-100 by {metricLabels[metric]}
          </p>
          <p className="mt-1 text-xs text-slate-500 sm:block">
            <span className="sm:hidden">Tap a sector to zoom.</span>
            <span className="hidden sm:inline">
              Click a sector to zoom. Hover over a company for details.
            </span>
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
            onClick={() => setExpanded((value) => !value)}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label={expanded ? "Close expanded chart" : "Open chart fullscreen"}
            aria-pressed={expanded}
          >
            {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>
      <div
        ref={chartShell}
        className={`bg-white p-1.5 sm:p-3 ${
          expanded
            ? "h-[calc(100dvh-88px)] max-h-none sm:h-[calc(100dvh-96px)]"
            : "h-[58vh] min-h-[420px] max-h-[700px] sm:h-[72vh] sm:min-h-[650px] sm:max-h-[920px]"
        }`}
      >
        <Plot
          key={`${date}-${metric}-${compactLabels ? "compact" : "regular"}`}
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
