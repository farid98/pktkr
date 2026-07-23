"use client";

import { useRouter } from "next/navigation";

import type { MarketSession } from "@/lib/market-types";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(`${value}T12:00:00+05:00`));
}

export function DateSelector({
  currentDate,
  sessions,
}: {
  currentDate: string;
  sessions: MarketSession[];
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <span>Viewing</span>
      <select
        aria-label="Trading session"
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        value={currentDate}
        onChange={(event) => router.push(`/?date=${event.target.value}`)}
      >
        {sessions.map(({ date }) => (
          <option value={date} key={date}>
            {displayDate(date)}
          </option>
        ))}
      </select>
    </label>
  );
}
