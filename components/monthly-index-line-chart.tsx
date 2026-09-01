"use client";

import { useEffect, useMemo, useState } from "react";

type IndexSession = { date: string; indexClose: number };

type MonthlyIndexLineChartProps = { startDate: string; endDate: string };

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", timeZone: "Asia/Karachi" }).format(
    new Date(`${value}T12:00:00+05:00`),
  );
}

function displayIndex(value: number) {
  return new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value);
}

export function MonthlyIndexLineChart({ startDate, endDate }: MonthlyIndexLineChartProps) {
  const [sessions, setSessions] = useState<IndexSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/data/index.json", { signal: controller.signal });
        if (!response.ok) throw new Error("The index data could not be loaded.");
        const payload = (await response.json()) as { sessions?: IndexSession[] };
        const nextSessions = (payload.sessions ?? []).filter(
          (session) => session.date >= startDate && session.date <= endDate && Number.isFinite(session.indexClose),
        );
        if (nextSessions.length < 2) throw new Error("Not enough index sessions are available.");
        setSessions(nextSessions);
        setError(null);
      } catch (caughtError) {
        if ((caughtError as Error).name !== "AbortError") setError("The August index chart is unavailable right now.");
      }
    }
    void load();
    return () => controller.abort();
  }, [endDate, startDate]);

  const chart = useMemo(() => {
    if (sessions.length < 2) return null;
    const width = 760;
    const height = 260;
    const padding = { top: 18, right: 74, bottom: 30, left: 14 };
    const closes = sessions.map((session) => session.indexClose);
    const rawMin = Math.min(...closes);
    const rawMax = Math.max(...closes);
    const paddingValue = Math.max((rawMax - rawMin) * 0.12, 150);
    const minimum = rawMin - paddingValue;
    const maximum = rawMax + paddingValue;
    const x = (index: number) => padding.left + (index / (sessions.length - 1)) * (width - padding.left - padding.right);
    const y = (value: number) => padding.top + ((maximum - value) / (maximum - minimum)) * (height - padding.top - padding.bottom);
    const points = sessions.map((session, index) => `${x(index)},${y(session.indexClose)}`).join(" ");
    const start = sessions[0];
    const end = sessions.at(-1)!;
    const change = end.indexClose - start.indexClose;
    const returnPercent = (end.indexClose / start.indexClose - 1) * 100;
    return { width, height, padding, minimum, maximum, points, x, y, start, end, change, returnPercent, sessions };
  }, [sessions]);

  if (error) return <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{error}</p>;
  if (!chart) return <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Loading KSE-100 trend…</p>;

  const middle = chart.sessions[Math.floor(chart.sessions.length / 2)];
  const horizontalGuides = [0.25, 0.5, 0.75].map((fraction) => chart.minimum + (chart.maximum - chart.minimum) * fraction);

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-lg font-bold tracking-[-0.02em] text-[#203a63]">KSE-100 daily close</h3>
          <p className="mt-1 text-sm text-slate-500">31 July–31 August 2026 · daily closing values</p>
        </div>
        <div className="flex gap-5 text-right">
          <div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">August return</p><p className="mt-1 text-xl font-bold text-[#176b63]">+{chart.returnPercent.toFixed(2)}%</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Month-end</p><p className="mt-1 text-xl font-bold text-slate-900">{displayIndex(chart.end.indexClose)}</p></div>
        </div>
      </div>
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`KSE-100 climbed ${chart.returnPercent.toFixed(2)} percent during August, ending at ${displayIndex(chart.end.indexClose)}`} className="mt-4 block h-auto w-full overflow-visible">
        {horizontalGuides.map((value) => <line key={value} x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={chart.y(value)} y2={chart.y(value)} stroke="#e2e8f0" strokeWidth="1" />)}
        <polyline points={chart.points} fill="none" stroke="#203a63" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={chart.x(0)} cy={chart.y(chart.start.indexClose)} r="4" fill="#203a63" />
        <circle cx={chart.x(chart.sessions.length - 1)} cy={chart.y(chart.end.indexClose)} r="5" fill="#176b63" stroke="#ffffff" strokeWidth="2" />
        <text x={chart.width - chart.padding.right + 10} y={chart.y(chart.maximum) + 4} fontSize="11" fill="#64748b">{displayIndex(chart.maximum)}</text>
        <text x={chart.width - chart.padding.right + 10} y={chart.y(chart.minimum) + 4} fontSize="11" fill="#64748b">{displayIndex(chart.minimum)}</text>
        {[chart.start, middle, chart.end].map((session) => {
          const index = chart.sessions.indexOf(session);
          return <text key={session.date} x={chart.x(index)} y={chart.height - 8} textAnchor={index === 0 ? "start" : index === chart.sessions.length - 1 ? "end" : "middle"} fontSize="11" fill="#64748b">{displayDate(session.date)}</text>;
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-slate-500">Opened the month at {displayIndex(chart.start.indexClose)} and added {displayIndex(chart.change)} points by 31 August.</figcaption>
    </figure>
  );
}
