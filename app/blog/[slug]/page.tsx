import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { blogMdxComponents } from "@/components/blog-mdx";
import { SiteHeader } from "@/components/site-header";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { remarkMermaid } from "@/lib/remark-mermaid";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(`${value}T12:00:00+05:00`));
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  return createPageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    components: blogMdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMermaid],
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="blog" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)] sm:px-10 sm:py-11">
          <Link href="/blog" className="text-sm font-semibold text-[#203a63] hover:text-slate-900">← All posts</Link>
          <div className="mt-7 border-b border-slate-100 pb-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500"><span className="text-[#58749b]">{post.category}</span><span>{displayDate(post.date)}</span></div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#203a63] sm:text-5xl">{post.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{post.summary}</p>
          </div>
          <div className="blog-prose">{content}</div>
        </article>
      </main>
    </div>
  );
}
