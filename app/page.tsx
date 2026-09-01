import Link from "next/link";

import { DateSelector } from "@/components/date-selector";
import { MarketCloseContent } from "@/components/market-close-content";
import { SiteHeader } from "@/components/site-header";
import { getBlogPosts } from "@/lib/blog";
import { getMarketSession } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "PSX Closing Today — KSE-100 Market Close",
  description:
    "Today’s PSX closing data: KSE-100 market close, heat map, gainers, losers, volume leaders, and market summary. Updated after each trading session.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: requestedDate } = await searchParams;
  const [{ date, rows, index }, latestBlogPost] = await Promise.all([
    getMarketSession(requestedDate),
    getBlogPosts().then((posts) => posts[0] ?? null),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="market" />

      <main className="mx-auto max-w-[1880px] px-3 py-4 sm:px-8 sm:py-10">
        {latestBlogPost ? (
          <Link
            href={`/blog/${latestBlogPost.slug}`}
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#d6e2ef] bg-[#eef5fb] px-4 py-3 text-sm transition hover:border-[#a9c3dd] hover:bg-[#e4f0fa] sm:mb-7"
          >
            <span className="min-w-0 font-semibold text-[#203a63]">{latestBlogPost.title}</span>
            <span aria-hidden="true" className="shrink-0 font-bold text-[#315a8a]">→</span>
          </Link>
        ) : null}

        <section
          id="market-map"
          className="mb-4 flex flex-row items-center justify-between gap-2 lg:mb-6 lg:gap-5"
        >
          <h1 className="whitespace-nowrap text-2xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-4xl">PSX Closing</h1>
          <div className="flex min-w-0 items-center">
            <DateSelector
              currentDate={date}
              sessions={[...index.sessions].reverse()}
            />
          </div>
        </section>

        <MarketCloseContent
          date={date}
          rows={rows}
          index={index}
        />
      </main>
    </div>
  );
}
