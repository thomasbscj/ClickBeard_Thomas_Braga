interface JWTPayload {
  id: number;
  role: "user" | "admin";
  iat: number;
  exp: number;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    return {
      id: parsed.id,
      role: parsed.role,
      iat: parsed.iat,
      exp: parsed.exp,
    };
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}


export function getJWTFromCookies(cookieString: string): string | null {
  const cookies = cookieString.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "accessToken") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function isAdmin(cookieString: string): boolean {
  const token = getJWTFromCookies(cookieString);
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  return payload?.role === "admin";
}
