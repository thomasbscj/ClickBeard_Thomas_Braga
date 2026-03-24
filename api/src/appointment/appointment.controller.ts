import { Router, Request, Response } from "express";
import { appointmentService } from "./appointment.service";
import {
  Appointment,
  validateAppointmentCreate,
  validateAppointmentUpdate,
} from "./appointment.model";
import {
  handleValidationError,
  handleNotFoundError,
} from "../utils/errorHandler";
import { parseIntParam } from "../utils/paramParser";

export const appointmentRouter = Router();

// Create Appointment
appointmentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = validateAppointmentCreate(req.body);
    const appointment = await appointmentService.createAppointment({
      ...validatedData,
      id: 0,
      datetime: new Date(validatedData.datetime),
    } as Appointment);
    res.status(201).json(appointment);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// Get Appointment by ID
appointmentRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    const appointment = await appointmentService.getAppointmentById(id);
    res.status(200).json(appointment);
  } catch (error) {
    if (handleNotFoundError(error, res, "Appointment")) return;
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
});

// Get All Appointments
appointmentRouter.get("/", async (req: Request, res: Response) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});

// Update Appointment
appointmentRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    const validatedData = validateAppointmentUpdate({
      id: id,
      ...req.body,
    });
    const appointment = await appointmentService.updateAppointment({
      ...validatedData,
      datetime: new Date(validatedData.datetime),
    } as Appointment);
    res.status(200).json(appointment);
  } catch (error) {
    if (handleValidationError(error, res)) return;
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Delete Appointment
appointmentRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntParam(req.params.id);
    await appointmentService.deleteAppointmentById(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});
