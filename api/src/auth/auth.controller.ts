import { Router, Request, Response } from "express";
import { authService } from "./auth.service";
import {
  validateLogin,
  validateRegister,
  validateRefreshToken,
} from "./auth.model";
import { handleValidationError } from "../utils/errorHandler";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRouter = Router();

// Login route
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const validatedData = validateLogin(req.body);
    const authResponse = await authService.login(
      validatedData.email,
      validatedData.password,
    );
    res.status(200).json(authResponse);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    if (
      error instanceof Error &&
      error.message.includes("Invalid email or password")
    ) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Register route
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = validateRegister(req.body);
    const authResponse = await authService.register(validatedData as any);
    res.status(201).json(authResponse);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    if (error instanceof Error && error.message.includes("already exists")) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
    }
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Refresh token route
authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const validatedData = validateRefreshToken(req.body);
    const response = await authService.refreshAccessToken(
      validatedData.refreshToken,
    );
    res.status(200).json(response);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    if (
      error instanceof Error &&
      error.message.includes("Invalid or expired refresh token")
    ) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Logout route
authRouter.post(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const validatedData = validateRefreshToken(req.body);
      await authService.logout(validatedData.refreshToken);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      if (handleValidationError(error, res)) return;
      console.error("Error logging out:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  },
);

// Logout all sessions route
authRouter.post(
  "/logout-all",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      await authService.logoutAll(userId);
      res
        .status(200)
        .json({ message: "Logged out from all sessions successfully" });
    } catch (error) {
      console.error("Error logging out from all sessions:", error);
      res.status(500).json({ error: "Failed to logout from all sessions" });
    }
  },
);
