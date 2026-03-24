import { User } from "./user.model";
import { id, PaginationParams, PaginatedResponse } from "../types/types";
import { db } from "../repository/repository";

export interface IUserRepository {
  createUser(user: User): Promise<any>;
  getUserById(id: id): Promise<User>;
  getAllUsers(pagination?: PaginationParams): Promise<PaginatedResponse<User>>;
  updateUser(user: User): Promise<User>;
  deleteUserById(id: id): Promise<any>;
}

class UserRepository implements IUserRepository {
  constructor() {}
  async createUser(user: User): Promise<any> {
    return db.user.create({
      data: {
        name: user.Name,
        email: user.email,
        credential: user.Password,
        Role: user.Role,
      },
    });
  }
  async getUserById(id: id): Promise<User> {
    const user = await db.user.findFirst({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      Id: user.id,
      Name: user.name,
      email: user.email,
      Password: user.credential,
      Role: user.Role as any,
    };
  }
  async getAllUsers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<User>> {
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip: offset,
        take: limit,
      }),
      db.user.count(),
    ]);

    return {
      data: users.map((user) => ({
        Id: user.id,
        Name: user.name,
        email: user.email,
        Password: user.credential,
        Role: user.Role as any,
      })),
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }
  async updateUser(user: User): Promise<User> {
    const updatedUser = await db.user.update({
      where: {
        id: user.Id as number,
      },
      data: {
        name: user.Name,
        email: user.email,
        credential: user.Password,
        Role: user.Role,
      },
    });

    return {
      Id: updatedUser.id,
      Name: updatedUser.name,
      email: updatedUser.email,
      Password: updatedUser.credential,
      Role: updatedUser.Role as any,
    };
  }
  async deleteUserById(id: id): Promise<any> {
    return db.user.delete({
      where: {
        id: id,
      },
    });
  }
}

export const userRepository = new UserRepository();
