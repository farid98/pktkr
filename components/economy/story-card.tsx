import Link from "next/link";

import type { EconomyStory } from "@/lib/economy/stories";

export function EconomyStoryCard({ story }: { story: EconomyStory }) {
  return <Link href={story.href} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bfd2e7] hover:shadow-md"><div className="flex items-center justify-between gap-4"><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${story.accent}`}>{story.eyebrow}</span><span className="text-xs text-slate-400">{story.coverage}</span></div><h3 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.03em] text-[#203a63] group-hover:text-[#315a8a]">{story.title}</h3><p className="mt-4 text-sm leading-6 text-slate-500">{story.summary}</p><p className="mt-6 text-sm font-bold text-[#315a8a]">Read briefing <span aria-hidden="true">→</span></p></Link>;
}
