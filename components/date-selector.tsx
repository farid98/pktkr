"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

import type { MarketSession } from "@/lib/market-types";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(`${value}T12:00:00+05:00`));
}

export function DateSelector({
  currentDate,
  sessions,
  iconOnly = false,
}: {
  currentDate: string;
  sessions: MarketSession[];
  iconOnly?: boolean;
}) {
  const router = useRouter();

  if (iconOnly) {
    return (
      <label className="relative grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white text-[#315a8a] shadow-sm transition hover:border-[#a9c3dd] hover:bg-[#eef5fb] focus-within:ring-2 focus-within:ring-slate-200" title="Choose a closing session">
        <CalendarDays aria-hidden="true" size={17} strokeWidth={2.25} />
        <span className="sr-only">Choose a closing session</span>
        <select
          aria-label="Choose a closing session"
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          value={currentDate}
          onChange={(event) => router.push(`/?date=${event.target.value}`)}
        >
          {sessions.map(({ date }) => <option value={date} key={date}>{displayDate(date)}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <span className="hidden sm:inline">Viewing</span>
      <select
        aria-label="Trading session"
        className="h-9 w-[164px] min-w-0 rounded-lg border border-slate-200 bg-white px-2 pr-6 text-xs font-semibold text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:h-10 sm:w-auto sm:px-3 sm:pr-8 sm:text-sm"
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
