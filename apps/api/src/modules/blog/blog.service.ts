import { prisma } from "@apnarooms/db";
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

function clean(value?: string | null) {
  return value?.trim() || undefined;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function uniqueSlug(title: string, preferred?: string) {
  const base = slugify(preferred || title) || `post-${Date.now()}`;
  let slug = base;
  let suffix = 2;

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function publishDate(status?: BlogStatus, publishedAt?: Date | null) {
  if (status !== "PUBLISHED") return publishedAt ?? null;
  return publishedAt ?? new Date();
}

export async function listPublicBlogPosts(query: Record<string, unknown>) {
  const limit = Math.min(24, Math.max(1, Number(query.limit) || 6));
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit
  });
  return { posts };
}

export async function listAdminBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });
  return { posts };
}

export async function getBlogPost(idOrSlug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
  });
  if (!post) throw new ApiError(404, "Blog post not found");
  return post;
}

export async function createBlogPost(input: BlogInput) {
  const title = clean(input.title);
  const body = clean(input.body);
  if (!title || !body) throw new ApiError(400, "Blog post requires title and body");

  const status = input.status ?? "DRAFT";
  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: await uniqueSlug(title, input.slug),
      excerpt: clean(input.excerpt),
      body,
      category: clean(input.category),
      coverImage: clean(input.coverImage),
      authorName: clean(input.authorName) ?? "ApnaRooms Team",
      status,
      publishedAt: publishDate(status, input.publishedAt)
    }
  });

  return post;
}

export async function updateBlogPost(id: string, input: Partial<BlogInput>) {
  const existing = await getBlogPost(id);
  const title = clean(input.title);
  const status = input.status ?? existing.status;
  const slug = input.slug && input.slug !== existing.slug ? await uniqueSlug(title ?? existing.title, input.slug) : undefined;

  return prisma.blogPost.update({
    where: { id: existing.id },
    data: {
      title,
      slug,
      excerpt: input.excerpt === null ? null : clean(input.excerpt),
      body: clean(input.body),
      category: input.category === null ? null : clean(input.category),
      coverImage: input.coverImage === null ? null : clean(input.coverImage),
      authorName: input.authorName === null ? null : clean(input.authorName),
      status,
      publishedAt: publishDate(status, input.publishedAt ?? existing.publishedAt)
    }
  });
}

export async function deleteBlogPost(id: string) {
  const existing = await getBlogPost(id);
  await prisma.blogPost.delete({ where: { id: existing.id } });
}
