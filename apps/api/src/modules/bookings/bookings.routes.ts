import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { createBooking, listMyBookings } from "./bookings.service.js";

export const bookingsRoutes = Router();

bookingsRoutes.post("/", authMiddleware, async (req, res) => {
  const booking = await createBooking(res.locals.firebaseUser.uid, req.body.propertyId);
  res.status(201).json({ booking });
});

bookingsRoutes.get("/me", authMiddleware, async (_req, res) => {
  const bookings = await listMyBookings(res.locals.firebaseUser.uid);
  res.json({ bookings });
});

bookingsRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  res.json({ bookings: [] });
});
