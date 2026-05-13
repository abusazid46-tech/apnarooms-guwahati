import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
}
