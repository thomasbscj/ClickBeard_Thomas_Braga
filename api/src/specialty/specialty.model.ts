import { z } from "zod";

export type Specialty = {
  name: string;
  description: string;
};

export const specialtyCreateDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const specialtyUpdateDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export type SpecialtyCreateDto = z.infer<typeof specialtyCreateDto>;
export type SpecialtyUpdateDto = z.infer<typeof specialtyUpdateDto>;

export const validateSpecialtyCreate = (data: unknown) => {
  return specialtyCreateDto.parse(data);
};

export const validateSpecialtyUpdate = (data: unknown) => {
  return specialtyUpdateDto.parse(data);
};
