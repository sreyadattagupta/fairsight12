import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData?.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: user.toSafeObject() });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
