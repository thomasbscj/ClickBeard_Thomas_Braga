import { z } from "zod";

export const loginDto = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerDto = z.object({
  Name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
});

export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type LoginDto = z.infer<typeof loginDto>;
export type RegisterDto = z.infer<typeof registerDto>;
export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;

export const validateLogin = (data: unknown) => {
  return loginDto.parse(data);
};

export const validateRegister = (data: unknown) => {
  return registerDto.parse(data);
};

export const validateRefreshToken = (data: unknown) => {
  return refreshTokenDto.parse(data);
};
