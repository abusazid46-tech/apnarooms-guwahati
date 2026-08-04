import { Router } from "express";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createBlogPost, deleteBlogPost, getBlogPost, listAdminBlogPosts, listPublicBlogPosts, updateBlogPost } from "./blog.service.js";

export const blogRoutes = Router();

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.date().nullable().optional()
);

const blogSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().max(100).optional(),
  excerpt: z.string().trim().max(280).nullable().optional(),
  body: z.string().trim().min(20).max(20000),
  category: z.string().trim().max(60).nullable().optional(),
  coverImage: z.string().trim().url().nullable().optional(),
  authorName: z.string().trim().max(80).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: optionalDate
});

blogRoutes.get("/", async (req, res) => {
  const result = await listPublicBlogPosts(req.query);
  res.json(result);
});

blogRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  const result = await listAdminBlogPosts();
  res.json(result);
});

blogRoutes.get("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const post = await getBlogPost(String(req.params.id));
  res.json({ post });
});

blogRoutes.post("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const post = await createBlogPost(blogSchema.parse(req.body));
  res.status(201).json({ post });
});

blogRoutes.patch("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const post = await updateBlogPost(String(req.params.id), blogSchema.partial().parse(req.body));
  res.json({ post });
});

blogRoutes.delete("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await deleteBlogPost(String(req.params.id));
  res.status(204).send();
});
