import { Response } from "express";
import { z } from "zod";

export const handleValidationError = (error: unknown, res: Response) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  return null;
};

export const handleNotFoundError = (
  error: unknown,
  res: Response,
  entity: string,
) => {
  if (error instanceof Error && error.message === `${entity} not found`) {
    return res.status(404).json({ error: `${entity} not found` });
  }
  return null;
};
