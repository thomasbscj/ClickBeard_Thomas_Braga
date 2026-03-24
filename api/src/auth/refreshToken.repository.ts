import { db } from "../repository/repository";

class RefreshTokenRepository {
  async createSession(userId: number, token: string, expiresAt: Date) {
    return await db.refreshTokenSession.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async getSession(token: string) {
    return await db.refreshTokenSession.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeSession(token: string) {
    return await db.refreshTokenSession.update({
      where: { token },
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
