import { db } from "../repository/repository";
import { createHash } from "crypto";

class RefreshTokenRepository {
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async createSession(userId: number, token: string, expiresAt: Date) {
    const hashedToken = this.hashToken(token);
    return await db.refreshTokenSession.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  async getSession(token: string) {
    const hashedToken = this.hashToken(token);
    return await db.refreshTokenSession.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });
  }

  async revokeSession(token: string) {
    const hashedToken = this.hashToken(token);
    return await db.refreshTokenSession.update({
      where: { token: hashedToken },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: number) {
    return await db.refreshTokenSession.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpiredSessions() {
    return await db.refreshTokenSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async isSessionValid(token: string): Promise<boolean> {
    const session = await this.getSession(token);

    if (!session) {
      return false;
    }

    if (session.revokedAt) {
      return false;
    }

    if (session.expiresAt < new Date()) {
      return false;
    }

    return true;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
