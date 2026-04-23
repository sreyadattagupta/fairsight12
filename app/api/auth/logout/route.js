import { NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Activity from "@/lib/models/Activity";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user?.userId) {
      await connectDB();
      await Activity.create({
        userId: user.userId,
        type: "logout",
        label: "Signed out",
      });
    }
  } catch {
    // best-effort activity log
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}
