import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { deleteUploadedPropertyImage, saveUploadedPropertyImage } from "./uploads.service.js";

export const uploadsRoutes = Router();

const propertyImageSchema = z.object({
  propertyId: z.string().min(1),
  url: z.string().url(),
  path: z.string().optional(),
  alt: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional()
});

uploadsRoutes.post("/property-image", authMiddleware, adminMiddleware, async (req, res) => {
  const image = await saveUploadedPropertyImage(propertyImageSchema.parse(req.body));
  res.status(201).json({ image });
});

uploadsRoutes.delete("/property-image/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await deleteUploadedPropertyImage(String(req.params.id));
  res.status(204).send();
});
