import bcrypt from "bcrypt";
import { User, UserSecure } from "./user.model";
import { id, PaginationParams, PaginatedResponse } from "../types/types";
import { userRepository } from "./user.repository";
import type { IUserRepository } from "./user.repository";
const SALT_ROUNDS = 13;
interface IUserService {
  createUser(user: User): Promise<UserSecure>;
  getUserById(id: id): Promise<UserSecure>;
  getAllUsers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<UserSecure>>;
  updateUser(user: User): Promise<UserSecure>;
  deleteUserById(id: id): Promise<void>;
}

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private removePassword(user: User): UserSecure {
    const { Password, ...userSecure } = user;
    return userSecure as UserSecure;
  }

  async createUser(user: User): Promise<UserSecure> {
    const hashedPassword = await this.hashPassword(user.Password);
    const createdUser = await this.userRepository.createUser({
      ...user,
      Password: hashedPassword,
    });
    return this.removePassword(createdUser);
  }

  async getUserById(id: id): Promise<UserSecure> {
    const user = await this.userRepository.getUserById(id);
    return this.removePassword(user);
  }

  async getAllUsers(
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<UserSecure>> {
    const result = await this.userRepository.getAllUsers(pagination);
    return {
      ...result,
      data: result.data.map((user) => this.removePassword(user)),
    };
  }

  async updateUser(user: User): Promise<UserSecure> {
    const hashedPassword = await this.hashPassword(user.Password);
    const updatedUser = await this.userRepository.updateUser({
      ...user,
      Password: hashedPassword,
    });
    return this.removePassword(updatedUser);
  }

  async deleteUserById(id: id): Promise<void> {
    return this.userRepository.deleteUserById(id);
  }
}

export const userService = new UserService(userRepository);
