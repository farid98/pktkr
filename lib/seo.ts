import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pktkr.com",
);

export const siteName = "pktkr";
export const defaultDescription =
  "Clear, data-backed views of Pakistan’s stock market, economy, trade, and exports.";

const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "pktkr — Pakistan market and economy data",
};

export function createPageMetadata({
  title,
  description,
  path,
  imagePath = "/opengraph-image",
}: {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}): Metadata {
  const image = { ...socialImage, url: imagePath };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: "en_PK",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}
