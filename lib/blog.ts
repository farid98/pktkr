import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SocialCardMetric = { label: string; value: string; note?: string };

type GeneratedSocialCard = {
  version: string;
  eyebrow?: string;
  headline?: string[];
  description?: string;
  metrics?: SocialCardMetric[];
};

export type SocialCard =
  | (GeneratedSocialCard & { type: "article" })
  | (GeneratedSocialCard & { type: "company-briefing" })
  | {
      type: "market-wrap";
      version: string;
      label: string;
      startDate: string;
      endDate: string;
    }
  | { type: "image"; src: string; alt?: string };

type BlogFrontmatter = {
  title: string;
  summary: string;
  date: string;
  category: string;
  image?: string;
  tags?: string[];
  socialCard?: SocialCard;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  tags: string[];
};

export type BlogPostContent = BlogPost & { content: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseSocialCard(value: unknown): SocialCard | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const card = value as Record<string, unknown>;
  if (card.type === "image") {
    return typeof card.src === "string" && (card.alt === undefined || typeof card.alt === "string")
      ? { type: "image", src: card.src, ...(typeof card.alt === "string" ? { alt: card.alt } : {}) }
      : undefined;
  }

  if (card.type === "market-wrap") {
    return typeof card.version === "string" && typeof card.label === "string" && typeof card.startDate === "string" && typeof card.endDate === "string"
      ? { type: "market-wrap", version: card.version, label: card.label, startDate: card.startDate, endDate: card.endDate }
      : undefined;
  }

  if (card.type === "article" || card.type === "company-briefing") {
    const metrics = card.metrics;
    const validMetrics =
      metrics === undefined ||
      (Array.isArray(metrics) && metrics.every((metric) =>
        metric && typeof metric === "object" && !Array.isArray(metric) &&
        typeof (metric as Record<string, unknown>).label === "string" &&
        typeof (metric as Record<string, unknown>).value === "string" &&
        ((metric as Record<string, unknown>).note === undefined || typeof (metric as Record<string, unknown>).note === "string"),
      ));
    if (typeof card.version !== "string" || !validMetrics || (card.eyebrow !== undefined && typeof card.eyebrow !== "string") ||
      (card.headline !== undefined && !isStringArray(card.headline)) || (card.description !== undefined && typeof card.description !== "string")) return undefined;

    return {
      type: card.type,
      version: card.version,
      ...(typeof card.eyebrow === "string" ? { eyebrow: card.eyebrow } : {}),
      ...(isStringArray(card.headline) ? { headline: card.headline } : {}),
      ...(typeof card.description === "string" ? { description: card.description } : {}),
      ...(Array.isArray(metrics) ? { metrics: metrics as SocialCardMetric[] } : {}),
    };
  }

  return undefined;
}

function parsePost(slug: string, source: string): BlogPostContent {
  const { data, content } = matter(source);
  const { title, summary, category, image, tags = [] } = data as Partial<BlogFrontmatter>;
  const socialCard = parseSocialCard(data.socialCard);
  const rawDate = data.date;
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : typeof rawDate === "string"
        ? rawDate
        : null;

  if (
    typeof title !== "string" ||
    typeof summary !== "string" ||
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof category !== "string" ||
    (image !== undefined && typeof image !== "string") ||
    !Array.isArray(tags) ||
    !tags.every((tag) => typeof tag === "string") ||
    (data.socialCard !== undefined && !socialCard)
  ) {
    throw new Error(`Invalid frontmatter in blog post: ${slug}`);
  }

  return { slug, title, summary, date, category, image, tags, ...(socialCard ? { socialCard } : {}), content };
}

export function getBlogImagePath(post: BlogPost): string {
  if (post.socialCard?.type === "image") return post.socialCard.src;
  if (post.socialCard && "version" in post.socialCard) return `/blog/${post.slug}/opengraph-image?v=${post.socialCard.version}`;
  return post.image ?? `/blog/${post.slug}/opengraph-image`;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  let entries;
  try {
    entries = await readdir(BLOG_ROOT, { encoding: "utf8", withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map(async (entry) => {
        const slug = entry.name.slice(0, -4);
        if (!SAFE_SLUG.test(slug)) {
          throw new Error(`Blog filename must be a lowercase kebab-case slug: ${entry.name}`);
        }
        const source = await readFile(path.join(BLOG_ROOT, entry.name), "utf8");
        const parsed = parsePost(slug, source);
        return {
          slug: parsed.slug,
          title: parsed.title,
          summary: parsed.summary,
          date: parsed.date,
          category: parsed.category,
          image: parsed.image,
          tags: parsed.tags,
          ...(parsed.socialCard ? { socialCard: parsed.socialCard } : {}),
        };
      }),
  );

  return posts.sort((left, right) => right.date.localeCompare(left.date));
}

export async function getBlogPost(slug: string): Promise<BlogPostContent | null> {
  if (!SAFE_SLUG.test(slug)) return null;

  try {
    const source = await readFile(path.join(BLOG_ROOT, `${slug}.mdx`), "utf8");
    return parsePost(slug, source);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
