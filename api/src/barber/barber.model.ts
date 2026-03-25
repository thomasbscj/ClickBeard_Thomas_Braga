import { z } from "zod";

export type BusyTime = {
  start: Date;
  end: Date;
};

export type Barber = {
  id: number;
  name: string;
  specialties: string[]; // Array de nomes de especialidades
  bornAt: number;
  hiredAt: Date;
  busyTimes?: BusyTime[]; // Array de horários em que o barbeiro está ocupado
};

export type BarberCreateInput = Omit<Barber, "id">;

export const barberCreateDto = z.object({
  name: z.string().min(1, "Name is required"),
  specialties: z
    .array(z.string().min(1, "Specialty name is required"))
    .min(1, "At least one specialty is required"),
  bornAt: z
    .number()
    .int("Birth year must be an integer")
    .positive("Birth year must be positive"),
  hiredAt: z.iso.datetime({ message: "Invalid hire date format" }),
});

export const barberUpdateDto = z.object({
  id: z.number().int("Id must be an integer"),
  name: z.string().min(1, "Name is required"),
  specialties: z
    .array(z.string().min(1, "Specialty name is required"))
    .min(1, "At least one specialty is required"),
  bornAt: z
    .number()
    .int("Birth year must be an integer")
    .positive("Birth year must be positive"),
  hiredAt: z.iso.datetime({ message: "Invalid hire date format" }),
});

export type BarberCreateDto = z.infer<typeof barberCreateDto>;
export type BarberUpdateDto = z.infer<typeof barberUpdateDto>;

export const validateBarberCreate = (data: unknown): BarberCreateDto => {
  return barberCreateDto.parse(data);
};

export const validateBarberUpdate = (data: unknown): BarberUpdateDto => {
  return barberUpdateDto.parse(data);
};
