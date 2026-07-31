import { parse } from "csv-parse/sync";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import type { MarketIndex, MarketRow } from "@/lib/market-types";

const DATA_ROOT = path.join(process.cwd(), "public", "data");

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

export async function getLatestNews(): Promise<string | null> {
  try {
    return await readFile(
      path.join(DATA_ROOT, "news", "psx_news_briefing_latest.md"),
      "utf8",
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return null;
  }
}

export async function getMarketSession(requestedDate?: string): Promise<{
  date: string;
  rows: MarketRow[];
  index: MarketIndex;
}> {
  const index = await getMarketIndex();
  const session =
    index.sessions.find(({ date }) => date === requestedDate) ??
    index.sessions.find(({ date }) => date === index.latest);

  if (!session) {
    throw new Error("No market sessions are available");
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
