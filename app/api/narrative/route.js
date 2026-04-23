import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { results, apiKey } = body;

    const key = apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const { summary, metricsPerAttribute, proxyVariables, remediations, modelMeta } = results;
    const isModel = !!modelMeta;

    const metricsText = Object.entries(metricsPerAttribute || {}).map(([attr, m]) => {
      const dpEntries = Object.entries(m.demographicParity || {})
        .map(([g, v]) => `${g}: DPD=${v.difference?.toFixed(3)}`)
        .join(", ");
      const dirEntries = Object.entries(m.disparateImpact || {})
        .map(([g, v]) => `${g}: DIR=${v.ratio?.toFixed(3)}`)
        .join(", ");
      return `Attribute "${attr}" (privileged: ${m.privilegedGroup}):\n  DPD: ${dpEntries}\n  DIR: ${dirEntries}`;
    }).join("\n\n");

    const proxyText = Object.entries(proxyVariables || {})
      .map(([attr, vars]) => vars.length
        ? `${attr}: ${vars.slice(0, 3).map((v) => `${v.column}(r=${v.correlation.toFixed(2)},${v.risk})`).join(", ")}`
        : `${attr}: none detected`)
      .join("\n");

    const prompt = `You are an AI fairness expert writing a bias audit report for a ${isModel ? "machine learning model" : "dataset"}.

ANALYSIS SUMMARY:
- Fairness Score: ${summary.fairnessScore}/100 (${summary.fairnessLevel})
- Dataset: ${summary.totalRows?.toLocaleString()} rows, ${summary.totalColumns} columns
- Protected Attributes: ${summary.protectedAttributes?.join(", ")}
- Target/Outcome: ${summary.targetColumn}
${isModel ? `- Model: ${modelMeta.modelName}, Task: ${modelMeta.detectedTask || "classification"}, Features: ${modelMeta.featureCols?.length}` : ""}

FAIRNESS METRICS:
${metricsText}

PROXY VARIABLE RISKS:
${proxyText}

TOP REMEDIATION PRIORITIES:
${(remediations || []).slice(0, 3).map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join("\n")}

Write a professional bias audit narrative with these exact sections:

## Executive Summary
2-3 sentences. State the fairness score, overall risk level, and the single most critical finding. Be direct.

## Key Bias Findings
3-5 bullet points. Each bullet = one concrete bias finding with the numeric value. Non-technical language.

## Who Is Affected
1-2 sentences on which demographic groups face the most disadvantage and what real-world impact this has.

## Root Causes
2-3 bullets on likely causes (data collection bias, historical patterns, proxy variables, etc.)

## Priority Actions
Numbered list of 3 specific, actionable steps ordered by impact. Include technical approach and expected outcome.

## Regulatory Risk
2-3 sentences on which regulations this may violate and what enforcement risk looks like.

Keep total length under 450 words. Use precise numbers from the metrics. Write for a business audience, not data scientists.`;

    const result = await model.generateContent(prompt);
    const narrative = result.response.text();

    return NextResponse.json({ success: true, narrative });
  } catch (err) {
    console.error("Narrative error:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
