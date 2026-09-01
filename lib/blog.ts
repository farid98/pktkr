import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BlogFrontmatter = {
  title: string;
  summary: string;
  date: string;
  category: string;
  image?: string;
  tags?: string[];
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  tags: string[];
};

export type BlogPostContent = BlogPost & { content: string };

function parsePost(slug: string, source: string): BlogPostContent {
  const { data, content } = matter(source);
  const { title, summary, category, image, tags = [] } = data as Partial<BlogFrontmatter>;
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
    !tags.every((tag) => typeof tag === "string")
  ) {
    throw new Error(`Invalid frontmatter in blog post: ${slug}`);
  }

  return { slug, title, summary, date, category, image, tags, content };
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
