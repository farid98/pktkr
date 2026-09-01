import Link from "next/link";

import { DailyReport } from "@/components/daily-report";
import { SiteHeader } from "@/components/site-header";
import { getBlogPosts } from "@/lib/blog";
import { getLatestNews } from "@/lib/market-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Blog — Pakistan Market and Economy Research",
  description: "Company deep dives, PSX market notes, and Pakistan economy analysis from pktkr.",
  path: "/blog",
});

export const dynamic = "force-dynamic";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(`${value}T12:00:00+05:00`));
}

export default async function BlogPage() {
  const [posts, newsMarkdown] = await Promise.all([getBlogPosts(), getLatestNews()]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="blog" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 sm:mb-10">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">Research and analysis</p>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-5xl">Blog</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Company deep dives, PSX market context, and Pakistan economy analysis. New posts are published from version-controlled MDX files.</p>
        </section>

        {posts.length ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article key={post.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)] transition hover:border-slate-300 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                  <span className="text-[#58749b]">{post.category}</span>
                  <span>{displayDate(post.date)}</span>
                </div>
                <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] text-[#203a63] sm:text-2xl"><Link href={`/blog/${post.slug}`} className="hover:text-slate-900">{post.title}</Link></h2>
                <p className="mt-2 max-w-3xl leading-6 text-slate-600">{post.summary}</p>
                {post.tags.length ? <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{tag}</span>)}</div> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No posts have been published yet.</p>
        )}

        {newsMarkdown ? (
          <section id="latest-news" className="mt-12">
            <div className="mb-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#58749b]">Latest briefing</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#203a63] sm:text-3xl">Market & economy news</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">The latest company, market, macroeconomic, and regulatory developments.</p>
            </div>
            <DailyReport id="blog-news" markdown={newsMarkdown} />
          </section>
        ) : null}
      </main>
    </div>
  );
}
