import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(["PG", "GIRLS_PG", "BOYS_PG", "ROOM", "FLAT", "HOMESTAY", "HOSTEL"]),
  rentMonthly: z.number().int().positive(),
  tokenAmount: z.number().int().positive(),
  locality: z.string().min(2),
  city: z.string().default("Guwahati")
});
