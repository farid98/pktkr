"use client";

import { useMemo, useState } from "react";

type IndexPoint = { date: string; value: number };
type Period = 30 | 90 | 120;

function datesWithin(points: IndexPoint[], period: Period) {
  const latest = points.at(-1);
  if (!latest) return [];
  const start = new Date(`${latest.date}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (period - 1));
  return points.filter((point) => new Date(`${point.date}T12:00:00Z`) >= start);
}

function MiniIndexChart({ values, period }: { values: number[]; period: Period }) {
  if (values.length < 2) return <div className="h-14 rounded-lg bg-slate-800" aria-label="Index history unavailable" />;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${52 - ((value - min) / range) * 44}`).join(" ");
  return <svg viewBox="0 0 100 56" role="img" aria-label={`${period}-day KSE-100 closing-level trend`} className="h-16 w-full overflow-visible"><polyline points={points} fill="none" stroke={values.at(-1)! >= values[0] ? "#34d399" : "#fb7185"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}

export function IndexTrendToggle({ points }: { points: IndexPoint[] }) {
  const [period, setPeriod] = useState<Period>(30);
  const visiblePoints = useMemo(() => datesWithin(points, period), [period, points]);
  const periodChange = visiblePoints.length >= 2 ? ((visiblePoints.at(-1)!.value / visiblePoints[0].value) - 1) * 100 : null;
  const changeClass = periodChange == null ? "text-slate-500" : periodChange >= 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="rounded-xl bg-[#0f172a] px-2.5 py-2 sm:px-4 sm:py-2.5" title={`${period} calendar days ending on the selected session`}>
      <div className="mb-0.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 sm:text-[10px] sm:tracking-[0.12em]">{period}-day trend <span className={`ml-1 tabular-nums ${changeClass}`}>{periodChange == null ? "—" : `${periodChange >= 0 ? "+" : ""}${periodChange.toFixed(2)}%`}</span></span>
        <div className="inline-flex self-start rounded bg-slate-800 p-0.5 sm:self-auto" aria-label="Index trend period">
          {([30, 90] as const).map((option) => <button key={option} type="button" onClick={() => setPeriod(option)} aria-pressed={period === option} className={`rounded px-1 py-0.5 text-[8px] font-bold transition sm:px-1.5 sm:text-[9px] ${period === option ? "bg-[#58749b] text-white" : "text-slate-400 hover:text-white"}`}>{option}D</button>)}
        </div>
      </div>
      <MiniIndexChart values={visiblePoints.map((point) => point.value)} period={period} />
    </div>
  );
}
