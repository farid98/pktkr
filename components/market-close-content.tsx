import { MarketCloseReport } from "@/components/market-close-report";
import { MarketSummary } from "@/components/market-summary";
import { MarketTreemap } from "@/components/market-treemap";
import type { MarketIndex, MarketRow } from "@/lib/market-types";

export function MarketCloseContent({
  date,
  rows,
  index,
}: {
  date: string;
  rows: MarketRow[];
  index: MarketIndex;
}) {
  return (
    <>
      <MarketSummary date={date} rows={rows} index={index} />

      <MarketTreemap rows={rows} date={date} />

      <MarketCloseReport date={date} rows={rows} index={index} />
    </>
  );
}
