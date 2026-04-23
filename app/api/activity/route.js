import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Activity from "@/lib/models/Activity";
import User from "@/lib/models/User";

export async function GET(request) {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

    const activities = await Activity.find({ userId: tokenData.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ activities });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tokenData = await getCurrentUser();
    if (!tokenData?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, label, meta, results } = body;

    if (!type || !label) {
      return NextResponse.json({ error: "type and label required" }, { status: 400 });
    }

    await connectDB();

    const activity = await Activity.create({
      userId: tokenData.userId,
      type,
      label,
      meta: meta || undefined,
      results: results || null,
    });

    // Increment totalAnalyses for analysis events
    if (type === "dataset_analysis" || type === "model_analysis") {
      await User.findByIdAndUpdate(tokenData.userId, { $inc: { totalAnalyses: 1 } });
    }

    // Prune to 200 most recent
    const count = await Activity.countDocuments({ userId: tokenData.userId });
    if (count > 200) {
      const oldest = await Activity.find({ userId: tokenData.userId })
        .sort({ createdAt: 1 })
        .limit(count - 200)
        .select("_id");
      await Activity.deleteMany({ _id: { $in: oldest.map((a) => a._id) } });
    }

    return NextResponse.json({ activity });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
