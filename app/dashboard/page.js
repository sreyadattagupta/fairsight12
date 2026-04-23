"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import Navbar from "@/components/Navbar";
import FairnessGauge from "@/components/FairnessGauge";
import RemediationCard from "@/components/RemediationCard";
import { getBiasColor } from "@/lib/utils";
import { saveToHistory } from "@/lib/history";
import { checkCompliance, getComplianceSummary } from "@/lib/compliance";
import { useAuth } from "@/lib/authContext";

const METRIC_META = {
  demographicParity: {
    label: "Demographic Parity Difference",
    short: "DPD",
    threshold: "< 0.10",
    type: "dpd",
    explainer: "Difference in positive outcome rates. Values near 0 = equal treatment.",
  },
  disparateImpact: {
    label: "Disparate Impact Ratio",
    short: "DIR",
    threshold: "> 0.80",
    type: "dir",
    explainer: "Unprivileged ÷ privileged rate. 80% rule requires DIR ≥ 0.80.",
  },
};

function MetricSection({ metricKey, groupResults, privilegedGroup }) {
  const meta = METRIC_META[metricKey];
  if (!groupResults) return null;
  const rows = Object.entries(groupResults).filter(([, v]) => {
    const val = metricKey === "disparateImpact" ? v.ratio : v.difference;
    return val !== null && val !== undefined;
  });
  if (!rows.length) return null;
  const valueKey = metricKey === "disparateImpact" ? "ratio" : "difference";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{meta.label}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{meta.explainer}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-slate-400">Fair threshold</div>
          <div className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-0.5">{meta.threshold}</div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Privileged reference row */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 font-medium w-28 flex-shrink-0 truncate">
            {privilegedGroup}
            <span className="ml-1 text-xs text-slate-300">(ref)</span>
          </div>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500" style={{ width: "100%" }} />
          </div>
          <div className="text-sm font-mono font-semibold text-brand-600 w-16 text-right">
            {meta.type === "dpd" ? "0.000" : "1.000"}
          </div>
          <div className="w-16" />
        </div>

        {rows.map(([group, vals]) => {
          const raw = vals[valueKey];
          const { color, label } = getBiasColor(raw, meta.type);
          const barPct = meta.type === "dpd"
            ? Math.min(Math.abs(raw) * 400, 100)
            : Math.min(Math.abs(raw - 1) * 250, 100);
          const barGradient = label === "Fair"
            ? "from-emerald-400 to-teal-500"
            : label === "Caution"
            ? "from-yellow-400 to-amber-500"
            : "from-red-400 to-rose-500";

          return (
            <div key={group} className="flex items-center gap-3 group">
              <div className="text-sm text-slate-700 font-medium w-28 flex-shrink-0 truncate">{group}</div>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700`}
                  style={{ width: `${Math.max(barPct, 1.5)}%` }}
                />
              </div>
              <div className={`text-sm font-mono font-bold w-16 text-right ${color}`}>
                {raw.toFixed(3)}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border w-16 text-center ${
                label === "Fair"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : label === "Caution"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComplianceCard({ check }) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = ({
    pass: { icon: "✅", label: "Pass", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    caution: { icon: "⚠️", label: "Caution", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    fail: { icon: "🚨", label: "Fail", cls: "bg-red-50 text-red-700 border-red-200" },
    unknown: { icon: "❓", label: "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200" },
  })[check.status] || { icon: "❓", label: "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200" };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all ${check.status === "fail" ? "border-red-100 bg-red-50/30" : check.status === "caution" ? "border-yellow-100 bg-yellow-50/20" : "border-slate-100 bg-white"}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-slate-800">{check.regulation}</span>
                <span className="text-xs text-slate-400">{check.jurisdiction}</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">{check.article}</div>
            </div>
            <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusMeta.cls}`}>
              {statusMeta.icon} {statusMeta.label}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-2">{check.description}</p>
          <div className="flex items-center gap-3 text-xs flex-wrap">
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
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3">
      <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm" style={{ color: p.fill }}>
          {p.name}: <span className="font-mono font-bold">{p.value.toFixed(1)}%</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [fileName, setFileName] = useState("");
  const [activeAttr, setActiveAttr] = useState(null);
  const [activeTab, setActiveTab] = useState("metrics");
  const [compliance, setCompliance] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fairsight_results");
      const fn = localStorage.getItem("fairsight_filename");
      if (!raw) { router.push("/analyze"); return; }
      const parsed = JSON.parse(raw);
      setResults(parsed);
      setFileName(fn || "Dataset");
      setActiveAttr(parsed.summary.protectedAttributes[0]);
      // Auto-save to history (localStorage)
      saveToHistory({ type: "dataset", filename: fn || "Dataset", results: parsed });
      // Save to MongoDB if logged in
      if (user) {
        fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "dataset_analysis",
            label: `Analyzed ${fn || "Dataset"}`,
            meta: {
              filename: fn || "Dataset",
              totalRows: parsed.summary?.totalRows,
              fairnessScore: parsed.summary?.fairnessScore,
              fairnessLevel: parsed.summary?.fairnessLevel,
              protectedAttributes: parsed.summary?.protectedAttributes,
              targetColumn: parsed.summary?.targetColumn,
            },
          }),
        }).catch(() => {});
      }
      // Compute compliance
      setCompliance(checkCompliance(parsed));
      // Load saved API key
      const saved = localStorage.getItem("fairsight_api_key");
      if (saved) setApiKey(saved);
    } catch {
      router.push("/analyze");
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
      if (err.message.includes("API key")) setShowApiKeyInput(true);
      setNarrativeError(err.message);
    } finally {
      setNarrativeLoading(false);
    }
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading results…</p>
        </div>
      </div>
    );
  }

  const { summary, metricsPerAttribute, distributions, proxyVariables, intersectional, remediations } = results;
  const attrMetrics = metricsPerAttribute[activeAttr];
  const distData = distributions[activeAttr] || [];

  const proxyData = (proxyVariables[activeAttr] || []).slice(0, 8).map((p) => ({
    name: p.column.length > 14 ? p.column.slice(0, 14) + "…" : p.column,
    value: parseFloat((p.correlation * 100).toFixed(1)),
    risk: p.risk,
    fill: p.risk === "high" ? "#EF4444" : p.risk === "medium" ? "#F59E0B" : "#6366F1",
  }));

  const scoreColor = summary.fairnessScore >= 80 ? "#10B981" : summary.fairnessScore >= 60 ? "#F59E0B" : "#EF4444";
  const scoreGradient = summary.fairnessScore >= 80
    ? "from-emerald-50 to-teal-50 border-emerald-100"
    : summary.fairnessScore >= 60
    ? "from-yellow-50 to-amber-50 border-yellow-100"
    : "from-red-50 to-rose-50 border-red-100";

  const complianceSummary = compliance ? getComplianceSummary(compliance) : null;

  const TABS = [
    { id: "metrics", label: "Bias Metrics", icon: "📊" },
    { id: "distributions", label: "Distributions", icon: "📈" },
    ...(proxyData.length ? [{ id: "proxies", label: "Proxy Variables", icon: "🔍" }] : []),
    ...(intersectional ? [{ id: "intersectional", label: "Intersectional", icon: "🧩" }] : []),
    { id: "compliance", label: "Compliance", icon: "⚖️", badge: complianceSummary?.fail > 0 ? complianceSummary.fail : null },
    { id: "narrative", label: "AI Report", icon: "✨" },
    { id: "remediation", label: "Remediation", icon: "💡" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/20">
      <Navbar />
      <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Link href="/analyze" className="hover:text-brand-600 transition-colors">Analyze</Link>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-700 font-medium">{fileName}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Fairness Audit Report</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {summary.totalRows.toLocaleString()} rows · {summary.totalColumns} columns ·{" "}
              {new Date(summary.analyzedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `fairsight-report-${Date.now()}.json`;
                a.click();
              }}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export JSON
            </button>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-brand-500 hover:to-brand-400 transition-all shadow-md shadow-brand-200"
            >
              + New Analysis
            </Link>
          </div>
        </div>

        {/* Top summary row */}
        <div className="grid md:grid-cols-4 gap-5 mb-8 animate-fade-in-up-delay">
          {/* Score card */}
          <div className={`md:col-span-1 bg-gradient-to-br ${scoreGradient} border rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm`}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fairness Score</div>
            <FairnessGauge score={summary.fairnessScore} />
          </div>

          {/* Summary stats */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Protected Attributes", value: summary.protectedAttributes.join(", "), icon: "🛡️", color: "blue" },
              { label: "Outcome Column", value: summary.targetColumn, icon: "🎯", color: "indigo" },
              { label: "Favorable Values", value: summary.favorableValues.join(", "), icon: "✅", color: "emerald" },
              { label: "Total Rows", value: summary.totalRows.toLocaleString(), icon: "📋", color: "slate" },
              { label: "Proxy Variables", value: `${Object.values(proxyVariables).flat().length} flagged`, icon: "🔍", color: "amber" },
              { label: "Status", value: summary.fairnessLevel, icon: summary.fairnessScore >= 80 ? "✅" : summary.fairnessScore >= 60 ? "⚠️" : "🚨", color: summary.fairnessScore >= 80 ? "emerald" : summary.fairnessScore >= 60 ? "yellow" : "red" },
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
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl px-6 py-4 flex gap-4 animate-scale-in shadow-sm">
            <div className="text-2xl flex-shrink-0">🚨</div>
            <div>
              <p className="font-bold text-red-900">Significant bias detected</p>
              <p className="text-sm text-red-700 mt-0.5">
                This system shows patterns that may discriminate against protected groups. Review metrics below and implement recommended remediations before deployment.
              </p>
            </div>
          </div>
        )}

        {/* Attribute tabs */}
        {summary.protectedAttributes.length > 1 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            <span className="text-sm text-slate-500 self-center mr-1">Attribute:</span>
            {summary.protectedAttributes.map((attr) => (
              <button
                key={attr}
                onClick={() => setActiveAttr(attr)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeAttr === attr
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {attr}
              </button>
            ))}
          </div>
        )}

        {/* Content tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100/80 p-1 rounded-2xl w-fit flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === t.id
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─ Tab: Metrics ─ */}
        {activeTab === "metrics" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
              <span>Reference group (highest outcome rate):</span>
              <span className="font-bold text-slate-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-lg">
                {attrMetrics?.privilegedGroup}
              </span>
            </div>
            <MetricSection metricKey="demographicParity" groupResults={attrMetrics?.demographicParity} privilegedGroup={attrMetrics?.privilegedGroup} />
            <MetricSection metricKey="disparateImpact" groupResults={attrMetrics?.disparateImpact} privilegedGroup={attrMetrics?.privilegedGroup} />
            {attrMetrics?.equalOpportunity && Object.keys(attrMetrics.equalOpportunity).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-1">Equal Opportunity Difference</h3>
                <p className="text-sm text-slate-400 mb-4">True positive rate parity — are qualified individuals equally favored?</p>
                <div className="space-y-3">
                  {Object.entries(attrMetrics.equalOpportunity).map(([group, vals]) => {
                    if (!vals?.tpr && vals?.tpr !== 0) return null;
                    const diff = vals.difference;
                    const { color, label } = getBiasColor(diff, "dpd");
                    return (
                      <div key={group} className="flex items-center gap-3">
                        <div className="text-sm font-medium w-28 flex-shrink-0 text-slate-700">{group}</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${label === "Fair" ? "from-emerald-400 to-teal-500" : label === "Caution" ? "from-yellow-400 to-amber-500" : "from-red-400 to-rose-500"}`}
                            style={{ width: `${Math.min(Math.abs(diff ?? 0) * 400, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-mono font-bold w-16 text-right ${color}`}>{(diff ?? 0).toFixed(3)}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border w-16 text-center ${label === "Fair" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : label === "Caution" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ Tab: Distributions ─ */}
        {activeTab === "distributions" && (
          <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-0.5">Outcome Rate by Group</h3>
              <p className="text-sm text-slate-400 mb-5">Positive outcome % per {activeAttr} group</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="group" tick={{ fontSize: 12, fill: "#64748b" }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="favorableRate" name="Outcome Rate" radius={[8, 8, 0, 0]}>
                    {distData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.group === attrMetrics?.privilegedGroup
                          ? "url(#gradPriv)"
                          : `hsl(${220 + i * 40}, 70%, 65%)`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="gradPriv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-0.5">Group Representation</h3>
              <p className="text-sm text-slate-400 mb-5">Dataset share % per {activeAttr} group</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="group" tick={{ fontSize: 12, fill: "#64748b" }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" name="Representation" radius={[8, 8, 0, 0]}>
                    <defs>
                      <linearGradient id="gradRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                    </defs>
                    {distData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${260 + i * 20}, 75%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─ Tab: Proxies ─ */}
        {activeTab === "proxies" && proxyData.length > 0 && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1">Proxy Variable Risk — {activeAttr}</h3>
              <p className="text-sm text-slate-400 mb-5">
                Columns correlated with "{activeAttr}" may encode indirect discrimination. Audit each for business necessity.
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={proxyData} layout="vertical" margin={{ top: 5, right: 70, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: "#374151" }} width={90} />
                  <Tooltip formatter={(v) => [`${v}% correlation`]} />
                  <ReferenceLine x={70} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "High Risk", fill: "#EF4444", fontSize: 11, position: "insideTopRight" }} />
                  <ReferenceLine x={50} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "Med", fill: "#F59E0B", fontSize: 11, position: "insideTopRight" }} />
                  <Bar dataKey="value" name="Correlation" radius={[0, 8, 8, 0]}>
                    {proxyData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="flex gap-4 text-xs text-slate-500 mt-4 flex-wrap">
                {[["🔴", "#EF4444", "High risk (>70%)"], ["🟡", "#F59E0B", "Medium risk (>50%)"], ["🟣", "#6366F1", "Low risk (>30%)"]].map(([e, c, l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─ Tab: Intersectional ─ */}
        {activeTab === "intersectional" && intersectional && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1">Intersectional Bias</h3>
              <p className="text-sm text-slate-400 mb-5">
                Outcome rates at {intersectional.attr1} × {intersectional.attr2} — compounded discrimination invisible in single-attribute analysis.
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[intersectional.attr1, intersectional.attr2, "Count", "Outcome Rate"].map((h) => (
                        <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {intersectional.intersections.map((row, i) => {
                      const rate = row.favorableRate;
                      const barColor = rate >= 50 ? "#10B981" : rate >= 30 ? "#F59E0B" : "#EF4444";
                      return (
                        <tr key={i} className={`border-t border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-brand-50/30 transition-colors`}>
                          <td className="py-3 px-5 font-semibold text-slate-700">{row.a1}</td>
                          <td className="py-3 px-5 text-slate-600">{row.a2}</td>
                          <td className="py-3 px-5 text-slate-400 font-mono">{row.count}</td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: barColor }} />
                              </div>
                              <span className="font-mono font-bold text-sm" style={{ color: barColor }}>{rate.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─ Tab: Compliance ─ */}
        {activeTab === "compliance" && compliance && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800">Regulatory Compliance Check</h2>
              <div className="flex gap-2">
                {complianceSummary.pass > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{complianceSummary.pass} Pass</span>}
                {complianceSummary.caution > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">{complianceSummary.caution} Caution</span>}
                {complianceSummary.fail > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{complianceSummary.fail} Fail</span>}
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-5">Automated check against real-world AI fairness regulations. Not a substitute for legal advice.</p>
            <div className="space-y-3">
              {compliance.map((check) => (
                <ComplianceCard key={check.id} check={check} />
              ))}
            </div>
          </div>
        )}

        {/* ─ Tab: AI Narrative ─ */}
        {activeTab === "narrative" && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">✨</div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">AI-Generated Audit Narrative</h2>
                  <p className="text-sm text-slate-400">Gemini analyzes your bias metrics and generates a plain-English executive report for non-technical stakeholders.</p>
                </div>
              </div>

              {!narrative && !narrativeLoading && (
                <div>
                  {showApiKeyInput && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 block mb-1">Google AI API Key</label>
                      <input
                        type="password"
                        placeholder="AIza..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                      />
                      <p className="text-xs text-slate-400 mt-1">Stored locally in your browser. Get a key at aistudio.google.com</p>
                    </div>
                  )}
                  {narrativeError && !showApiKeyInput && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{narrativeError}</div>
                  )}
                  <button
                    onClick={generateNarrative}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-200/50 hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate AI Report
                  </button>
                </div>
              )}

              {narrativeLoading && (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-500 font-medium">Gemini is analyzing your bias metrics…</span>
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
                    <button
                      onClick={() => {
                        const blob = new Blob([narrative], { type: "text/plain" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `fairsight-narrative-${Date.now()}.txt`;
                        a.click();
                      }}
                      className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" /></svg>
                      Download Report
                    </button>
                    <button
                      onClick={() => { setNarrative(""); setNarrativeError(""); }}
                      className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─ Tab: Remediation ─ */}
        {activeTab === "remediation" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-bold text-slate-800">Remediation Roadmap</h2>
              <span className="text-sm bg-gradient-to-r from-brand-50 to-purple-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-semibold">
                {remediations.length} recommendations
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-5">Prioritized, actionable steps — from data preprocessing to governance policies.</p>
            <div className="space-y-3">
              {remediations.map((r, i) => (
                <RemediationCard key={r.title} remediation={r} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-400">
          <strong className="text-slate-600">Important: </strong>
          FairSight provides statistical indicators of potential bias. Results should be interpreted alongside domain expertise, legal context, and qualitative assessment. Fairness is multidimensional — satisfying one metric may trade off against another.
        </div>
      </div>
    </div>
  );
}
