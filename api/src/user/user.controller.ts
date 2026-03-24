import { Router, Request, Response } from "express";
import { userService } from "./user.service";
import { User, validateUserCreate, validateUserUpdate } from "./user.model";
import {
  handleValidationError,
  handleNotFoundError,
} from "../utils/errorHandler";
import { parseIntParam } from "../utils/paramParser";
import { adminMiddleware } from "../middleware/adminMiddleware";

export const userRouter = Router();

userRouter.use(adminMiddleware)

userRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    if (handleNotFoundError(error, res, "User")) return;
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

userRouter.get("/", async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

userRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    const validatedData = validateUserUpdate({
      Id: id,
      ...req.body,
    });
    const user = await userService.updateUser(validatedData as User);
    res.status(200).json(user);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

userRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    await userService.deleteUserById(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});
