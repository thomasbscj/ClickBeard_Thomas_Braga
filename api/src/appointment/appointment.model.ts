import { z } from "zod";

export type Appointment = {
  id: number;
  userId: number;
  barberId: number;
  datetime: Date;
};

export const appointmentCreateDto = z.object({
  userId: z.number().int("UserId must be an integer"),
  barberId: z.number().int("BarberId must be an integer"),
  datetime: z.string().datetime("Invalid datetime format"),
});

export const appointmentUpdateDto = z.object({
  id: z.number().int("Id must be an integer"),
  userId: z.number().int("UserId must be an integer"),
  barberId: z.number().int("BarberId must be an integer"),
  datetime: z.string().datetime("Invalid datetime format"),
});

export type AppointmentCreateDto = z.infer<typeof appointmentCreateDto>;
export type AppointmentUpdateDto = z.infer<typeof appointmentUpdateDto>;

export const validateAppointmentCreate = (data: unknown) => {
  return appointmentCreateDto.parse(data);
};

export const validateAppointmentUpdate = (data: unknown) => {
  return appointmentUpdateDto.parse(data);
};
