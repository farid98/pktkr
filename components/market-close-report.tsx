import type { MarketRow } from "@/lib/market-types";

type ReportRow = MarketRow & {
  estimatedTradedValue: number;
  intradayRangePercent: number;
  basketContribution: number;
};

type SectorSummary = {
  sector: string;
  companies: number;
  weightedChange: number;
  marketCapShare: number;
  volume: number;
  tradedValue: number;
  advances: number;
  declines: number;
  unchanged: number;
};

function compactNumber(value: number) {
  const absolute = Math.abs(value);
  for (const [threshold, suffix] of [
    [1_000_000_000_000, "T"],
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ] as const) {
    if (absolute >= threshold) return `${(value / threshold).toFixed(2)}${suffix}`;
  }
  return new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value);
}

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function changeClass(value: number) {
  return value > 0
    ? "text-emerald-700"
    : value < 0
      ? "text-rose-700"
      : "text-slate-500";
}

function collectionLabel(value: string | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
    timeZoneName: "short",
  }).format(new Date(value));
}

function sortRows(rows: ReportRow[], field: keyof ReportRow, ascending = false) {
  return [...rows].sort((left, right) => {
    const difference = Number(left[field]) - Number(right[field]);
    return ascending ? difference : -difference;
  });
}

function LeaderTable({
  title,
  rows,
  measure,
}: {
  title: string;
  rows: ReportRow[];
  measure: (row: ReportRow) => string;
}) {
  return (
    <section className="border-t border-slate-100 pb-1">
      <h3 className="px-4 pt-7 text-lg font-bold tracking-[-0.02em] text-[#203a63] sm:px-6 sm:text-xl">
        {title}
      </h3>
      <div className="mx-4 mt-3 overflow-x-auto rounded-xl border border-slate-200 sm:mx-6">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.06em] text-slate-500">
            <tr>
              <th className="border-b border-slate-200 px-3 py-3 font-bold">#</th>
              <th className="border-b border-slate-200 px-3 py-3 font-bold">Company</th>
              <th className="border-b border-slate-200 px-3 py-3 font-bold">Sector</th>
              <th className="border-b border-slate-200 px-3 py-3 text-right font-bold">Close</th>
              <th className="border-b border-slate-200 px-3 py-3 text-right font-bold">Change</th>
              <th className="border-b border-slate-200 px-3 py-3 text-right font-bold">Measure</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.symbol} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3 text-slate-400">{index + 1}</td>
                <td className="px-3 py-3">
                  <span className="block font-semibold text-slate-800">{row.symbol}</span>
                  <span className="block max-w-52 truncate text-slate-500">{row.company}</span>
                </td>
                <td className="px-3 py-3 text-slate-600">{titleCase(row.sector)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-700">PKR {row.close.toFixed(2)}</td>
                <td className={`px-3 py-3 text-right font-semibold tabular-nums ${changeClass(row.percentChange)}`}>
                  {signedPercent(row.percentChange)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-600">{measure(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricCard({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold tracking-[-0.02em] tabular-nums ${change === undefined ? "text-slate-800" : changeClass(change)}`}>
        {value}
      </p>
    </div>
  );
}

