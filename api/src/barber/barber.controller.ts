import { Router, Request, Response } from "express";
import { barberService } from "./barber.service";
import {
  Barber,
  validateBarberCreate,
  validateBarberUpdate,
} from "./barber.model";
import {
  handleValidationError,
  handleNotFoundError,
} from "../utils/errorHandler";
import { parseIntParam } from "../utils/paramParser";
import { adminMiddleware } from "../middleware/adminMiddleware";

export const barberRouter = Router();


// Get Barber by ID
barberRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    const barber = await barberService.getBarberById(id);
    res.status(200).json(barber);
  } catch (error) {
    if (handleNotFoundError(error, res, "Barber")) return;
    console.error("Error fetching barber:", error);
    res.status(500).json({ error: "Failed to get barber" });
  }
});

// Get All Barbers
barberRouter.get("/", async (req: Request, res: Response) => {
  try {
    const barbers = await barberService.getAllBarbers();
    res.status(200).json(barbers);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    res.status(500).json({ error: "Failed to get barbers" });
  }
});

barberRouter.use(adminMiddleware)
barberRouter.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = validateBarberCreate(req.body);
    const barber = await barberService.createBarber({
      name: validatedData.name,
      specialtyId: validatedData.specialtyId,
      bornAt: validatedData.bornAt,
      hiredAt: new Date(validatedData.hiredAt),
    });
    res.status(201).json(barber);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error creating barber:", error);
    res.status(500).json({ error: "Failed to create barber" });
  }
});


// Update Barber
barberRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    const validatedData = validateBarberUpdate({
      id: id,
      ...req.body,
    });
    const barber = await barberService.updateBarber({
      ...validatedData,
      hiredAt: new Date(validatedData.hiredAt),
    });
    res.status(200).json(barber);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error updating barber:", error);
    res.status(500).json({ error: "Failed to update barber" });
  }
});

// Delete Barber
barberRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    await barberService.deleteBarberById(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting barber:", error);
    res.status(500).json({ error: "Failed to delete barber" });
  }
});
