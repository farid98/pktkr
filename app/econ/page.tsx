import { SiteHeader } from "@/components/site-header";
import { EconomyStoryFeed } from "@/components/economy/story-feed";
import { getPublishedEconomyStories } from "@/lib/economy/stories";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pakistan Economy",
  description:
    "Data-backed briefings on Pakistan’s trade, growth, external accounts, and important economic sectors.",
  path: "/econ",
});

export const revalidate = 3600;

export default function EconomyPage() {
  const stories = getPublishedEconomyStories();

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader section="economy" active="economy" />
      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 sm:py-12">
        <section className="mb-10 max-w-3xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#58749b]">Pakistan economy</p>
          <h1 className="text-3xl font-bold tracking-[-0.045em] text-[#203a63] sm:text-5xl">Briefings on the forces shaping Pakistan’s economy.</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">Short, data-backed stories on trade, growth, external accounts, and the sectors that matter. Each briefing links through to the underlying charts and sources.</p>
        </section>

        <EconomyStoryFeed stories={stories} />

        <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6"><p className="text-sm font-semibold text-slate-700">More economy stories are coming</p><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">This page is the editorial front door for the Economy section. New analysis can be added as a short story card here while keeping the detailed charts and source notes on their own pages.</p></section>
      </main>
    </div>
  );
}
