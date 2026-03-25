import { describe, it, expect, beforeEach } from "vitest";
import { User, UserRole } from "../user/user.model";
import type { IUserRepository } from "../user/user.repository";
import { PaginatedResponse } from "../types/types";
import { AuthService } from "./auth.service";
import { createHash } from "crypto";

// Helper to hash token like the repository does
const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

// Mock hardcoded do repositório de User para Auth
const mockUserRepository: IUserRepository = {
  createUser: async (user: User): Promise<User> => {
    return {
      Id: 1,
      Name: user.Name,
      email: user.email,
      Password: user.Password,
      Role: user.Role || UserRole.USER,
    };
  },

  getUserById: async (id: number): Promise<User> => {
    if (id === 1) {
      return {
        Id: 1,
        Name: "João Silva",
        email: "joao@example.com",
        Password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
        Role: UserRole.USER,
      };
    }
    throw new Error("User not found");
  },

  getAllUsers: async (): Promise<PaginatedResponse<User>> => {
    return {
      data: [
        {
          Id: 1,
          Name: "João Silva",
          email: "joao@example.com",
          Password:
            "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
          Role: UserRole.USER,
        },
        {
          Id: 2,
          Name: "Admin User",
          email: "admin@example.com",
          Password:
            "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
          Role: UserRole.ADMIN,
        },
      ],
      pagination: { limit: 10, offset: 0, total: 2 },
    };
  },

  updateUser: async (user: User): Promise<User> => {
    return user;
  },

  deleteUserById: async (id: number): Promise<void> => {
    return;
  },
};

// Mock hardcoded do refreshTokenRepository
const mockRefreshTokenRepository = {
  createSession: async (
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> => {
    return;
  },

  isSessionValid: async (refreshToken: string): Promise<boolean> => {
    // Valid token is hashed
    const hashedValid = hashToken("valid-refresh-token");
    return hashToken(refreshToken) === hashedValid;
  },

  getSession: async (refreshToken: string) => {
    const hashedValid = hashToken("valid-refresh-token");
    if (hashToken(refreshToken) === hashedValid) {
      return {
        userId: 1,
        refreshToken: hashedValid,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: {
          id: 1,
          Name: "João Silva",
          email: "joao@example.com",
          Role: UserRole.USER,
        },
      };
    }
    return null;
  },

  revokeSession: async (refreshToken: string): Promise<void> => {
    return;
  },

  revokeAllUserSessions: async (userId: number): Promise<void> => {
    return;
  },
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    // Inject both mock repositories
    authService = new AuthService(
      mockUserRepository,
      mockRefreshTokenRepository as any,
    );
  });

  describe("register", () => {
    it("should throw error if user already exists", async () => {
      const userInput: User = {
        Id: 0,
        Name: "João Silva",
        email: "joao@example.com",
        Password: "password123",
        Role: UserRole.USER,
      };

      await expect(authService.register(userInput)).rejects.toThrow(
        "User with this email already exists",
      );
    });

    it("should return only message and email on successful registration", async () => {
      const userInput: User = {
        Id: 0,
        Name: "New User",
        email: "newuser@example.com",
        Password: "password123",
        Role: UserRole.ADMIN,
      };

      const result = await authService.register(userInput);

      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("email");
      expect(result).not.toHaveProperty("token");
      expect(result).not.toHaveProperty("refreshToken");
      expect(result).not.toHaveProperty("user");
    });

    it("should return correct email in response", async () => {
      const userInput: User = {
        Id: 0,
        Name: "Test User",
        email: "testuser@example.com",
        Password: "password123",
        Role: UserRole.USER,
      };

      const result = await authService.register(userInput);

      expect(result.email).toBe("testuser@example.com");
      expect(result.message).toBe("User registered successfully");
    });
  });

  describe("login", () => {
    it("should throw error with wrong email", async () => {
      await expect(
        authService.login("nonexistent@example.com", "password"),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error with wrong password", async () => {
      await expect(
        authService.login("joao@example.com", "wrongpassword"),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("refreshAccessToken", () => {
    it("should throw error with invalid refresh token", async () => {
      await expect(
        authService.refreshAccessToken(
          "invalid-refresh-token-that-does-not-exist",
        ),
      ).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should validate refresh token before processing", async () => {
      await expect(
        authService.refreshAccessToken("wrong-token"),
      ).rejects.toThrow("Invalid or expired refresh token");
    });
  });

  describe("logout", () => {
    it("should return void on logout", async () => {
      const result = await authService.logout("some-refresh-token");

      expect(result).toBeUndefined();
    });

    it("should handle logout with valid token", async () => {
      const result = await authService.logout("valid-refresh-token");

      expect(result).toBeUndefined();
    });
  });

  describe("logoutAll", () => {
    it("should return void on logoutAll", async () => {
      const result = await authService.logoutAll(1);

      expect(result).toBeUndefined();
    });

    it("should handle logoutAll for multiple users", async () => {
      const result = await authService.logoutAll(2);

      expect(result).toBeUndefined();
    });
  });

  describe("verifyToken", () => {
    it("should throw error for invalid token", () => {
      expect(() => {
        authService.verifyToken("invalid-token");
      }).toThrow();
    });

    it("should throw error for malformed token", () => {
      expect(() => {
        authService.verifyToken("token.without.proper.format");
      }).toThrow();
    });

    it("should throw error for expired token", () => {
      // Create an expired token
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InVzZXIiLCJleHAiOjE2NDY2NzE3Nn0.test";

      expect(() => {
        authService.verifyToken(expiredToken);
      }).toThrow();
    });
  });
});
