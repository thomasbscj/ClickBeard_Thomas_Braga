import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import { UserRole } from "../user/user.model";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (authenticatedReq.user.role !== UserRole.ADMIN) {
      res
        .status(403)
        .json({ error: "Forbidden: Administrator access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(403).json({ error: "Forbidden" });
  }
};
