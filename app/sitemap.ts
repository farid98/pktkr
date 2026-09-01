import type { MetadataRoute } from "next";

import { getMarketIndex, getMarketSessionForDate } from "@/lib/market-data";
import { getBlogPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const index = await getMarketIndex();
  const blogPosts = await getBlogPosts();
  const sessions = await Promise.all(
    index.sessions.map((session) => getMarketSessionForDate(session.date)),
  );
  const latestSession = sessions.find((session) => session?.date === index.latest);
  const latestModified = latestSession?.rows[0]?.downloadedAtUtc ?? new Date();
  const archiveEntries = sessions.flatMap((session) => {
    if (!session) return [];
    return [{
      url: new URL(`/psx-closing/${session.date}`, siteUrl).toString(),
      lastModified: session.rows[0]?.downloadedAtUtc ?? `${session.date}T00:00:00Z`,
      changeFrequency: "never" as const,
      priority: 0.7,
    }];
  });

  return [
    { url: new URL("/", siteUrl).toString(), lastModified: latestModified, changeFrequency: "daily", priority: 1 },
    { url: new URL("/explore", siteUrl).toString(), lastModified: latestModified, changeFrequency: "daily", priority: 0.8 },
    ...archiveEntries,
    { url: new URL("/econ", siteUrl).toString(), changeFrequency: "weekly", priority: 0.9 },
    { url: new URL("/econ/trade", siteUrl).toString(), changeFrequency: "monthly", priority: 0.8 },
    { url: new URL("/econ/it-exports", siteUrl).toString(), changeFrequency: "monthly", priority: 0.8 },
    { url: new URL("/news", siteUrl).toString(), lastModified: latestModified, changeFrequency: "daily", priority: 0.5 },
    { url: new URL("/blog", siteUrl).toString(), lastModified: blogPosts[0]?.date, changeFrequency: "weekly", priority: 0.8 },
    ...blogPosts.map((post) => ({
      url: new URL(`/blog/${post.slug}`, siteUrl).toString(),
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
