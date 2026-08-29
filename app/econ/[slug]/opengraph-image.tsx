import { ImageResponse } from "next/og";

import { EconomySocialImage, getEconomySocialImageData } from "@/lib/economy/social-image";
import { getPublishedEconomyStories } from "@/lib/economy/stories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPublishedEconomyStories().map((story) => ({ slug: story.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getEconomySocialImageData(slug);

  return new ImageResponse(<EconomySocialImage data={data} />, { ...size });
}
