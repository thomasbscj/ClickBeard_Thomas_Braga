import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refreshAccessToken } from "@/axios/calls";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      redirect("/login");
    }

    // Use the existing refreshAccessToken function
    await refreshAccessToken(refreshToken)
        .then(() => {
                redirect("/");
        }).catch(() =>{
                redirect("/login");
        });

    // If successful, redirect to home
    
  } catch (error) {
    console.error("Refresh token error:", error);
    redirect("/login");
  }
}
