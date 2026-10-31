import type { ReactNode } from "react";
import Link from "next/link";

import { MarketCloseReport } from "@/components/market-close-report";
import { MarketSummary } from "@/components/market-summary";
import { MarketTreemap } from "@/components/market-treemap";
import type { MarketIndex, MarketRow } from "@/lib/market-types";

export function MarketCloseContent({
  date,
  rows,
  index,
  activityChart,
}: {
  date: string;
  rows: MarketRow[];
  index: MarketIndex;
  activityChart?: ReactNode;
}) {
  const session = index.sessions.find((candidate) => candidate.date === date);
  const isClosing = session?.isClosing !== false;

  return (
    <>
      <MarketSummary date={date} rows={rows} index={index} />

      <MarketTreemap rows={rows} date={date} isClosing={isClosing} asOfUtc={session?.asOfUtc} />

      <div className="mb-6 mt-3 flex justify-end">
        <Link href={`/heatmap?date=${date}`} className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#315a8a] shadow-sm transition hover:border-[#a9c3dd] hover:bg-[#eef5fb]">
          Explore period heatmap →
        </Link>
      </div>

      {activityChart}

      <MarketCloseReport date={date} rows={rows} index={index} isClosing={isClosing} asOfUtc={session?.asOfUtc} />
    </>
  );
}
