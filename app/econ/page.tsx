import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

const stories = [
  {
    href: "/econ/trade",
    eyebrow: "External trade · PBS",
    title: "Pakistan’s trade gap remains the central external-sector story",
    summary: "A long-run view of merchandise exports, imports, the trade balance, and the categories shaping Pakistan’s goods trade.",
    meta: "1985–86 to 2024–25",
    accent: "bg-[#eef5fb] text-[#315a8a]",
  },
  {
    href: "/econ/it-exports",
    eyebrow: "Services exports · SBP",
    title: "Pakistan’s IT exports are becoming material",
    summary: "Computer-services exports have more than doubled since FY2020 and now sit near the scale of major merchandise categories such as rice and bed-wear.",
    meta: "FY2020 to Jul–Apr FY2026",
    accent: "bg-[#edf8f4] text-[#0f766e]",
  },
];

export default function EconomyPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="economy" active="economy" />
      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 sm:py-12">
        <section className="mb-10 max-w-3xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#58749b]">Pakistan economy</p>
          <h1 className="text-3xl font-bold tracking-[-0.045em] text-[#203a63] sm:text-5xl">Briefings on the forces shaping Pakistan’s economy.</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">Short, data-backed stories on trade, growth, external accounts, and the sectors that matter. Each briefing links through to the underlying charts and sources.</p>
        </section>

        <section aria-labelledby="latest-economy-stories">
          <div className="mb-4 flex items-end justify-between"><h2 id="latest-economy-stories" className="text-lg font-bold text-[#203a63]">Latest briefings</h2><span className="text-xs font-semibold text-slate-400">2 stories</span></div>
          <div className="grid gap-5 lg:grid-cols-2">
            {stories.map((story) => (
              <Link key={story.href} href={story.href} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bfd2e7] hover:shadow-md">
                <div className="flex items-center justify-between gap-4"><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${story.accent}`}>{story.eyebrow}</span><span className="text-xs text-slate-400">{story.meta}</span></div>
                <h3 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.03em] text-[#203a63] group-hover:text-[#315a8a]">{story.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-500">{story.summary}</p>
                <p className="mt-6 text-sm font-bold text-[#315a8a]">Read briefing <span aria-hidden="true">→</span></p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6"><p className="text-sm font-semibold text-slate-700">More economy stories are coming</p><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">This page is the editorial front door for the Economy section. New analysis can be added as a short story card here while keeping the detailed charts and source notes on their own pages.</p></section>
      </main>
    </div>
  );
}
