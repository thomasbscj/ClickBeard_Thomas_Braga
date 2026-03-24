import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, UserRole } from "../user/user.model";
import { userRepository } from "../user/user.repository";

interface JWTPayload {
  id: number;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private readonly JWT_SECRET: string =
    process.env.JWT_SECRET || "your-secret-key";
  private readonly JWT_EXPIRY: string = process.env.JWT_EXPIRY || "24h";

  constructor(private repository: typeof userRepository) {}

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRY,
    } as jwt.SignOptions);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async register(user: User): Promise<AuthResponse> {
    // Check if user already exists
    const users = await this.repository.getAllUsers();
    const userExists = users.some((u) => u.email === user.email);

    if (userExists) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(user.Password);

    // Create user
    const newUser = await this.repository.createUser({
      ...user,
      Password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken({
      id: newUser.Id as number,
      role: newUser.Role,
    });

    return {
      token,
      user: newUser,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const users = await this.repository.getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(
      password,
      user.Password as string,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = this.generateToken({
      id: user.Id as number,
      role: user.Role,
    });

    return {
      token,
      user,
    };
  }

  verifyToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return payload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export const authService = new AuthService(userRepository);
