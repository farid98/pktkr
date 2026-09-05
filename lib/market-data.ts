import { parse } from "csv-parse/sync";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import type { MarketIndex, MarketRow, TickerHistory, TickerOhlcvPoint } from "@/lib/market-types";

const DATA_ROOT = path.join(process.cwd(), "public", "data");

export type MarketSessionData = {
  date: string;
  rows: MarketRow[];
  index: MarketIndex;
};

export type TickerPricePoint = {
  date: string;
  close: number;
  volume: number;
};

export async function getMarketCloseChart(date: string): Promise<string | null> {
  const filename = `kse100_${date}_market_close.png`;
  try {
    await access(path.join(DATA_ROOT, "charts", filename));
    return `/data/charts/${filename}`;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return null;
  }
}

export async function getMarketIndex(): Promise<MarketIndex> {
  const contents = await readFile(path.join(DATA_ROOT, "index.json"), "utf8");
  return JSON.parse(contents) as MarketIndex;
}

async function loadMarketSession(
  index: MarketIndex,
  date: string,
): Promise<MarketSessionData> {
  const session = index.sessions.find((candidate) => candidate.date === date);

  if (!session) {
    throw new Error(`No market session is available for ${date}`);
  }

  const relativeFile = session.file.replace(/^\/data\//, "");
  const csv = await readFile(path.join(DATA_ROOT, relativeFile), "utf8");
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const rows = records.map((record) => ({
    symbol: record.symbol,
    company: record.company,
    sector: record.sector,
    ldcp: Number(record.ldcp),
    high: Number(record.high),
    low: Number(record.low),
    close: Number(record.close),
    percentChange: Number(record.percent_change),
    volume: Number(record.volume),
    marketCap: Number(record.market_cap),
    downloadedAtUtc: record.downloaded_at_utc,
  }));

  if (rows.length !== 100 || new Set(rows.map(({ symbol }) => symbol)).size !== 100) {
    throw new Error(`Expected 100 unique KSE-100 rows for ${session.date}`);
  }

  return { date: session.date, rows, index };
}

export async function getMarketSession(requestedDate?: string): Promise<MarketSessionData> {
  const index = await getMarketIndex();
  const date = index.sessions.some(({ date }) => date === requestedDate)
    ? requestedDate
    : index.latest;

  if (!date) {
    throw new Error("No market sessions are available");
  }

  return loadMarketSession(index, date);
}

export async function getMarketSessionForDate(
  date: string,
): Promise<MarketSessionData | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const index = await getMarketIndex();
  if (!index.sessions.some((session) => session.date === date)) return null;
  return loadMarketSession(index, date);
}

export async function getMarketTickerHistory(
  index?: MarketIndex,
): Promise<TickerHistory> {
  const marketIndex = index ?? await getMarketIndex();
  const sessions = marketIndex.sessions.slice(-30);
  const histories: TickerHistory = {};

  for (const session of sessions) {
    const relativeFile = session.file.replace(/^\/data\//, "");
    const csv = await readFile(path.join(DATA_ROOT, relativeFile), "utf8");
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    for (const record of records) {
      const close = Number(record.close);
      if (!Number.isFinite(close)) continue;
      histories[record.symbol] ??= [];
      histories[record.symbol].push(close);
    }
  }

  return histories;
}

export async function getMarketTickerSeries(
  symbol: string,
  index?: MarketIndex,
): Promise<TickerPricePoint[]> {
  const marketIndex = index ?? await getMarketIndex();
  const normalizedSymbol = symbol.toUpperCase();
  const series: TickerPricePoint[] = [];

  for (const session of marketIndex.sessions.slice(-30)) {
    const relativeFile = session.file.replace(/^\/data\//, "");
    const csv = await readFile(path.join(DATA_ROOT, relativeFile), "utf8");
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
    const record = records.find((candidate) => candidate.symbol === normalizedSymbol);
    if (!record) continue;
    const close = Number(record.close);
    const volume = Number(record.volume);
    if (Number.isFinite(close) && Number.isFinite(volume)) {
      series.push({ date: session.date, close, volume });
    }
  }

  return series;
}

export async function getTickerOhlcvHistory(symbol: string): Promise<TickerOhlcvPoint[]> {
  if (!/^[A-Z0-9-]+$/.test(symbol)) return [];
  try {
    const contents = await readFile(path.join(DATA_ROOT, "tickers", `${symbol}.json`), "utf8");
    const payload = JSON.parse(contents) as { rows?: unknown };
    if (!Array.isArray(payload.rows)) return [];
    return payload.rows.flatMap((row): TickerOhlcvPoint[] => {
      if (!Array.isArray(row) || row.length !== 6 || typeof row[0] !== "string" || !Number.isFinite(row[4])) return [];
      const numberOrNull = (value: unknown) => Number.isFinite(value) ? Number(value) : null;
      return [{
        date: row[0],
        open: numberOrNull(row[1]),
        high: numberOrNull(row[2]),
        low: numberOrNull(row[3]),
        close: Number(row[4]),
        volume: numberOrNull(row[5]),
      }];
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function getTickerOhlcvHistoryFromSupabase(symbol: string): Promise<TickerOhlcvPoint[] | null> {
  if (!/^[A-Z0-9-]+$/.test(symbol)) return [];
  const baseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!baseUrl || !secretKey) return null;

  const endpoint = new URL("/rest/v1/prices", baseUrl);
  endpoint.searchParams.set("select", "date,open,high,low,close,volume,change,percent_change");
  endpoint.searchParams.set("symbol", `eq.${symbol}`);
  endpoint.searchParams.set("order", "date.asc");
  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase ticker-history request failed: ${response.status}`);
    const rows = await response.json() as Array<Record<string, unknown>>;
    return rows.flatMap((row): TickerOhlcvPoint[] => {
      if (typeof row.date !== "string" || !Number.isFinite(row.close)) return [];
      const numberOrNull = (value: unknown) => Number.isFinite(value) ? Number(value) : null;
      return [{
        date: row.date,
        open: numberOrNull(row.open),
        high: numberOrNull(row.high),
        low: numberOrNull(row.low),
        close: Number(row.close),
        volume: numberOrNull(row.volume),
        change: numberOrNull(row.change),
        percentChange: numberOrNull(row.percent_change),
      }];
    });
  } catch (error) {
    console.error("Could not load ticker history from Supabase", error);
    return null;
  }
}
