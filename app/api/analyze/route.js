import { NextResponse } from "next/server";
import { analyzeDataset } from "@/lib/biasAnalysis";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, protectedAttributes, targetColumn, favorableValues, actualColumn, regressionThreshold } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid dataset" }, { status: 400 });
    }
    if (data.length > 500000) {
      return NextResponse.json({ error: "Dataset too large (max 500,000 rows)" }, { status: 400 });
    }

    // For very large datasets, sample to 100K for API analysis while preserving group distributions
    const analysisData = data.length > 100000 ? stratifiedSample(data, protectedAttributes, 100000) : data;

    const results = analyzeDataset({
      data: analysisData,
      protectedAttributes,
      targetColumn,
      favorableValues,
      actualColumn: actualColumn || null,
      regressionThreshold: regressionThreshold ?? null,
    });

    return NextResponse.json({
      success: true,
      results,
      sampled: data.length > 100000,
      originalRows: data.length,
      analyzedRows: analysisData.length,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}

function stratifiedSample(data, protectedAttrs, targetSize) {
  if (!protectedAttrs?.length || !data.length) return data.slice(0, targetSize);
  const groups = {};
  data.forEach((row) => {
    const key = protectedAttrs.map((a) => String(row[a] ?? "")).join("|");
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  const result = [];
  const groupKeys = Object.keys(groups);
  groupKeys.forEach((key) => {
    const groupData = groups[key];
    const quota = Math.round((groupData.length / data.length) * targetSize);
    const take = Math.min(quota, groupData.length);
    for (let i = 0; i < take; i++) result.push(groupData[i]);
  });
  return result.slice(0, targetSize);
}
