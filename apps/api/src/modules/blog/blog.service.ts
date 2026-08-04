import fs from "node:fs/promises";
import path from "node:path";
import { ApiError } from "../../utils/api-error.js";

type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type BlogInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  body: string;
  category?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  status?: BlogStatus;
  publishedAt?: Date | null;
};

type StoredBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  category?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  status: BlogStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const blogDataFile = process.env.BLOG_DATA_FILE || path.join(process.cwd(), "storage", "blog-posts.json");

function clean(value?: string | null) {
  return value?.trim() || undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function readPosts(): Promise<StoredBlogPost[]> {
  try {
    const raw = await fs.readFile(blogDataFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function writePosts(posts: StoredBlogPost[]) {
  await fs.mkdir(path.dirname(blogDataFile), { recursive: true });
  await fs.writeFile(blogDataFile, JSON.stringify(posts, null, 2));
}

async function uniqueSlug(title: string, preferred: string | undefined, currentId?: string) {
  const posts = await readPosts();
  const base = slugify(preferred || title) || `post-${Date.now()}`;
  let slug = base;
  let suffix = 2;

  while (posts.some((post) => post.slug === slug && post.id !== currentId)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function publishDate(status: BlogStatus, publishedAt?: Date | string | null) {
  if (status !== "PUBLISHED") return publishedAt ? new Date(publishedAt).toISOString() : null;
  return publishedAt ? new Date(publishedAt).toISOString() : nowIso();
}

function sortLatest(a: StoredBlogPost, b: StoredBlogPost) {
  const left = a.publishedAt || a.createdAt;
  const right = b.publishedAt || b.createdAt;
  return right.localeCompare(left);
}

export async function listPublicBlogPosts(query: Record<string, unknown>) {
  const limit = Math.min(24, Math.max(1, Number(query.limit) || 6));
  const posts = (await readPosts())
    .filter((post) => post.status === "PUBLISHED")
    .sort(sortLatest)
    .slice(0, limit);
  return { posts };
}

export async function listAdminBlogPosts() {
  const posts = (await readPosts()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { posts };
}

export async function getBlogPost(idOrSlug: string) {
  const post = (await readPosts()).find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  if (!post) throw new ApiError(404, "Blog post not found");
  return post;
}

export async function createBlogPost(input: BlogInput) {
  const title = clean(input.title);
  const body = clean(input.body);
  if (!title || !body) throw new ApiError(400, "Blog post requires title and body");

  const status = input.status ?? "DRAFT";
  const timestamp = nowIso();
  const posts = await readPosts();
  const post: StoredBlogPost = {
    id: `blog_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    slug: await uniqueSlug(title, input.slug),
    excerpt: clean(input.excerpt) ?? null,
    body,
    category: clean(input.category) ?? null,
    coverImage: clean(input.coverImage) ?? null,
    authorName: clean(input.authorName) ?? "ApnaRooms Team",
    status,
    publishedAt: publishDate(status, input.publishedAt),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  posts.unshift(post);
  await writePosts(posts);
  return post;
}

export async function updateBlogPost(id: string, input: Partial<BlogInput>) {
  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === id || post.slug === id);
  if (index < 0) throw new ApiError(404, "Blog post not found");

  const existing = posts[index];
  const status = input.status ?? existing.status;
  const title = clean(input.title) ?? existing.title;
  const post: StoredBlogPost = {
    ...existing,
    title,
    slug: input.slug && input.slug !== existing.slug ? await uniqueSlug(title, input.slug, existing.id) : existing.slug,
    excerpt: input.excerpt === undefined ? existing.excerpt : clean(input.excerpt) ?? null,
    body: clean(input.body) ?? existing.body,
    category: input.category === undefined ? existing.category : clean(input.category) ?? null,
    coverImage: input.coverImage === undefined ? existing.coverImage : clean(input.coverImage) ?? null,
    authorName: input.authorName === undefined ? existing.authorName : clean(input.authorName) ?? null,
    status,
    publishedAt: publishDate(status, input.publishedAt ?? existing.publishedAt),
    updatedAt: nowIso()
  };

  posts[index] = post;
  await writePosts(posts);
  return post;
}

export async function deleteBlogPost(id: string) {
  const posts = await readPosts();
  const nextPosts = posts.filter((post) => post.id !== id && post.slug !== id);
  if (nextPosts.length === posts.length) throw new ApiError(404, "Blog post not found");
  await writePosts(nextPosts);
}
