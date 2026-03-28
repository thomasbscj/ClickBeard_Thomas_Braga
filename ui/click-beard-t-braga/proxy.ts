import { NextRequest, NextResponse } from "next/server";

/**
 * Decode JWT payload from token string
 */
function decodeJWT(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);
    console.log(parsed);
    return parsed;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get("accessToken");
  const pathname = req.nextUrl.pathname;
  const publicRoutes = ["/login", "/register"];
  console.log("passou pelo proxy!");

  // Create response object
  const response = NextResponse.next();

  // Check if user has token and extract role
  if (token?.value) {
    const payload = decodeJWT(token.value);
    if (payload?.role === "admin") {
      // Set non-httpOnly cookie with role
      response.cookies.set("role", "admin", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }
  }

  // Check if trying to access admin routes
  if (pathname.startsWith("/admin")) {
    if (!token?.value) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const payload = decodeJWT(token.value);
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return response;
  }

  // Regular authentication check for protected routes
  if (!token?.value && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token?.value && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
