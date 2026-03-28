import { Router, Request, Response } from "express";
import { authService } from "./auth.service";
import {
  validateLogin,
  validateRegister,
  validateRefreshToken,
} from "./auth.model";
import { handleValidationError } from "../utils/errorHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { UserRole } from "../user/user.model";

const NODE_ENV = process.env.NODE_ENV || "development";

// Secure cookie options
const secureCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax" as const,
  path: "/",
};

const accessTokenCookieOptions = {
  ...secureCookieOptions,
  maxAge: 60 * 60 * 1000, // 1 hour
};

const refreshTokenCookieOptions = {
  ...secureCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authRouter = Router();

// Login route
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const validatedData = validateLogin(req.body);
    const authResponse = await authService.login(
      validatedData.email,
      validatedData.password,
    );

    // Set tokens as secure HttpOnly cookies
    res.cookie("accessToken", authResponse.token, accessTokenCookieOptions);
    res.cookie(
      "refreshToken",
      authResponse.refreshToken,
      refreshTokenCookieOptions,
    );

    res.status(200).json({
      message: "Login successful",
      user: authResponse.user,
    });
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
// Note: This endpoint only creates a new user without logging in
// Users must use the /login endpoint to obtain authentication tokens
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = validateRegister(req.body);
    const registerResponse = await authService.register({
      Id: 0,
      Name: validatedData.name,
      email: validatedData.email,
      Password: validatedData.password,
      Role: UserRole.USER,
    } as any);
    res.status(201).json(registerResponse);
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

    // Update cookies with new tokens
    res.cookie("accessToken", response.token, accessTokenCookieOptions);
    res.cookie(
      "refreshToken",
      response.refreshToken,
      refreshTokenCookieOptions,
    );

    res.status(200).json({
      message: "Token refreshed successfully",
    });
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

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

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

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res
        .status(200)
        .json({ message: "Logged out from all sessions successfully" });
    } catch (error) {
      console.error("Error logging out from all sessions:", error);
      res.status(500).json({ error: "Failed to logout from all sessions" });
    }
  },
);
