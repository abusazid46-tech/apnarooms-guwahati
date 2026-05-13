import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { createLead, deleteLead, getLead, listAdminLeads, updateLead } from "./leads.service.js";

export const leadsRoutes = Router();

const leadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  propertyId: z.string().optional()
});

const leadUpdateSchema = leadSchema.extend({
  status: z.enum(["NEW", "CONTACTED", "VISIT_SCHEDULED", "VISIT_COMPLETED", "NEGOTIATION", "TOKEN_PAID", "MOVED_IN", "LOST"]).optional(),
  assignedToId: z.string().nullable().optional()
});

leadsRoutes.post("/", async (req, res) => {
  const lead = await createLead(leadSchema.parse(req.body));
  res.status(201).json({ lead });
});

leadsRoutes.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const result = await listAdminLeads(req.query);
  res.json(result);
});

leadsRoutes.get("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const lead = await getLead(String(req.params.id));
  res.json({ lead });
});

leadsRoutes.patch("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const lead = await updateLead(String(req.params.id), leadUpdateSchema.parse(req.body));
  res.json({ lead });
});

leadsRoutes.delete("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await deleteLead(String(req.params.id));
  res.status(204).send();
});
