import { Router, Request, Response } from "express";
import { authService } from "./auth.service";
import { validateLogin, validateRegister } from "./auth.model";
import { handleValidationError } from "../utils/errorHandler";

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
