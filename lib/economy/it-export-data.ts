import { readEconomyCsv } from "./csv";

export type ItExportPoint = { period: string; periodLabel: string; computerServices: number; ictExports: number | null; comparisonBasis: string };
export type ItExportComparison = { fiscalYear: string; category: string; valueMillionUsd: number };

export async function getItExportData(): Promise<ItExportPoint[]> {
  const records = await readEconomyCsv("it-exports/it_exports.csv");
  return records.map((record) => ({ period: record.period, periodLabel: record.period_label, computerServices: Number(record.computer_services_exports_usd_million), ictExports: record.ict_exports_usd_million ? Number(record.ict_exports_usd_million) : null, comparisonBasis: record.comparison_basis }));
}

export async function getItExportComparison(): Promise<ItExportComparison[]> {
  const records = await readEconomyCsv("it-exports/comparison.csv");
  return records.map((record) => ({ fiscalYear: record.fiscal_year, category: record.category, valueMillionUsd: Number(record.value_million_usd) }));
}
