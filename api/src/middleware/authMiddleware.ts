import { Request, Response, NextFunction } from "express";
import { authService } from "../auth/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Try to get token from Authorization header first (for API clients)
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fall back to cookie if header not provided (for browser clients)
    if (!token && (req.cookies as any).accessToken) {
      token = (req.cookies as any).accessToken;
    }

    if (!token) {
      res.status(401).json({
        error: "Missing or invalid authorization header or cookie",
      });
      return;
    }

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
