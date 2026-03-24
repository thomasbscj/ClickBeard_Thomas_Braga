import bcrypt from "bcrypt";
import { User } from "./user.model";
import { id } from "../types/types";
import { userRepository } from "./user.repository";
import type { IUserRepository } from "./user.repository";

interface IUserService {
  createUser(user: User): Promise<User>;
  getUserById(id: id): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(user: User): Promise<User>;
  deleteUserById(id: id): Promise<void>;
}

class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async createUser(user: User): Promise<User> {
    const hashedPassword = await this.hashPassword(user.Password);
    return this.userRepository.createUser({
      ...user,
      Password: hashedPassword,
    });
  }

  async getUserById(id: id): Promise<User> {
    return this.userRepository.getUserById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAllUsers();
  }

  async updateUser(user: User): Promise<User> {
    const hashedPassword = await this.hashPassword(user.Password);
    return this.userRepository.updateUser({
      ...user,
      Password: hashedPassword,
    });
  }

  async deleteUserById(id: id): Promise<void> {
    return this.userRepository.deleteUserById(id);
  }
}

export const userService = new UserService(userRepository);
