import type { EconomyStory } from "@/lib/economy/stories";

import { EconomyStoryCard } from "./story-card";

export function EconomyStoryFeed({ stories }: { stories: EconomyStory[] }) {
  return <section aria-labelledby="latest-economy-stories"><div className="mb-4 flex items-end justify-between"><h2 id="latest-economy-stories" className="text-lg font-bold text-[#203a63]">Latest briefings</h2><span className="text-xs font-semibold text-slate-400">{stories.length} {stories.length === 1 ? "story" : "stories"}</span></div><div className="grid gap-5 lg:grid-cols-2">{stories.map((story) => <EconomyStoryCard key={story.slug} story={story} />)}</div></section>;
}
