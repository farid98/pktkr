"use client";

import { useEffect, useMemo, useState } from "react";

type CsvRow = {
  symbol: string;
  company: string;
  sector: string;
  close: string;
  market_cap: string;
};

type HeatmapItem = {
  symbol: string;
  company: string;
  sector: string;
  marketCap: number;
  returnPercent: number;
};

type Rectangle = { x: number; y: number; width: number; height: number };
type Tile = HeatmapItem & Rectangle;

type Adjustment = { symbol: string; factor: number };

type MonthlyMarketHeatmapProps = {
  startDate: string;
  endDate: string;
  adjustments?: string;
};

function parseCsv(source: string): CsvRow[] {
  const [header, ...lines] = source.trim().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(keys.map((key, index) => [key, values[index] ?? ""])) as CsvRow;
  });
}

function parseAdjustments(value?: string): Map<string, number> {
  const entries = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry): Adjustment | null => {
      const [symbol, rawFactor] = entry.split(":");
      const factor = Number(rawFactor);
      return symbol && Number.isFinite(factor) && factor > 0 ? { symbol, factor } : null;
    })
    .filter((entry): entry is Adjustment => entry !== null);

  return new Map(entries.map((entry) => [entry.symbol, entry.factor]));
}

function makeTreemap(items: HeatmapItem[], area: Rectangle): Tile[] {
  if (items.length === 0) return [];
  if (items.length === 1) return [{ ...items[0], ...area }];

  const total = items.reduce((sum, item) => sum + item.marketCap, 0);
  let runningTotal = 0;
  let splitAt = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let index = 1; index < items.length; index += 1) {
    runningTotal += items[index - 1].marketCap;
    const difference = Math.abs(total / 2 - runningTotal);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      splitAt = index;
    }
  }

  const first = items.slice(0, splitAt);
  const second = items.slice(splitAt);
  const firstTotal = first.reduce((sum, item) => sum + item.marketCap, 0);
  const fraction = firstTotal / total;

  if (area.width >= area.height) {
    const firstWidth = area.width * fraction;
    return [
      ...makeTreemap(first, { ...area, width: firstWidth }),
      ...makeTreemap(second, { x: area.x + firstWidth, y: area.y, width: area.width - firstWidth, height: area.height }),
    ];
  }

  const firstHeight = area.height * fraction;
  return [
    ...makeTreemap(first, { ...area, height: firstHeight }),
    ...makeTreemap(second, { x: area.x, y: area.y + firstHeight, width: area.width, height: area.height - firstHeight }),
  ];
}

function tileColor(returnPercent: number) {
  const strength = Math.min(Math.abs(returnPercent), 15) / 15;
  if (returnPercent > 0) return `hsl(174 54% ${91 - strength * 47}%)`;
  if (returnPercent < 0) return `hsl(13 70% ${92 - strength * 42}%)`;
  return "#e2e8f0";
}

function textColor(returnPercent: number) {
  return Math.abs(returnPercent) >= 8 ? "#ffffff" : "#0f172a";
}

function formatReturn(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function MonthlyMarketHeatmap({ startDate, endDate, adjustments }: MonthlyMarketHeatmapProps) {
  const [items, setItems] = useState<HeatmapItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [startResponse, endResponse] = await Promise.all([
          fetch(`/data/daily/kse100_${startDate}.csv`, { signal: controller.signal }),
          fetch(`/data/daily/kse100_${endDate}.csv`, { signal: controller.signal }),
        ]);
        if (!startResponse.ok || !endResponse.ok) throw new Error("The market-close files could not be loaded.");

        const [startRows, endRows] = await Promise.all([startResponse.text(), endResponse.text()]);
        const startBySymbol = new Map(parseCsv(startRows).map((row) => [row.symbol, row]));
        const adjustmentBySymbol = parseAdjustments(adjustments);
        const nextItems = parseCsv(endRows)
          .flatMap((endRow) => {
            const startRow = startBySymbol.get(endRow.symbol);
            const factor = adjustmentBySymbol.get(endRow.symbol) ?? 1;
            const startClose = Number(startRow?.close) / factor;
            const endClose = Number(endRow.close);
            const marketCap = Number(endRow.market_cap);
            if (!startRow || !Number.isFinite(startClose) || !Number.isFinite(endClose) || !Number.isFinite(marketCap) || startClose <= 0 || endClose <= 0 || marketCap <= 0) return [];

            return [{
              symbol: endRow.symbol,
              company: endRow.company,
              sector: endRow.sector,
              marketCap,
              returnPercent: (endClose / startClose - 1) * 100,
            }];
          })
          .sort((left, right) => right.marketCap - left.marketCap);

        setItems(nextItems);
        setError(null);
      } catch (caughtError) {
        if ((caughtError as Error).name !== "AbortError") setError("The monthly heatmap is unavailable right now.");
      }
    }

    void load();
    return () => controller.abort();
  }, [adjustments, endDate, startDate]);

  const tiles = useMemo(() => makeTreemap(items, { x: 0, y: 0, width: 1000, height: 570 }), [items]);

  if (error) return <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{error}</p>;
  if (items.length === 0) return <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Loading monthly heatmap…</p>;

  return (
    <figure className="my-7 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <svg viewBox="0 0 1000 570" role="img" aria-label="KSE-100 August 2026 return heatmap, with each tile sized by market capitalisation" className="block h-auto w-full">
        {tiles.map((tile) => {
          const labelFits = tile.width >= 52 && tile.height >= 28;
          const returnFits = tile.width >= 72 && tile.height >= 48;
          const fill = tileColor(tile.returnPercent);
          const fillText = textColor(tile.returnPercent);
          return (
            <g key={tile.symbol}>
              <title>{`${tile.company} (${tile.symbol}) · ${formatReturn(tile.returnPercent)} · ${tile.sector}`}</title>
              <rect x={tile.x + 1} y={tile.y + 1} width={Math.max(tile.width - 2, 0)} height={Math.max(tile.height - 2, 0)} fill={fill} stroke="#ffffff" strokeWidth="2" rx="3" />
              {labelFits ? <text x={tile.x + 7} y={tile.y + 17} fill={fillText} fontSize="13" fontWeight="700">{tile.symbol}</text> : null}
              {returnFits ? <text x={tile.x + 7} y={tile.y + 35} fill={fillText} fontSize="12">{formatReturn(tile.returnPercent)}</text> : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-slate-600">
        <span>Tile area = 31 August market capitalisation. Colour = return from 31 July to 31 August.</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#b9ece5]" /> gain <i className="ml-2 h-3 w-3 rounded-sm bg-[#f3c5b8]" /> loss</span>
      </figcaption>
    </figure>
  );
}
