import { Request, Response, NextFunction } from "express";
import { authService } from "../auth/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return;
    }
    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);

    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
