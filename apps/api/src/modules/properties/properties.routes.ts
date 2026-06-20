import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import {
  addPropertyImage,
  addOwnerPropertyImage,
  archiveProperty,
  createOwnerProperty,
  createProperty,
  deletePropertyImage,
  getAdminProperty,
  getOwnerProperty,
  getPublicProperty,
  listAdminProperties,
  listOwnerProperties,
  listProperties,
  updateOwnerAvailability,
  updateOwnerProperty,
  updateProperty
} from "./properties.service.js";

export const propertiesRoutes = Router();

const optionalTrimmedString = (schema: z.ZodString) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, schema.optional());

const propertySchema = z.object({
  title: z.string().trim().min(3),
  slug: optionalTrimmedString(z.string().min(3)),
  description: optionalTrimmedString(z.string()),
  category: z.enum(["PG", "HOMESTAY", "FLAT", "ROOM"]),
  status: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]).optional(),
  rentMonthly: z.coerce.number().int().positive(),
  depositAmount: z.coerce.number().int().nonnegative().optional(),
  tokenAmount: z.coerce.number().int().positive(),
  locality: z.string().trim().min(2),
  city: z.string().trim().min(2).default("Guwahati"),
  address: optionalTrimmedString(z.string()),
  ownerName: optionalTrimmedString(z.string().min(1)),
  ownerPhone: optionalTrimmedString(z.string().min(6)),
  ownerEmail: optionalTrimmedString(z.string().email()),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  isVerified: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  amenities: z.array(z.string().min(1)).optional(),
  landlordId: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        path: z.string().optional(),
        alt: z.string().optional(),
        sortOrder: z.coerce.number().int().nonnegative().optional()
      })
    )
    .optional()
});

const propertyUpdateSchema = propertySchema.partial();
const imageSchema = z.object({
  url: z.string().url(),
  path: z.string().optional(),
  alt: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional()
});

propertiesRoutes.get("/", async (req, res) => {
  const result = await listProperties(req.query);
  res.json(result);
});

propertiesRoutes.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const result = await listAdminProperties(req.query);
  res.json(result);
});

propertiesRoutes.get("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const property = await getAdminProperty(String(req.params.id));
  res.json({ property });
});

propertiesRoutes.get("/owner", authMiddleware, async (_req, res) => {
  const properties = await listOwnerProperties(res.locals.firebaseUser.uid);
  res.json({ properties });
});

propertiesRoutes.get("/owner/:id", authMiddleware, async (req, res) => {
  const property = await getOwnerProperty(res.locals.firebaseUser.uid, String(req.params.id));
  res.json({ property });
});

propertiesRoutes.get("/:id", async (req, res) => {
  const property = await getPublicProperty(String(req.params.id));
  res.json({ property });
});

propertiesRoutes.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const property = await createProperty(propertySchema.parse(req.body));
  res.status(201).json({ property });
});

propertiesRoutes.post("/owner", authMiddleware, async (req, res) => {
  const property = await createOwnerProperty(res.locals.firebaseUser.uid, propertySchema.parse(req.body));
  res.status(201).json({ property });
});

propertiesRoutes.patch("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const property = await updateProperty(String(req.params.id), propertyUpdateSchema.parse(req.body));
  res.json({ property });
});

propertiesRoutes.patch("/owner/:id", authMiddleware, async (req, res) => {
  const property = await updateOwnerProperty(res.locals.firebaseUser.uid, String(req.params.id), propertyUpdateSchema.parse(req.body));
  res.json({ property });
});

propertiesRoutes.patch("/owner/:id/availability", authMiddleware, async (req, res) => {
  const input = z.object({ isAvailable: z.boolean() }).parse(req.body);
  const property = await updateOwnerAvailability(res.locals.firebaseUser.uid, String(req.params.id), input.isAvailable);
  res.json({ property });
});

propertiesRoutes.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const property = await archiveProperty(String(req.params.id));
  res.json({ property });
});

propertiesRoutes.post("/:id/images", authMiddleware, adminMiddleware, async (req, res) => {
  const image = await addPropertyImage(String(req.params.id), imageSchema.parse(req.body));
  res.status(201).json({ image });
});

propertiesRoutes.post("/owner/:id/images", authMiddleware, async (req, res) => {
  const image = await addOwnerPropertyImage(res.locals.firebaseUser.uid, String(req.params.id), imageSchema.parse(req.body));
  res.status(201).json({ image });
});

propertiesRoutes.delete("/:id/images/:imageId", authMiddleware, adminMiddleware, async (req, res) => {
  await deletePropertyImage(String(req.params.id), String(req.params.imageId));
  res.status(204).send();
});
