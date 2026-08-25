import { readEconomyCsv } from "./csv";

export type TradeYear = { fiscalYear: string; exports: number; imports: number; balance: number };
export type TradeCategory = {
  tradeType: "exports" | "imports";
  categoryLevel: "major_groups" | "selected_commodities";
  fiscalYear: string;
  category: string;
  valueMillionPkr: number;
  valueMillionUsd: number;
  exchangeRatePkrPerUsd: number;
};

export async function getEconomicTradeData(): Promise<TradeYear[]> {
  const records = await readEconomyCsv("trade/trade_annual.csv");
  return records.map((record) => ({ fiscalYear: record.fiscal_year, exports: Number(record.exports_usd_million), imports: Number(record.imports_usd_million), balance: Number(record.trade_balance_usd_million) }));
}

export async function getEconomicTradeCategories(): Promise<TradeCategory[]> {
  const records = await readEconomyCsv("trade/trade_categories.csv");
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
