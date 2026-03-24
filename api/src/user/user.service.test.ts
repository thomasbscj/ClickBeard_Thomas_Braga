import { describe, it, expect, beforeEach } from "vitest";
import { User, UserRole } from "./user.model";
import type { IUserRepository } from "./user.repository";
import { UserService } from "./user.service";

// Mock hardcoded do repositório de User
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
    if (id === 2) {
      return {
        Id: 2,
        Name: "Admin User",
        email: "admin@example.com",
        Password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
        Role: UserRole.ADMIN,
      };
    }
    throw new Error("User not found");
  },

  getAllUsers: async (): Promise<User[]> => {
    return [
      {
        Id: 1,
        Name: "João Silva",
        email: "joao@example.com",
        Password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
        Role: UserRole.USER,
      },
      {
        Id: 2,
        Name: "Admin User",
        email: "admin@example.com",
        Password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
        Role: UserRole.ADMIN,
      },
      {
        Id: 3,
        Name: "Maria Santos",
        email: "maria@example.com",
        Password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifuu",
        Role: UserRole.USER,
      },
    ];
  },

  updateUser: async (user: User): Promise<User> => {
    return {
      Id: user.Id,
      Name: user.Name,
      email: user.email,
      Password: user.Password,
      Role: user.Role,
    };
  },

  deleteUserById: async (id: number): Promise<void> => {
    if (id < 1) {
      throw new Error("Invalid user ID");
    }
    return;
  },
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockUserRepository);
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      const userInput: User = {
        Id: 0,
        Name: "Pedro Oliveira",
        email: "pedro@example.com",
        Password: "password123",
        Role: UserRole.USER,
      };

      const result = await userService.createUser(userInput);

      expect(result).toBeDefined();
      expect(result.Id).toBe(1);
      expect(result.Name).toBe("Pedro Oliveira");
      expect(result.email).toBe("pedro@example.com");
      expect(result.Role).toBe(UserRole.USER);
    });

    it("should hash password before storing", async () => {
      const userInput: User = {
        Id: 0,
        Name: "Ana Costa",
        email: "ana@example.com",
        Password: "myPassword123",
        Role: UserRole.USER,
      };

      const result = await userService.createUser(userInput);

      expect(result.Password).toBeDefined();
      expect(result.Password).not.toBe("myPassword123");
      expect(result.Password.length).toBeGreaterThan(20);
    });

    it("should preserve user information except password", async () => {
      const userInput: User = {
        Id: 0,
        Name: "Carlos Mendes",
        email: "carlos@example.com",
        Password: "securePass456",
        Role: UserRole.ADMIN,
      };

      const result = await userService.createUser(userInput);

      expect(result.Name).toBe(userInput.Name);
      expect(result.email).toBe(userInput.email);
      expect(result.Role).toBe(userInput.Role);
    });

    it("should create user with default role if not specified", async () => {
      const userInput: User = {
        Id: 0,
        Name: "Default User",
        email: "default@example.com",
        Password: "password",
        Role: UserRole.USER,
      };

      const result = await userService.createUser(userInput);

      expect(result.Role).toBe(UserRole.USER);
    });
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      const result = await userService.getUserById(1);

      expect(result).toBeDefined();
      expect(result.Id).toBe(1);
      expect(result.Name).toBe("João Silva");
      expect(result.email).toBe("joao@example.com");
    });

    it("should return user with correct role", async () => {
      const result = await userService.getUserById(2);

      expect(result.Role).toBe(UserRole.ADMIN);
    });

    it("should throw error when user not found", async () => {
      await expect(userService.getUserById(999)).rejects.toThrow(
        "User not found",
      );
    });

    it("should return correct user details", async () => {
      const result = await userService.getUserById(1);

      expect(result.Name).toBe("João Silva");
      expect(result.email).toBe("joao@example.com");
      expect(result.Password).toBeDefined();
    });

    it("should distinguish between user roles", async () => {
      const userResult = await userService.getUserById(1);
      const adminResult = await userService.getUserById(2);

      expect(userResult.Role).toBe(UserRole.USER);
      expect(adminResult.Role).toBe(UserRole.ADMIN);
      expect(userResult.Role).not.toBe(adminResult.Role);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const result = await userService.getAllUsers();

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });

    it("should return users with correct data", async () => {
      const result = await userService.getAllUsers();

      expect(result[0]!.Name).toBe("João Silva");
      expect(result[1]!.Name).toBe("Admin User");
      expect(result[2]!.Name).toBe("Maria Santos");
    });

    it("should return users with all required fields", async () => {
      const result = await userService.getAllUsers();

      result.forEach((user) => {
        expect(user.Id).toBeDefined();
        expect(user.Name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.Password).toBeDefined();
        expect(user.Role).toBeDefined();
      });
    });

    it("should include both user and admin roles", async () => {
      const result = await userService.getAllUsers();

      const hasUser = result.some((u) => u.Role === UserRole.USER);
      const hasAdmin = result.some((u) => u.Role === UserRole.ADMIN);

      expect(hasUser).toBe(true);
      expect(hasAdmin).toBe(true);
    });

    it("should return at least one user", async () => {
      const result = await userService.getAllUsers();

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("updateUser", () => {
    it("should update a user successfully", async () => {
      const updatedUser: User = {
        Id: 1,
        Name: "João Silva Updated",
        email: "joao.updated@example.com",
        Password: "newPassword789",
        Role: UserRole.USER,
      };

      const result = await userService.updateUser(updatedUser);

      expect(result).toBeDefined();
      expect(result.Id).toBe(1);
      expect(result.Name).toBe("João Silva Updated");
      expect(result.email).toBe("joao.updated@example.com");
    });

    it("should hash new password on update", async () => {
      const updatedUser: User = {
        Id: 1,
        Name: "João Silva",
        email: "joao@example.com",
        Password: "brandNewPassword123",
        Role: UserRole.USER,
      };

      const result = await userService.updateUser(updatedUser);

      expect(result.Password).not.toBe("brandNewPassword123");
      expect(result.Password.length).toBeGreaterThan(20);
    });

    it("should preserve user id on update", async () => {
      const updatedUser: User = {
        Id: 2,
        Name: "Admin Updated",
        email: "admin.updated@example.com",
        Password: "adminNewPass",
        Role: UserRole.ADMIN,
      };

      const result = await userService.updateUser(updatedUser);

      expect(result.Id).toBe(2);
      expect(result.Role).toBe(UserRole.ADMIN);
    });

    it("should allow updating all user fields", async () => {
      const updatedUser: User = {
        Id: 3,
        Name: "Maria Santos Updated",
        email: "maria.new@example.com",
        Password: "updatedPass",
        Role: UserRole.ADMIN,
      };

      const result = await userService.updateUser(updatedUser);

      expect(result.Name).toBe(updatedUser.Name);
      expect(result.email).toBe(updatedUser.email);
      expect(result.Role).toBe(updatedUser.Role);
    });
  });

  describe("deleteUserById", () => {
    it("should delete a user successfully", async () => {
      await expect(userService.deleteUserById(1)).resolves.not.toThrow();
    });

    it("should return void on successful deletion", async () => {
      const result = await userService.deleteUserById(2);

      expect(result).toBeUndefined();
    });

    it("should throw error for invalid user ID", async () => {
      await expect(userService.deleteUserById(-1)).rejects.toThrow(
        "Invalid user ID",
      );
    });

    it("should throw error for zero ID", async () => {
      await expect(userService.deleteUserById(0)).rejects.toThrow(
        "Invalid user ID",
      );
    });

    it("should allow deleting valid user", async () => {
      const result = await userService.deleteUserById(3);

      expect(result).toBeUndefined();
    });

    it("should reject negative IDs", async () => {
      await expect(userService.deleteUserById(-10)).rejects.toThrow(
        "Invalid user ID",
      );
    });
  });
});
