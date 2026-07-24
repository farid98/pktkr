import { parse } from "csv-parse/sync";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { MarketIndex, MarketRow } from "@/lib/market-types";

const DATA_ROOT = path.join(process.cwd(), "public", "data");

export async function getMarketIndex(): Promise<MarketIndex> {
  const contents = await readFile(path.join(DATA_ROOT, "index.json"), "utf8");
  return JSON.parse(contents) as MarketIndex;
}

export async function getMarketSession(requestedDate?: string): Promise<{
  date: string;
  rows: MarketRow[];
  index: MarketIndex;
  reportMarkdown: string | null;
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
    close: Number(record.close),
    percentChange: Number(record.percent_change),
    volume: Number(record.volume),
    marketCap: Number(record.market_cap),
    downloadedAtUtc: record.downloaded_at_utc,
  }));

  if (rows.length !== 100 || new Set(rows.map(({ symbol }) => symbol)).size !== 100) {
    throw new Error(`Expected 100 unique KSE-100 rows for ${session.date}`);
  }

  let reportMarkdown: string | null = null;
  if (session.report) {
    const relativeReport = session.report.replace(/^\/data\//, "");
    reportMarkdown = await readFile(path.join(DATA_ROOT, relativeReport), "utf8");
    const expectedHeading = `# KSE-100 Daily Market Summary — ${session.date}`;
    if (reportMarkdown.split(/\r?\n/, 1)[0] !== expectedHeading) {
      throw new Error(`Daily report does not match market session ${session.date}`);
    }
  }

  return { date: session.date, rows, index, reportMarkdown };
}
