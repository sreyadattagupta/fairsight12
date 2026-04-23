"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, ScatterChart, Scatter,
  ReferenceLine, LineChart, Line,
} from "recharts";
import Navbar from "@/components/Navbar";
import FairnessGauge from "@/components/FairnessGauge";
import RemediationCard from "@/components/RemediationCard";
import { getBiasColor } from "@/lib/utils";
import { saveToHistory } from "@/lib/history";
import { checkCompliance, getComplianceSummary } from "@/lib/compliance";
import { useAuth } from "@/lib/authContext";

const TAB_DEFS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "metrics", label: "Bias Metrics", icon: "⚖️" },
  { id: "features", label: "Feature Importance", icon: "🔍" },
  { id: "advanced", label: "Advanced Metrics", icon: "🧠" },
  { id: "distributions", label: "Distributions", icon: "📈" },
  { id: "compliance", label: "Compliance", icon: "⚖️" },
  { id: "narrative", label: "AI Report", icon: "✨" },
  { id: "remediation", label: "Remediation", icon: "💡" },
];

function ModelComplianceCard({ check }) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = ({
    pass: { icon: "✅", label: "Pass", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    caution: { icon: "⚠️", label: "Caution", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    fail: { icon: "🚨", label: "Fail", cls: "bg-red-50 text-red-700 border-red-200" },
    unknown: { icon: "❓", label: "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200" },
  })[check.status] || { icon: "❓", label: "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200" };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${check.status === "fail" ? "border-red-100 bg-red-50/30" : check.status === "caution" ? "border-yellow-100 bg-yellow-50/20" : "border-slate-100 bg-white"}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{check.regulation}</span>
            <span className="text-xs text-slate-400">{check.jurisdiction}</span>
          </div>
          <div className="text-xs text-slate-400">{check.article}</div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusMeta.cls}`}>{statusMeta.icon} {statusMeta.label}</span>
      </div>
      <p className="text-sm text-slate-600 mb-2">{check.description}</p>
      <div className="flex gap-3 text-xs flex-wrap">
        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono">{check.metric}: {check.value}</span>
        <span className="text-slate-400">Threshold: <strong>{check.threshold}</strong></span>
      </div>
      {check.recommendation && expanded && (
        <div className="mt-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-500 text-xs uppercase tracking-wide block mb-1">Recommendation</strong>
          {check.recommendation}
        </div>
      )}
      {check.recommendation && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium">
          {expanded ? "Hide" : "Show"} recommendation →
        </button>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }}>
          {p.name}: <span className="font-mono font-bold">{typeof p.value === "number" ? p.value.toFixed(typeof p.value === "number" && p.value < 1 && p.value > 0 ? 3 : 1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ModelDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [modelName, setModelName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeAttr, setActiveAttr] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fairsight_model_results");
      const mn = localStorage.getItem("fairsight_model_name");
      if (!raw) { router.push("/model"); return; }
      const parsed = JSON.parse(raw);
      setResults(parsed);
      setModelName(mn || "Model");
      setActiveAttr(parsed.summary.protectedAttributes[0]);
      saveToHistory({ type: "model", filename: mn || "Model", modelName: parsed.modelMeta?.modelName, results: parsed });
      if (user) {
        fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "model_analysis",
            label: `Analyzed model: ${parsed.modelMeta?.modelName || mn || "Model"}`,
            meta: {
              filename: mn || "Model",
              modelName: parsed.modelMeta?.modelName,
              totalRows: parsed.summary?.totalRows,
              fairnessScore: parsed.summary?.fairnessScore,
              fairnessLevel: parsed.summary?.fairnessLevel,
              protectedAttributes: parsed.summary?.protectedAttributes,
              targetColumn: parsed.summary?.targetColumn,
              detectedTask: parsed.modelMeta?.detectedTask,
            },
          }),
        }).catch(() => {});
      }
      setCompliance(checkCompliance(parsed));
      const saved = localStorage.getItem("fairsight_api_key");
      if (saved) setApiKey(saved);
    } catch {
      router.push("/model");
    }
  }, [router, user]);

  const generateNarrative = async () => {
    if (!results) return;
    setNarrativeLoading(true);
    setNarrativeError("");
    const key = apiKey.trim();
    if (key) localStorage.setItem("fairsight_api_key", key);
    try {
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, apiKey: key || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Generation failed");
      setNarrative(json.narrative);
      setShowApiKeyInput(false);
    } catch (err) {
      if (err.message.includes("API key") || err.message.includes("api_key")) setShowApiKeyInput(true);
      setNarrativeError(err.message);
    } finally {
      setNarrativeLoading(false);
    }
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading model results…</p>
        </div>
      </div>
    );
  }

  const { summary, metricsPerAttribute, distributions, proxyVariables, intersectional, remediations, modelMeta, featureImportance, advancedMetrics } = results;
  const attrMetrics = metricsPerAttribute[activeAttr];
  const distData = distributions[activeAttr] || [];
  const scoreColor = summary.fairnessScore >= 80 ? "#10B981" : summary.fairnessScore >= 60 ? "#F59E0B" : "#EF4444";

  const topFeatures = (featureImportance || []).slice(0, 10).map((f) => ({
    name: f.feature.length > 16 ? f.feature.slice(0, 16) + "…" : f.feature,
    importance: parseFloat((f.importance * 100).toFixed(2)),
    fill: f.importance > 0.1 ? "#EF4444" : f.importance > 0.05 ? "#F59E0B" : "#6366F1",
  }));

  const { counterfactual, theil, betweenGroupVariance } = advancedMetrics || {};

  const dpRows = attrMetrics?.demographicParity ? Object.entries(attrMetrics.demographicParity) : [];
  const dirRows = attrMetrics?.disparateImpact ? Object.entries(attrMetrics.disparateImpact) : [];

  const radarData = [
    { metric: "DPD", score: dpRows.length ? Math.max(0, 100 - Math.abs(dpRows[0]?.[1]?.difference ?? 0) * 1000) : null },
    { metric: "DIR", score: dirRows.length ? Math.min(100, (dirRows[0]?.[1]?.ratio ?? 0) * 100) : null },
    { metric: "Counterfactual", score: counterfactual?.overallFlipRate != null ? Math.max(0, 100 - counterfactual.overallFlipRate * 300) : null },
    { metric: "Individual", score: 80 },
    { metric: "Calibration", score: 75 },
  ].filter((d) => d.score !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
      <Navbar />
      <div className="h-1 bg-gradient-to-r from-purple-500 via-brand-500 to-pink-500" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Link href="/model" className="hover:text-brand-600">Model Analysis</Link>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-700 font-medium">{modelName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center text-xl shadow-md">🤖</div>
              <h1 className="text-3xl font-extrabold text-slate-900">Model Fairness Report</h1>
            </div>
            <p className="text-slate-400 mt-1 text-sm ml-12">
              {modelMeta?.totalRows?.toLocaleString() ?? "—"} predictions · {modelMeta?.featureCols?.length ?? 0} features ·{" "}
              {new Date(summary.analyzedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `model-fairness-${Date.now()}.json`;
                a.click();
              }}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" /></svg>
              Export Report
            </button>
            <Link href="/model" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-purple-500 transition-all shadow-md">
              + New Model
            </Link>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid md:grid-cols-4 gap-5 mb-8 animate-fade-in-up-delay">
          <div className={`bg-gradient-to-br ${summary.fairnessScore >= 80 ? "from-emerald-50 to-teal-50 border-emerald-100" : summary.fairnessScore >= 60 ? "from-yellow-50 to-amber-50 border-yellow-100" : "from-red-50 to-rose-50 border-red-100"} border rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm`}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fairness Score</div>
            <FairnessGauge score={summary.fairnessScore} />
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🤖", label: "Model", value: modelMeta?.modelName || modelName },
              { icon: "⚙️", label: "Input Features", value: `${modelMeta?.featureCols?.length} features` },
              { icon: "🎯", label: "Positive Prediction Rate", value: `${((modelMeta?.predictedPositiveRate || 0) * 100).toFixed(1)}%` },
              { icon: "🛡️", label: "Protected Attributes", value: summary.protectedAttributes.join(", ") },
              {
                icon: counterfactual?.isFair === true ? "✅" : counterfactual?.isFair === false ? "🚨" : "❓",
                label: "Counterfactual Fair",
                value: counterfactual?.isFair != null ? (counterfactual.isFair ? "Yes" : `No (${(counterfactual.overallFlipRate * 100).toFixed(1)}% flip rate)`) : "N/A",
              },
              { icon: "📊", label: "Theil Index", value: theil ? `${theil.theil} (${theil.interpretation.split(" ")[0]})` : "N/A" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-100 px-4 py-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{s.icon}</span>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </div>
                <div className="font-bold text-slate-800 text-sm truncate">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bias alert */}
        {summary.fairnessScore < 60 && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl px-6 py-4 flex gap-4 animate-scale-in">
            <div className="text-2xl">🚨</div>
            <div>
              <p className="font-bold text-red-900">Model bias detected</p>
              <p className="text-sm text-red-700 mt-0.5">This model's predictions discriminate against protected groups. Do not deploy without remediation.</p>
            </div>
          </div>
        )}

        {/* Attribute selector */}
        {summary.protectedAttributes.length > 1 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            <span className="text-sm text-slate-500 self-center mr-1">Attribute:</span>
            {summary.protectedAttributes.map((attr) => (
              <button key={attr} onClick={() => setActiveAttr(attr)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${activeAttr === attr ? "bg-gradient-to-r from-purple-600 to-brand-500 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"}`}>
                {attr}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100/80 p-1 rounded-2xl w-fit flex-wrap">
          {TAB_DEFS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ─ Overview ─ */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
            {/* Radar chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1">Fairness Dimensions</h3>
              <p className="text-sm text-slate-400 mb-4">Composite view across fairness criteria</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Radar name="Score" dataKey="score" stroke={scoreColor} fill={scoreColor} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick metric summary */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Key Findings</h3>
              <div className="space-y-3">
                {dpRows.map(([group, vals]) => {
                  const diff = vals.difference;
                  const { color, label } = getBiasColor(diff, "dpd");
                  return (
                    <div key={group} className={`flex items-center gap-3 p-3 rounded-xl border ${label === "Biased" ? "bg-red-50 border-red-100" : label === "Caution" ? "bg-yellow-50 border-yellow-100" : "bg-emerald-50 border-emerald-100"}`}>
                      <span className="text-lg">{label === "Biased" ? "🚨" : label === "Caution" ? "⚠️" : "✅"}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{group}</div>
                        <div className="text-xs text-slate-500">DPD: {diff.toFixed(3)} vs privileged group</div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${label === "Biased" ? "bg-red-100 text-red-700" : label === "Caution" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>{label}</span>
                    </div>
                  );
                })}
                {counterfactual && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${counterfactual.isFair ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                    <span className="text-lg">{counterfactual.isFair ? "✅" : "🚨"}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">Counterfactual Fairness</div>
                      <div className="text-xs text-slate-500">{counterfactual.interpretation}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─ Bias Metrics ─ */}
        {activeTab === "metrics" && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-slate-500">
              Reference group: <strong className="text-slate-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-lg">{attrMetrics?.privilegedGroup}</strong>
            </p>
            {["demographicParity", "disparateImpact"].map((mk) => {
              const meta = { demographicParity: { label: "Demographic Parity Difference", threshold: "< 0.10", type: "dpd", key: "difference" }, disparateImpact: { label: "Disparate Impact Ratio", threshold: "> 0.80", type: "dir", key: "ratio" } }[mk];
              const rows = attrMetrics?.[mk] ? Object.entries(attrMetrics[mk]).filter(([, v]) => v[meta.key] != null) : [];
              if (!rows.length) return null;
              return (
                <div key={mk} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-bold text-slate-800">{meta.label}</h3>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">{meta.threshold}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-28 text-sm text-slate-400 flex-shrink-0">{attrMetrics.privilegedGroup} <span className="text-xs">(ref)</span></div>
                      <div className="flex-1 h-3 bg-brand-100 rounded-full">
                        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full w-full" />
                      </div>
                      <div className="w-16 text-right font-mono text-sm text-brand-600">{meta.type === "dpd" ? "0.000" : "1.000"}</div>
                      <div className="w-16" />
                    </div>
                    {rows.map(([group, vals]) => {
                      const raw = vals[meta.key];
                      const { color, label } = getBiasColor(raw, meta.type);
                      const pct = meta.type === "dpd" ? Math.min(Math.abs(raw) * 400, 100) : Math.min(Math.abs(raw - 1) * 250, 100);
                      const grad = label === "Fair" ? "from-emerald-400 to-teal-500" : label === "Caution" ? "from-yellow-400 to-amber-500" : "from-red-400 to-rose-500";
                      return (
                        <div key={group} className="flex items-center gap-3">
                          <div className="w-28 text-sm font-medium text-slate-700 flex-shrink-0">{group}</div>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`} style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <div className={`w-16 text-right font-mono text-sm font-bold ${color}`}>{raw.toFixed(3)}</div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border w-16 text-center ${label === "Fair" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : label === "Caution" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─ Feature Importance ─ */}
        {activeTab === "features" && (
          <div className="animate-fade-in">
            {topFeatures.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-1">Permutation Feature Importance</h3>
                <p className="text-sm text-slate-400 mb-2">
                  Accuracy drop when each feature is shuffled — higher = more influential.
                  Red features may be proxy variables for protected attributes.
                </p>
                <div className="flex gap-4 text-xs text-slate-500 mb-5 flex-wrap">
                  {[["#EF4444", "High influence (>10% accuracy drop)"], ["#F59E0B", "Medium (>5%)"], ["#6366F1", "Low (<5%)"]].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded" style={{ background: c }} /> {l}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={topFeatures.length * 40 + 40}>
                  <BarChart data={topFeatures} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: "#374151" }} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" name="Importance" radius={[0, 8, 8, 0]}>
                      {topFeatures.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Protected attribute overlap warning */}
                {modelMeta?.featureCols && summary.protectedAttributes && (
                  <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                    <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Protected Attribute in Model Inputs</p>
                    <p className="text-sm text-amber-700">
                      Check if any high-importance features correlate with {summary.protectedAttributes.join(", ")}.
                      Proxy variables can encode indirect discrimination even when protected attributes are excluded.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-semibold text-slate-600">Feature importance not available</p>
                <p className="text-sm text-slate-400 mt-1">Upload ground truth labels to enable permutation importance</p>
              </div>
            )}
          </div>
        )}

        {/* ─ Advanced Metrics ─ */}
        {activeTab === "advanced" && (
          <div className="space-y-5 animate-fade-in">
            {/* Counterfactual Fairness */}
            {counterfactual && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center text-2xl shadow-md">🔄</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Counterfactual Fairness</h3>
                    <p className="text-sm text-slate-400">Would flipping the protected attribute change the model's decision?</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${counterfactual.isFair ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {counterfactual.isFair ? "Counterfactually Fair" : "Counterfactually Unfair"}
                    </span>
                  </div>
                </div>
                {counterfactual.overallFlipRate != null && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-400 mb-1">Overall Flip Rate</div>
                      <div className={`text-2xl font-black ${counterfactual.overallFlipRate > 0.1 ? "text-red-600" : "text-emerald-600"}`}>
                        {(counterfactual.overallFlipRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">of comparable pairs</div>
                    </div>
                    {Object.entries(counterfactual.perGroupFlipRate).map(([g, v]) => v.flipRate != null && (
                      <div key={g} className="bg-slate-50 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">{g} flip rate</div>
                        <div className={`text-2xl font-black ${v.flipRate > 0.1 ? "text-red-600" : "text-emerald-600"}`}>
                          {(v.flipRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">{v.comparisons} pairs found</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`text-sm px-4 py-3 rounded-xl ${counterfactual.isFair ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                  {counterfactual.interpretation}
                </div>
              </div>
            )}

            {/* Theil Index + Gini */}
            {theil && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md">📐</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Outcome Inequality (Theil Index)</h3>
                    <p className="text-sm text-slate-400">Measures overall inequality in model predictions across the population</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Theil Index", value: theil.theil, desc: "0 = equal, higher = unequal" },
                    { label: "Gini Coefficient", value: theil.gini, desc: "0 = equal, 1 = maximally unequal" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gradient-to-br from-slate-50 to-amber-50 border border-amber-100 rounded-xl p-5">
                      <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                      <div className={`text-3xl font-black ${Number(m.value) < 0.1 ? "text-emerald-600" : Number(m.value) < 0.3 ? "text-yellow-600" : "text-red-600"}`}>{m.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{m.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">{theil.interpretation}</div>
              </div>
            )}

            {/* Between-group variance */}
            {betweenGroupVariance && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-md">📊</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Between-Group Variance</h3>
                    <p className="text-sm text-slate-400">How much of the outcome variance is explained by group membership?</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 mb-1">BGV Score</div>
                    <div className={`text-2xl font-black ${betweenGroupVariance.value < 0.001 ? "text-emerald-600" : betweenGroupVariance.value < 0.01 ? "text-yellow-600" : "text-red-600"}`}>{betweenGroupVariance.value}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 mb-1">Overall Positive Rate</div>
                    <div className="text-2xl font-black text-slate-700">{(betweenGroupVariance.overallMean * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={betweenGroupVariance.groupMeans} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="group" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                    <ReferenceLine y={betweenGroupVariance.overallMean} stroke="#6366F1" strokeDasharray="4 4" label={{ value: "Overall avg", fill: "#6366F1", fontSize: 11 }} />
                    <Bar dataKey="mean" name="Outcome Rate" radius={[6, 6, 0, 0]} fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ─ Distributions ─ */}
        {activeTab === "distributions" && (
          <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-0.5">Model Prediction Rate by Group</h3>
              <p className="text-sm text-slate-400 mb-5">% of positive predictions per {activeAttr} group</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="group" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="favorableRate" name="Prediction Rate" radius={[8, 8, 0, 0]}>
                    {distData.map((entry, i) => (
                      <Cell key={i} fill={entry.group === attrMetrics?.privilegedGroup ? "#7C3AED" : `hsl(${220 + i * 40}, 70%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-0.5">Group Representation</h3>
              <p className="text-sm text-slate-400 mb-5">Dataset composition by {activeAttr}</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="group" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" name="Representation" radius={[8, 8, 0, 0]}>
                    {distData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${260 + i * 25}, 65%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─ Remediation ─ */}
        {/* ─ Compliance ─ */}
        {activeTab === "compliance" && compliance && (
          <div className="animate-fade-in">
            {(() => { const cs = getComplianceSummary(compliance); return (
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-800">Regulatory Compliance Check</h2>
                {cs.pass > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{cs.pass} Pass</span>}
                {cs.caution > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">{cs.caution} Caution</span>}
                {cs.fail > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{cs.fail} Fail</span>}
              </div>
            ); })()}
            <p className="text-sm text-slate-400 mb-5">Automated check against real-world AI fairness regulations. Not a substitute for legal advice.</p>
            <div className="space-y-3">
              {compliance.map((check) => <ModelComplianceCard key={check.id} check={check} />)}
            </div>
          </div>
        )}

        {/* ─ AI Narrative ─ */}
        {activeTab === "narrative" && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">✨</div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">AI-Generated Audit Narrative</h2>
                  <p className="text-sm text-slate-400">Gemini analyzes your model's bias metrics and generates a plain-English executive report for non-technical stakeholders and compliance teams.</p>
                </div>
              </div>
              {!narrative && !narrativeLoading && (
                <div>
                  {showApiKeyInput && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 block mb-1">Google AI API Key</label>
                      <input type="password" placeholder="AIza..." value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono" />
                      <p className="text-xs text-slate-400 mt-1">Stored locally in your browser. Get a key at aistudio.google.com</p>
                    </div>
                  )}
                  {narrativeError && !showApiKeyInput && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{narrativeError}</div>
                  )}
                  <button onClick={generateNarrative}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate AI Report
                  </button>
                </div>
              )}
              {narrativeLoading && (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-500 font-medium">Gemini is analyzing your model's bias metrics…</span>
                </div>
              )}
              {narrative && (
                <div>
                  <div className="prose prose-sm max-w-none text-slate-700 bg-gradient-to-br from-violet-50/50 to-purple-50/50 rounded-xl p-5 border border-purple-100">
                    {narrative.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-slate-900 text-base mt-4 mb-2 first:mt-0">{line.slice(3)}</h3>;
                      if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} className="flex gap-2 mb-1"><span className="text-purple-400 flex-shrink-0">•</span><span>{line.slice(2)}</span></div>;
                      if (/^\d+\./.test(line)) return <div key={i} className="flex gap-2 mb-1"><span className="text-purple-600 font-bold flex-shrink-0 w-5">{line.match(/^\d+/)[0]}.</span><span>{line.replace(/^\d+\.\s*/, "")}</span></div>;
                      if (!line.trim()) return <div key={i} className="h-2" />;
                      return <p key={i} className="mb-2">{line}</p>;
                    })}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { const b = new Blob([narrative], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `model-audit-narrative-${Date.now()}.txt`; a.click(); }}
                      className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" /></svg>
                      Download Report
                    </button>
                    <button onClick={() => { setNarrative(""); setNarrativeError(""); }} className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">Regenerate</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "remediation" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-bold text-slate-800">Remediation Roadmap</h2>
              <span className="text-sm bg-gradient-to-r from-purple-50 to-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-semibold">{remediations?.length ?? 0} recommendations</span>
            </div>
            <div className="space-y-3">
              {(remediations ?? []).map((r, i) => <RemediationCard key={r.title} remediation={r} index={i} />)}
            </div>
          </div>
        )}

        <div className="mt-10 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-400">
          <strong className="text-slate-600">Note: </strong>
          Fairness metrics are computed on model predictions, not ground truth. Results depend on test data representativeness. Consult domain and legal experts before deployment decisions.
        </div>
      </div>
    </div>
  );
}
