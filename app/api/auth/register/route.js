import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import Activity from "@/lib/models/Activity";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });

    // Log registration activity
    await Activity.create({
      userId: user._id,
      type: "register",
      label: "Account created",
    });

    const token = signToken({ userId: user._id, email: user.email, name: user.name });
    const response = NextResponse.json({ success: true, user: user.toSafeObject() });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message || "Registration failed." }, { status: 500 });
  }
}
