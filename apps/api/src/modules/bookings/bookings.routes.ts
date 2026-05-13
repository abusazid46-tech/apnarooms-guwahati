import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import {
  createBooking,
  getBooking,
  listAdminBookings,
  listMyBookings,
  updateBookingStatus
} from "./bookings.service.js";

export const bookingsRoutes = Router();

const createBookingSchema = z.object({
  propertyId: z.string().min(1),
  couponCode: z.string().optional(),
  moveInDate: z.coerce.date().optional()
});

const updateBookingSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "REFUNDED"]),
  moveInDate: z.coerce.date().optional()
});

bookingsRoutes.post("/", authMiddleware, async (req, res) => {
  const booking = await createBooking(res.locals.firebaseUser.uid, createBookingSchema.parse(req.body));
  res.status(201).json({ booking });
});

bookingsRoutes.get("/me", authMiddleware, async (_req, res) => {
  const bookings = await listMyBookings(res.locals.firebaseUser.uid);
  res.json({ bookings });
});

bookingsRoutes.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const result = await listAdminBookings(req.query);
  res.json(result);
});

bookingsRoutes.get("/:id", authMiddleware, async (req, res) => {
  const booking = await getBooking(res.locals.firebaseUser.uid, String(req.params.id));
  res.json({ booking });
});

bookingsRoutes.patch("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const booking = await updateBookingStatus(String(req.params.id), updateBookingSchema.parse(req.body));
  res.json({ booking });
});
