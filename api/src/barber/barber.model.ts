import { z } from "zod";

export type Barber = {
  id: number;
  name: string;
  specialtyId: string;
};

export const barberCreateDto = z.object({
  name: z.string().min(1, "Name is required"),
  specialtyId: z.string().min(1, "SpecialtyId is required"),
});

export const barberUpdateDto = z.object({
  id: z.number().int("Id must be an integer"),
  name: z.string().min(1, "Name is required"),
  specialtyId: z.string().min(1, "SpecialtyId is required"),
});

export type BarberCreateDto = z.infer<typeof barberCreateDto>;
export type BarberUpdateDto = z.infer<typeof barberUpdateDto>;

export const validateBarberCreate = (data: unknown) => {
  return barberCreateDto.parse(data);
};

export const validateBarberUpdate = (data: unknown) => {
  return barberUpdateDto.parse(data);
};
