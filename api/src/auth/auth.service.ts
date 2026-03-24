import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, UserRole } from "../user/user.model";
import { userRepository } from "../user/user.repository";
import { refreshTokenRepository } from "./refreshToken.repository";
import { randomBytes } from "crypto";

interface JWTPayload {
  id: number;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export class AuthService {
  private readonly JWT_SECRET: string =
    process.env.JWT_SECRET || "your-secret-key";
  private readonly JWT_EXPIRY: string = process.env.JWT_EXPIRY || "1h";
  private readonly REFRESH_TOKEN_EXPIRY: number = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  constructor(
    private repository: typeof userRepository,
    private tokenRepository?: typeof refreshTokenRepository,
  ) {
    // If not provided, use the default
    if (!this.tokenRepository) {
      this.tokenRepository = refreshTokenRepository;
    }
  }

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRY,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString("hex");
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

    // Generate tokens
    const token = this.generateToken({
      id: newUser.Id as number,
      role: newUser.Role,
    });

    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY);

    await this.tokenRepository!.createSession(
      newUser.Id as number,
      refreshToken,
      expiresAt,
    );

    return {
      token,
      refreshToken,
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

    // Generate tokens
    const token = this.generateToken({
      id: user.Id as number,
      role: user.Role,
    });

    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY);

    await this.tokenRepository!.createSession(
      user.Id as number,
      refreshToken,
      expiresAt,
    );

    return {
      token,
      refreshToken,
      user,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
    // Validate refresh token exists and is not revoked
    const isValid = await this.tokenRepository!.isSessionValid(refreshToken);

    if (!isValid) {
      throw new Error("Invalid or expired refresh token");
    }

    const session = await this.tokenRepository!.getSession(refreshToken);

    if (!session) {
      throw new Error("Refresh token not found");
    }

    // Generate new access token
    const token = this.generateToken({
      id: session.user.id,
      role: session.user.Role as UserRole,
    });

    // Optionally rotate refresh token
    const newRefreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY);

    // Revoke old refresh token
    await this.tokenRepository!.revokeSession(refreshToken);

    // Create new refresh token session
    await this.tokenRepository!.createSession(
      session.userId,
      newRefreshToken,
      expiresAt,
    );

    return {
      token,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Revoke the refresh token
    await this.tokenRepository!.revokeSession(refreshToken);
  }

  async logoutAll(userId: number): Promise<void> {
    // Revoke all refresh tokens for this user
    await this.tokenRepository!.revokeAllUserSessions(userId);
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
