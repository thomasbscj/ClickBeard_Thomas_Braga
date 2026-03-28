/**
 * Utility to decode JWT tokens
 * Note: This is for CLIENT-SIDE decoding only. The token is already verified by the server.
 */

interface JWTPayload {
  id: number;
  role: "user" | "admin";
  iat: number;
  exp: number;
}

/**
 * Decode JWT payload (without verification - relies on server-side verification)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if necessary
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

/**
 * Extract JWT from cookies
 * @param cookieString - Cookie string (usually from document.cookie)
 * @returns JWT token or null if not found
 */
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

/**
 * Check if user is admin
 * @param cookieString - Cookie string
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(cookieString: string): boolean {
  const token = getJWTFromCookies(cookieString);
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  return payload?.role === "admin";
}
