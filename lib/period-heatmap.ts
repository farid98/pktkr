import type { MarketRow, TickerOhlcvPoint } from "./market-types";

export const HEATMAP_PERIODS = [7, 30, 60, 90, 120] as const;
export type HeatmapPeriod = (typeof HEATMAP_PERIODS)[number];

export type PeriodHeatmapRow = {
  symbol: string;
  company: string;
  sector: string;
  marketCap: number;
  startClose: number;
  endClose: number;
  returnPercent: number;
};

export type PeriodHeatmapData = {
  requestedStart: string;
  actualStart: string | null;
  endDate: string;
  rows: PeriodHeatmapRow[];
  omittedSymbols: string[];
};

export function periodStartDate(endDate: string, days: HeatmapPeriod): string {
  const start = new Date(`${endDate}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return start.toISOString().slice(0, 10);
}

export function buildPeriodHeatmap(
  endRows: MarketRow[],
  histories: Map<string, TickerOhlcvPoint[]>,
  endDate: string,
  days: HeatmapPeriod,
): PeriodHeatmapData {
  const requestedStart = periodStartDate(endDate, days);
  const firstDateCounts = new Map<string, number>();

  for (const row of endRows) {
    const first = histories.get(row.symbol)?.find(
      (point) => point.date >= requestedStart && point.date <= endDate && point.close > 0,
    );
    if (first) firstDateCounts.set(first.date, (firstDateCounts.get(first.date) ?? 0) + 1);
  }

  // Use one common trading-date boundary, rather than mixing shorter returns
  // from newly listed or newly added constituents into the same colour scale.
  const actualStart = [...firstDateCounts].sort(
    ([leftDate, leftCount], [rightDate, rightCount]) =>
      rightCount - leftCount || leftDate.localeCompare(rightDate),
  )[0]?.[0] ?? null;

  const rows: PeriodHeatmapRow[] = [];
  const omittedSymbols: string[] = [];
  for (const row of endRows) {
    const history = histories.get(row.symbol) ?? [];
    const start = actualStart && history.find((point) => point.date === actualStart);
    const end = history.find((point) => point.date === endDate);
    if (!start || !end || start.close <= 0 || end.close <= 0 || !Number.isFinite(row.marketCap) || row.marketCap <= 0) {
      omittedSymbols.push(row.symbol);
      continue;
    }
    rows.push({
      symbol: row.symbol,
      company: row.company,
      sector: row.sector,
      marketCap: row.marketCap,
      startClose: start.close,
      endClose: end.close,
      returnPercent: (end.close / start.close - 1) * 100,
    });
  }

  return { requestedStart, actualStart, endDate, rows, omittedSymbols };
}
