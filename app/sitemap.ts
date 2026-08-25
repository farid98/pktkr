import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: new URL("/", siteUrl).toString(), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: new URL("/explore", siteUrl).toString(), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: new URL("/econ", siteUrl).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: new URL("/econ/trade", siteUrl).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: new URL("/econ/it-exports", siteUrl).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: new URL("/news", siteUrl).toString(), lastModified: now, changeFrequency: "daily", priority: 0.5 },
  ];
}
