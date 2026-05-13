import { Router } from "express";

export const couponsRoutes = Router();

couponsRoutes.get("/", async (_req, res) => {
  res.json({ coupons: [] });
});
