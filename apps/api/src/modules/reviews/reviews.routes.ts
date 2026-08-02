import { Router } from "express";
import { z } from "zod";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createReview, deleteReview, listAdminReviews, listPublicReviews, updateReviewStatus } from "./reviews.service.js";

export const reviewsRoutes = Router();

const reviewSchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(800),
  source: z.string().trim().max(40).optional()
});

const reviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"])
});

reviewsRoutes.get("/", async (req, res) => {
  const result = await listPublicReviews(req.query);
  res.json(result);
});

reviewsRoutes.post("/", async (req, res) => {
  const review = await createReview(reviewSchema.parse(req.body));
  res.status(201).json({ review });
});

reviewsRoutes.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const result = await listAdminReviews(req.query);
  res.json(result);
});

reviewsRoutes.patch("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = reviewStatusSchema.parse(req.body);
  const review = await updateReviewStatus(String(req.params.id), status);
  res.json({ review });
});

reviewsRoutes.delete("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await deleteReview(String(req.params.id));
  res.status(204).send();
});
