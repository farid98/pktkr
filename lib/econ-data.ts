// Compatibility facade for existing imports. New Economy code should import
// from the domain-specific modules under lib/economy/.
export { getEconomicTradeCategories, getEconomicTradeData } from "./economy/trade-data";
export { getItExportComparison, getItExportData } from "./economy/it-export-data";
export type { TradeCategory, TradeYear } from "./economy/trade-data";
export type { ItExportComparison, ItExportPoint } from "./economy/it-export-data";
