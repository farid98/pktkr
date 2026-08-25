export type EconomyStory = {
  slug: string;
  href: string;
  eyebrow: string;
  title: string;
  summary: string;
  coverage: string;
  publishedAt: string;
  source: string;
  accent: string;
  status: "published" | "draft";
};

const stories: EconomyStory[] = [
  { slug: "trade", href: "/econ/trade", eyebrow: "External trade · PBS", title: "Pakistan’s trade gap remains the central external-sector story", summary: "A long-run view of merchandise exports, imports, the trade balance, and the categories shaping Pakistan’s goods trade.", coverage: "1985–86 to 2024–25", publishedAt: "2026-08-25", source: "Pakistan Bureau of Statistics", accent: "bg-[#eef5fb] text-[#315a8a]", status: "published" },
  { slug: "it-exports", href: "/econ/it-exports", eyebrow: "Services exports · SBP", title: "Pakistan’s IT exports are becoming material", summary: "Computer-services exports have more than doubled since FY2020 and now sit near the scale of major merchandise categories such as rice and bed-wear.", coverage: "FY2020 to Jul–Apr FY2026", publishedAt: "2026-08-25", source: "State Bank of Pakistan", accent: "bg-[#edf8f4] text-[#0f766e]", status: "published" },
];

export function getPublishedEconomyStories(): EconomyStory[] {
  return stories.filter((story) => story.status === "published").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
