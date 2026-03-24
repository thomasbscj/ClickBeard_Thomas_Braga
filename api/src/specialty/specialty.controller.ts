import { Router, Request, Response } from "express";
import { specialtyService } from "./specialty.service";
import {
  Specialty,
  validateSpecialtyCreate,
  validateSpecialtyUpdate,
} from "./specialty.model";
import {
  handleValidationError,
  handleNotFoundError,
} from "../utils/errorHandler";
import { parseStringParam } from "../utils/paramParser";
import { adminMiddleware } from "../middleware/adminMiddleware";

export const specialtyRouter = Router();

specialtyRouter.get("/:name", async (req: Request, res: Response) => {
  try {
    const name = parseStringParam(req.params.name);
    const specialty = await specialtyService.getSpecialtyByName(name);
    res.status(200).json(specialty);
  } catch (error) {
    if (handleNotFoundError(error, res, "Specialty")) return;
    console.error("Error fetching specialty:", error);
    res.status(500).json({ error: "Failed to get specialty" });
  }
});

specialtyRouter.get("/", async (req: Request, res: Response) => {
  try {
    const specialties = await specialtyService.getAllSpecialties();
    res.status(200).json(specialties);
  } catch (error) {
    console.error("Error fetching specialties:", error);
    res.status(500).json({ error: "Failed to get specialties" });
  }
});


specialtyRouter.use(adminMiddleware)
specialtyRouter.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = validateSpecialtyCreate(req.body);
    const specialty = await specialtyService.createSpecialty(
      validatedData as Specialty,
    );
    res.status(201).json(specialty);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error creating specialty:", error);
    res.status(500).json({ error: "Failed to create specialty" });
  }
});

specialtyRouter.put("/:name", async (req: Request, res: Response) => {
  try {
    const name = parseStringParam(req.params.name);
    const validatedData = validateSpecialtyUpdate({
      name: name,
      ...req.body,
    });
    const specialty = await specialtyService.updateSpecialty(
      validatedData as Specialty,
    );
    res.status(200).json(specialty);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error updating specialty:", error);
    res.status(500).json({ error: "Failed to update specialty" });
  }
});

specialtyRouter.delete("/:name", async (req: Request, res: Response) => {
  try {
    const name = parseStringParam(req.params.name);
    await specialtyService.deleteSpecialtyByName(name);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting specialty:", error);
    res.status(500).json({ error: "Failed to delete specialty" });
  }
});
