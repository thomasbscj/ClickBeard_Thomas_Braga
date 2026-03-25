import { z } from "zod";

export type Barber = {
  id: number;
  name: string;
  specialtyId: string;
  bornAt: number;
  hiredAt: Date;
};

export type BarberCreateInput = Omit<Barber, "id">;

export const barberCreateDto = z.object({
  name: z.string().min(1, "Name is required"),
  specialtyId: z.string().min(1, "SpecialtyId is required"),
  bornAt: z
    .number()
    .int("Birth year must be an integer")
    .positive("Birth year must be positive"),
  hiredAt: z.iso.datetime({ message: "Invalid hire date format" }),
});

export const barberUpdateDto = z.object({
  id: z.number().int("Id must be an integer"),
  name: z.string().min(1, "Name is required"),
  specialtyId: z.string().min(1, "SpecialtyId is required"),
  bornAt: z
    .number()
    .int("Birth year must be an integer")
    .positive("Birth year must be positive"),
  hiredAt: z.string().datetime({ message: "Invalid hire date format" }),
});

export type BarberCreateDto = z.infer<typeof barberCreateDto>;
export type BarberUpdateDto = z.infer<typeof barberUpdateDto>;

export const validateBarberCreate = (data: unknown): BarberCreateDto => {
  return barberCreateDto.parse(data);
};

export const validateBarberUpdate = (data: unknown): BarberUpdateDto => {
  return barberUpdateDto.parse(data);
};
