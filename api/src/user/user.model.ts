import { z } from "zod";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export type User = {
  Id: Number;
  Name: string;
  email: string;
  Password: string;
  Role: UserRole;
};

// DTOs
export const userCreateDto = z.object({
  Name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
  Role: z.nativeEnum(UserRole).default(UserRole.USER),
});

export const userUpdateDto = z.object({
  Id: z.number().int("Id must be an integer"),
  Name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
  Role: z.nativeEnum(UserRole).optional(),
});

export type UserCreateDto = z.infer<typeof userCreateDto>;
export type UserUpdateDto = z.infer<typeof userUpdateDto>;

// Validator functions
export const validateUserCreate = (data: unknown) => {
  return userCreateDto.parse(data);
};

export const validateUserUpdate = (data: unknown) => {
  return userUpdateDto.parse(data);
};
