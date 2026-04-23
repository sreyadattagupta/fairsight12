import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // What type of action
    type: {
      type: String,
      enum: ["dataset_analysis", "model_analysis", "narrative_generated", "history_viewed", "login", "logout", "register"],
      required: true,
    },

    // Human-readable label
    label: { type: String, required: true },

    // Analysis metadata (optional, stored for activity feed)
    meta: {
      filename: String,
      modelName: String,
      totalRows: Number,
      fairnessScore: Number,
      fairnessLevel: String,
      protectedAttributes: [String],
      targetColumn: String,
      isRegression: Boolean,
      compliancePass: Number,
      complianceFail: Number,
      detectedTask: String,
    },

    // Full results snapshot (optional — only saved for analysis events)
    results: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Keep only last 200 activities per user (TTL via application logic)
ActivitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
