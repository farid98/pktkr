import Link from "next/link";

import { MarketCloseContent } from "@/components/market-close-content";
import { SiteHeader } from "@/components/site-header";
import { getBlogPosts } from "@/lib/blog";
import { getMarketSession } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Latest PSX Closing — KSE-100 Market Close",
  description:
    "Latest available PSX market-close data: KSE-100 heat map, gainers, losers, volume leaders, and market summary. Updated after each trading session.",
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
            <span className="min-w-0 truncate font-semibold text-[#203a63]">{latestBlogPost.title}</span>
            <span aria-hidden="true" className="shrink-0 font-bold text-[#315a8a]">→</span>
          </Link>
        ) : null}

        <MarketCloseContent
          date={date}
          rows={rows}
          index={index}
        />
      </main>
    </div>
  );
}