export function MarketCloseReport({ rows }: { rows: MarketRow[] }) {
  const totalMarketCap = rows.reduce((total, row) => total + row.marketCap, 0);
  const reportRows = rows.map((row) => {
    const estimatedTradedValue = row.close * row.volume;
    const intradayRangePercent = row.ldcp === 0 ? 0 : ((row.high - row.low) / row.ldcp) * 100;
    const basketContribution = totalMarketCap === 0 ? 0 : (row.marketCap / totalMarketCap) * row.percentChange;
    return { ...row, estimatedTradedValue, intradayRangePercent, basketContribution };
  });
  const advances = rows.filter((row) => row.percentChange > 0).length;
  const declines = rows.filter((row) => row.percentChange < 0).length;
  const unchanged = rows.length - advances - declines;
  const changes = rows.map((row) => row.percentChange).sort((left, right) => left - right);
  const medianChange = (changes[49] + changes[50]) / 2;
  const equalWeightChange = rows.reduce((total, row) => total + row.percentChange, 0) / rows.length;
  const weightedChange = reportRows.reduce((total, row) => total + row.basketContribution, 0);
  const totalVolume = rows.reduce((total, row) => total + row.volume, 0);
  const totalTradedValue = reportRows.reduce((total, row) => total + row.estimatedTradedValue, 0);
  const sectors = [...new Set(rows.map((row) => row.sector))]
    .map((sector): SectorSummary => {
      const members = reportRows.filter((row) => row.sector === sector);
      const marketCap = members.reduce((total, row) => total + row.marketCap, 0);
      return {
        sector,
        companies: members.length,
        weightedChange: marketCap === 0 ? 0 : members.reduce((total, row) => total + row.percentChange * row.marketCap, 0) / marketCap,
        marketCapShare: totalMarketCap === 0 ? 0 : (marketCap / totalMarketCap) * 100,
        volume: members.reduce((total, row) => total + row.volume, 0),
        tradedValue: members.reduce((total, row) => total + row.estimatedTradedValue, 0),
        advances: members.filter((row) => row.percentChange > 0).length,
        declines: members.filter((row) => row.percentChange < 0).length,
        unchanged: members.filter((row) => row.percentChange === 0).length,
      };
    })
    .sort((left, right) => right.weightedChange - left.weightedChange);
  const contributionRows = [
    ...sortRows(reportRows, "basketContribution").slice(0, 5),
    ...sortRows(reportRows, "basketContribution", true).slice(0, 5),
  ].filter((row, index, list) => list.findIndex(({ symbol }) => symbol === row.symbol) === index);

  return (
    <section id="daily-report" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_80px_-42px_rgba(15,23,42,0.55)]">
      <div className="h-1 bg-[#203a63]" aria-hidden="true" />
      <div className="border-b border-white/10 bg-[#0f172a] px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">Market Close Report</h2>
      </div>

      <section className="mx-4 mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:mx-6 sm:p-5">
        <h3 className="text-lg font-bold tracking-[-0.02em] text-[#203a63] sm:text-xl">Market at a glance</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Advances / declines / unchanged" value={`${advances} / ${declines} / ${unchanged}`} />
          <MetricCard label="Advance–decline ratio" value={declines === 0 ? "∞" : (advances / declines).toFixed(2)} />
          <MetricCard label="Equal-weight average move" value={signedPercent(equalWeightChange)} change={equalWeightChange} />
          <MetricCard label="Median stock move" value={signedPercent(medianChange)} change={medianChange} />
          <MetricCard label="Market-cap-weighted basket move" value={signedPercent(weightedChange)} change={weightedChange} />
          <MetricCard label="Total reported volume" value={`${compactNumber(totalVolume)} shares`} />
          <MetricCard label="Estimated traded value" value={`PKR ${compactNumber(totalTradedValue)}`} />
          <MetricCard label="Combined market capitalisation" value={`PKR ${compactNumber(totalMarketCap)}`} />
        </div>
      </section>

      <LeaderTable title="Top 5 gainers" rows={sortRows(reportRows, "percentChange").slice(0, 5)} measure={(row) => `${compactNumber(row.volume)} shares`} />
      <LeaderTable title="Top 5 losers" rows={sortRows(reportRows, "percentChange", true).slice(0, 5)} measure={(row) => `${compactNumber(row.volume)} shares`} />
      <LeaderTable title="Top 5 volume leaders" rows={sortRows(reportRows, "volume").slice(0, 5)} measure={(row) => `${compactNumber(row.volume)} shares`} />
      <LeaderTable title="Top 5 estimated traded-value leaders" rows={sortRows(reportRows, "estimatedTradedValue").slice(0, 5)} measure={(row) => `PKR ${compactNumber(row.estimatedTradedValue)}`} />
      <LeaderTable title="Widest intraday ranges" rows={sortRows(reportRows, "intradayRangePercent").slice(0, 5)} measure={(row) => `${row.intradayRangePercent.toFixed(2)}% range`} />

      <section className="border-t border-slate-100">
        <h3 className="px-4 pt-7 text-lg font-bold tracking-[-0.02em] text-[#203a63] sm:px-6 sm:text-xl">Largest weighted contributors</h3>
        <div className="mx-4 mt-3 overflow-x-auto rounded-xl border border-slate-200 sm:mx-6">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.06em] text-slate-500"><tr><th className="border-b border-slate-200 px-3 py-3 font-bold">Company</th><th className="border-b border-slate-200 px-3 py-3">Sector</th><th className="border-b border-slate-200 px-3 py-3 text-right">Change</th><th className="border-b border-slate-200 px-3 py-3 text-right">Basket weight</th><th className="border-b border-slate-200 px-3 py-3 text-right">Contribution</th></tr></thead>
            <tbody>{contributionRows.map((row) => <tr key={row.symbol} className="border-b border-slate-100 last:border-b-0"><td className="px-3 py-3"><span className="block font-semibold text-slate-800">{row.symbol}</span><span className="block max-w-52 truncate text-slate-500">{row.company}</span></td><td className="px-3 py-3 text-slate-600">{titleCase(row.sector)}</td><td className={`px-3 py-3 text-right font-semibold tabular-nums ${changeClass(row.percentChange)}`}>{signedPercent(row.percentChange)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600">{((row.marketCap / totalMarketCap) * 100).toFixed(2)}%</td><td className={`px-3 py-3 text-right font-semibold tabular-nums ${changeClass(row.basketContribution)}`}>{row.basketContribution >= 0 ? "+" : ""}{row.basketContribution.toFixed(3)} pp</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-slate-100">
        <h3 className="px-4 pt-7 text-lg font-bold tracking-[-0.02em] text-[#203a63] sm:px-6 sm:text-xl">Sector scorecard</h3>
        <div className="mx-4 mt-3 overflow-x-auto rounded-xl border border-slate-200 sm:mx-6">
          <table className="w-full min-w-[840px] border-collapse text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.06em] text-slate-500"><tr><th className="border-b border-slate-200 px-3 py-3 font-bold">Sector</th><th className="border-b border-slate-200 px-3 py-3 text-right">Companies</th><th className="border-b border-slate-200 px-3 py-3 text-right">Weighted move</th><th className="border-b border-slate-200 px-3 py-3 text-right">Market-cap share</th><th className="border-b border-slate-200 px-3 py-3 text-right">A/D/U</th><th className="border-b border-slate-200 px-3 py-3 text-right">Volume</th><th className="border-b border-slate-200 px-3 py-3 text-right">Est. traded value</th></tr></thead>
            <tbody>{sectors.map((sector) => <tr key={sector.sector} className="border-b border-slate-100 last:border-b-0"><td className="px-3 py-3 font-medium text-slate-800">{titleCase(sector.sector)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600">{sector.companies}</td><td className={`px-3 py-3 text-right font-semibold tabular-nums ${changeClass(sector.weightedChange)}`}>{signedPercent(sector.weightedChange)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600">{sector.marketCapShare.toFixed(2)}%</td><td className="px-3 py-3 text-right tabular-nums text-slate-600">{sector.advances}/{sector.declines}/{sector.unchanged}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600">{compactNumber(sector.volume)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600">PKR {compactNumber(sector.tradedValue)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <details className="mx-4 mt-7 rounded-xl border border-slate-200 bg-[#f7f9fc] px-4 py-3 text-sm text-slate-600 sm:mx-6">
        <summary className="cursor-pointer font-semibold text-[#203a63]">How each metric is calculated</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-6">
          <li>Heatmap tiles are grouped by sector. Tile size represents market capitalisation or trade volume, depending on the selected view; green indicates a positive daily change and red a negative change.</li>
          <li>Daily percentage change is the CSV&apos;s <code>percent_change</code> field: the move from LDCP to the current close.</li>
          <li>Top gainers and losers are the five highest and lowest daily percentage changes, not the rupee change in price.</li>
          <li>Advances, declines, and unchanged stocks are counts of positive, negative, and zero daily percentage changes. The advance–decline ratio divides advances by declines.</li>
          <li>Equal-weight average and median moves summarise the 100 daily percentage changes; each company has equal influence.</li>
          <li>Market-cap-weighted basket move is the sum of each stock&apos;s daily percentage change multiplied by its share of combined market capitalisation.</li>
          <li>Total volume is the sum of reported share volume across the 100 companies. Volume leaders are the five highest reported volumes.</li>
          <li>Estimated traded value is close multiplied by reported volume; it is an approximation, not official turnover.</li>
          <li>Estimated traded-value leaders are the five highest estimated traded values. Combined market capitalisation is the sum of all constituent market caps.</li>
          <li>Intraday range is <code>(high − low) / LDCP × 100</code>.</li>
          <li>Basket weight is company market capitalisation divided by the total; weighted contribution is daily percentage change multiplied by that weight, in percentage points.</li>
          <li>Sector weighted move is the market-cap-weighted average daily change of sector members. Sector market-cap share is the sector&apos;s market cap divided by the total, while A/D/U is its advances, declines, and unchanged stocks.</li>
        </ul>
      </details>
      <section className="mx-4 mt-4 rounded-xl border border-amber-200/80 bg-amber-50/40 px-4 py-3 text-sm text-slate-600 sm:mx-6">
        <h3 className="font-semibold text-amber-900">Limitations</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
          <li>Market-cap-weighted figures use total company market capitalisation, not official KSE-100 free-float index weights. They are analytical estimates rather than official index returns or point contributions.</li>
          <li>Closing price multiplied by volume does not account for individual trade prices.</li>
          <li>This report is informational only and is not investment advice.</li>
        </ul>
      </section>
      <div className="px-4 pb-7 pt-4 text-xs leading-5 text-slate-400 sm:px-6">
        {collectionLabel(rows[0]?.downloadedAtUtc) ? `Data collected ${collectionLabel(rows[0]?.downloadedAtUtc)} from the selected daily CSV.` : "Figures are informational only and are not investment advice."}
      </div>
    </section>
  );
}
