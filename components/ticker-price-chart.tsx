"use client";

import { useMemo, useState } from "react";

import type { TickerOhlcvPoint } from "@/lib/market-types";

type Period = "5D" | "1M" | "3M" | "1Y" | "Max";
type ChartType = "candle" | "line";

const periodSizes: Record<Period, number> = { "5D": 5, "1M": 22, "3M": 66, "1Y": 252, Max: Infinity };

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(
    new Date(`${value}T12:00:00+05:00`),
  );
}

function displayPrice(value: number) {
  return new Intl.NumberFormat("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function compactNumber(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function hasCandle(point: TickerOhlcvPoint) {
  return point.open !== null && point.high !== null && point.low !== null;
}

export function TickerPriceChart({ symbol, points }: { symbol: string; points: TickerOhlcvPoint[] }) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [chartType, setChartType] = useState<ChartType>("candle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const visiblePoints = points.slice(-periodSizes[period]);
  const chart = useMemo(() => {
    if (visiblePoints.length < 2) return null;
    const width = 820;
    const height = 380;
    const padding = { top: 18, right: 18, bottom: 34, left: 18 };
    const priceBottom = 254;
    const volumeTop = 278;
    const values = visiblePoints.flatMap((point) => chartType === "candle" && hasCandle(point) ? [point.low!, point.high!] : [point.close]);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pricePadding = Math.max((rawMax - rawMin) * 0.12, rawMax * 0.01, 0.5);
    const minimum = rawMin - pricePadding;
    const maximum = rawMax + pricePadding;
    const maxVolume = Math.max(...visiblePoints.map((point) => point.volume ?? 0), 1);
    const x = (index: number) => padding.left + (index / (visiblePoints.length - 1)) * (width - padding.left - padding.right);
    const y = (value: number) => padding.top + ((maximum - value) / (maximum - minimum)) * (priceBottom - padding.top);
    const volumeY = (value: number) => volumeTop + 56 - (value / maxVolume) * 56;
    return { width, height, padding, priceBottom, volumeTop, minimum, maximum, x, y, volumeY, linePoints: visiblePoints.map((point, index) => `${x(index)},${y(point.close)}`).join(" ") };
  }, [chartType, visiblePoints]);

  if (!chart) return <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Not enough price history is available yet.</p>;

  const activeIndex = selectedIndex === null ? visiblePoints.length - 1 : Math.min(selectedIndex, visiblePoints.length - 1);
  const active = visiblePoints[activeIndex];
  const start = visiblePoints[0];
  const change = ((active.close / start.close) - 1) * 100;
  const guides = [0.25, 0.5, 0.75].map((fraction) => chart.minimum + (chart.maximum - chart.minimum) * fraction);
  const tickIndexes = [0, Math.floor((visiblePoints.length - 1) / 2), visiblePoints.length - 1];
  const candleWidth = Math.max(1.5, Math.min(11, (chart.width - chart.padding.left - chart.padding.right) / visiblePoints.length * 0.62));

  function selectPosition(clientX: number, target: SVGSVGElement) {
    const bounds = target.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    setSelectedIndex(Math.round(ratio * (visiblePoints.length - 1)));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{chartType === "candle" ? "OHLC price history" : "Closing-price history"}</p>
          <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-900">PKR {displayPrice(active.close)}</p>
          <p className={`mt-1 text-sm font-semibold ${change >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}% since {displayDate(start.date)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold" aria-label={`${symbol} chart type`}>
            {(["candle", "line"] as const).map((option) => <button key={option} type="button" onClick={() => { setChartType(option); setSelectedIndex(null); }} aria-pressed={chartType === option} className={`rounded-md px-3 py-1.5 capitalize transition ${chartType === option ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{option}</button>)}
          </div>
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold" aria-label={`${symbol} chart period`}>
            {(Object.keys(periodSizes) as Period[]).map((option) => <button key={option} type="button" onClick={() => { setPeriod(option); setSelectedIndex(null); }} aria-pressed={period === option} className={`rounded-md px-2.5 py-1.5 transition ${period === option ? "bg-white text-[#203a63] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{option}</button>)}
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`${symbol} ${period} ${chartType} chart`} className="mt-5 block h-auto w-full touch-none" onPointerMove={(event) => selectPosition(event.clientX, event.currentTarget)} onPointerLeave={() => setSelectedIndex(null)}>
        {guides.map((value) => <line key={value} x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={chart.y(value)} y2={chart.y(value)} stroke="#e2e8f0" strokeWidth="1" />)}
        <line x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={chart.volumeTop - 10} y2={chart.volumeTop - 10} stroke="#e2e8f0" strokeWidth="1" />
        {visiblePoints.map((point, index) => <rect key={point.date} x={chart.x(index) - candleWidth / 2} y={chart.volumeY(point.volume ?? 0)} width={candleWidth} height={chart.volumeTop + 56 - chart.volumeY(point.volume ?? 0)} fill={point.close >= (point.open ?? point.close) ? "#86efac" : "#fda4af"} opacity="0.8" />)}
        {chartType === "line" ? <polyline points={chart.linePoints} fill="none" stroke="#203a63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /> : visiblePoints.map((point, index) => {
          if (!hasCandle(point)) return <circle key={point.date} cx={chart.x(index)} cy={chart.y(point.close)} r="2" fill="#203a63" />;
          const positive = point.close >= point.open!;
          const top = chart.y(Math.max(point.open!, point.close));
          const bottom = chart.y(Math.min(point.open!, point.close));
          return <g key={point.date}><line x1={chart.x(index)} x2={chart.x(index)} y1={chart.y(point.high!)} y2={chart.y(point.low!)} stroke={positive ? "#15803d" : "#be123c"} strokeWidth="1.2" /><rect x={chart.x(index) - candleWidth / 2} y={top} width={candleWidth} height={Math.max(1.5, bottom - top)} fill={positive ? "#22c55e" : "#f43f5e"} /></g>;
        })}
        <line x1={chart.x(activeIndex)} x2={chart.x(activeIndex)} y1={chart.padding.top} y2={chart.volumeTop + 56} stroke="#94a3b8" strokeDasharray="4 4" />
        <circle cx={chart.x(activeIndex)} cy={chart.y(active.close)} r="4" fill="#176b63" stroke="white" strokeWidth="2" />
        {tickIndexes.map((index) => <text key={index} x={chart.x(index)} y={chart.height - 9} textAnchor={index === 0 ? "start" : index === visiblePoints.length - 1 ? "end" : "middle"} fontSize="11" fill="#64748b">{displayDate(visiblePoints[index].date)}</text>)}
      </svg>
      <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2"><span>{displayDate(active.date)} · Volume {compactNumber(active.volume)} shares</span><span className="sm:text-right">O {active.open === null ? "—" : displayPrice(active.open)} · H {active.high === null ? "—" : displayPrice(active.high)} · L {active.low === null ? "—" : displayPrice(active.low)} · C {displayPrice(active.close)}</span></div>
    </section>
  );
}
