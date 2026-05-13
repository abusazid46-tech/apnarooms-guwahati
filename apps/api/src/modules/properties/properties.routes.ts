import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { createProperty, listProperties } from "./properties.service.js";

export const propertiesRoutes = Router();

propertiesRoutes.get("/", async (req, res) => {
  const properties = await listProperties(req.query);
  res.json({ properties });
});

propertiesRoutes.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const property = await createProperty(req.body);
  res.status(201).json({ property });
});
