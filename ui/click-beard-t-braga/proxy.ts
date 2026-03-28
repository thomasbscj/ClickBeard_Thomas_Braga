import { NextRequest, NextResponse } from "next/server";

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
  const response = NextResponse.next();

  if (token?.value) {
    const payload = decodeJWT(token.value);
    if (payload?.role === "admin") {
      response.cookies.set("role", "admin", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
    }
  }

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
