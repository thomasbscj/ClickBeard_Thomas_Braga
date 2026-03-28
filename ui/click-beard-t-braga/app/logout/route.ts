import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("role");
  return NextResponse.redirect(`${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}/login`)
}
