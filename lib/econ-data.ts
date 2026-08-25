import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

export type TradeYear = {
  fiscalYear: string;
  exports: number;
  imports: number;
  balance: number;
};

export type TradeCategory = {
  tradeType: "exports" | "imports";
  categoryLevel: "major_groups" | "selected_commodities";
  fiscalYear: string;
  category: string;
  valueMillionPkr: number;
  valueMillionUsd: number;
  exchangeRatePkrPerUsd: number;
};

export type ItExportPoint = {
  period: string;
  periodLabel: string;
  computerServices: number;
  ictExports: number | null;
  comparisonBasis: string;
};

const DATA_ROOT = path.join(process.cwd(), "public", "data", "econ");

export async function getEconomicTradeData(): Promise<TradeYear[]> {
  const csv = await readFile(path.join(DATA_ROOT, "trade_annual.csv"), "utf8");
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  return records.map((record) => ({
    fiscalYear: record.fiscal_year,
    exports: Number(record.exports_usd_million),
    imports: Number(record.imports_usd_million),
    balance: Number(record.trade_balance_usd_million),
  }));
}

export async function getEconomicTradeCategories(): Promise<TradeCategory[]> {
  const csv = await readFile(path.join(DATA_ROOT, "trade_categories.csv"), "utf8");
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  return records.map((record) => ({
    tradeType: record.trade_type as TradeCategory["tradeType"],
    categoryLevel: record.category_level as TradeCategory["categoryLevel"],
    fiscalYear: record.fiscal_year,
    category: record.category,
    valueMillionPkr: Number(record.value_million_pkr || 0),
    valueMillionUsd: Number(record.value_million_usd),
    exchangeRatePkrPerUsd: Number(record.exchange_rate_pkr_per_usd || 0),
  }));
}

export async function getItExportData(): Promise<ItExportPoint[]> {
  const csv = await readFile(path.join(DATA_ROOT, "it_exports.csv"), "utf8");
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  return records.map((record) => ({
    period: record.period,
    periodLabel: record.period_label,
    computerServices: Number(record.computer_services_exports_usd_million),
    ictExports: record.ict_exports_usd_million ? Number(record.ict_exports_usd_million) : null,
    comparisonBasis: record.comparison_basis,
  }));
}
