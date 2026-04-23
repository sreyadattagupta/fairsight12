import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import Activity from "@/lib/models/Activity";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Update last active
    user.lastActiveAt = new Date();
    await user.save();

    await Activity.create({
      userId: user._id,
      type: "login",
      label: "Signed in",
    });

    const token = signToken({ userId: user._id, email: user.email, name: user.name });
    const response = NextResponse.json({ success: true, user: user.toSafeObject() });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Login failed." }, { status: 500 });
  }
}
