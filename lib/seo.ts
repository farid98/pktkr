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
  imageAlt = "pktkr — Pakistan market and economy data",
  type = "website",
  publishedTime,
}: {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const image = { ...socialImage, url: imagePath, alt: imageAlt };

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
      type,
      images: [image],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}
