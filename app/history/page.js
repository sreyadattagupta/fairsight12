"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { loadHistory, deleteFromHistory, clearHistory } from "@/lib/history";
import { useAuth } from "@/lib/authContext";

function ScoreBadge({ score }) {
  const color = score >= 80 ? "emerald" : score >= 60 ? "yellow" : "red";
  const cls = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[color];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      <span className="font-mono text-sm">{score}</span>
      <span className="opacity-60">/100</span>
    </span>
  );
}

function StatusDot({ score }) {
  if (score >= 80) return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />;
  if (score >= 60) return <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />;
  return <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState("all"); // all | dataset | model
  const [dbActivity, setDbActivity] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  useEffect(() => {
    if (!user) return;
    setDbLoading(true);
    fetch("/api/activity?limit=50")
      .then((r) => r.json())
      .then((d) => setDbActivity(d.activities || []))
      .catch(() => {})
      .finally(() => setDbLoading(false));
  }, [user]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  const handleDelete = (id) => {
    deleteFromHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClear = () => {
    clearHistory();
    setEntries([]);
    setConfirmClear(false);
  };

  const handleReload = (entry) => {
    if (entry.type === "model") {
      localStorage.setItem("fairsight_model_results", JSON.stringify(entry.results));
      localStorage.setItem("fairsight_model_name", entry.modelName || entry.filename);
      router.push("/model-dashboard");
    } else {
      localStorage.setItem("fairsight_results", JSON.stringify(entry.results));
      localStorage.setItem("fairsight_filename", entry.filename);
      router.push("/dashboard");
    }
  };

  const groupByDate = (entries) => {
    const groups = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/20">
      <Navbar />
      <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl shadow-lg">🕐</div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Analysis History</h1>
                <p className="text-slate-400 text-sm">{entries.length} saved {entries.length === 1 ? "analysis" : "analyses"}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            {entries.length > 0 && (
              confirmClear ? (
                <div className="flex gap-2">
                  <button onClick={handleClear} className="text-sm font-semibold px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all">
                    Confirm Clear
                  </button>
                  <button onClick={() => setConfirmClear(false)} className="text-sm px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmClear(true)}
                  className="text-sm text-slate-400 hover:text-red-600 px-4 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-all">
                  Clear All
                </button>
              )
            )}
            <Link href="/analyze"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:-translate-y-0.5 transition-all">
              + New Analysis
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        {entries.length > 0 && (
          <div className="flex gap-2 mb-6">
            {[
              { val: "all", label: "All", count: entries.length },
              { val: "dataset", label: "Dataset", count: entries.filter(e => e.type === "dataset").length },
              { val: "model", label: "Model", count: entries.filter(e => e.type === "model").length },
            ].map((t) => (
              <button key={t.val} onClick={() => setFilter(t.val)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === t.val ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === t.val ? "bg-white/20" : "bg-slate-100"}`}>{t.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl mb-5">🕐</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">No analyses yet</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Run a dataset or model fairness analysis — it will automatically appear here.
            </p>
            <Link href="/analyze"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
              Start First Analysis
            </Link>
          </div>
        )}

        {/* DB activity feed for logged-in users */}
        {user && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account Activity</h2>
              <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 border border-brand-200 rounded-full font-medium">synced</span>
            </div>
            {dbLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {!dbLoading && dbActivity.length === 0 && (
              <p className="text-sm text-slate-400 italic">No server activity yet.</p>
            )}
            {!dbLoading && dbActivity.length > 0 && (
              <div className="space-y-2">
                {dbActivity.map((act) => {
                  const icons = {
                    dataset_analysis: "📊",
                    model_analysis: "🤖",
                    narrative_generated: "✍️",
                    history_viewed: "🕐",
                    login: "🔐",
                    register: "🎉",
                  };
                  return (
                    <div key={act._id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                      <span className="text-lg flex-shrink-0">{icons[act.type] || "📋"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{act.label}</p>
                        {act.meta?.filename && (
                          <p className="text-xs text-slate-400 truncate">{act.meta.filename}</p>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(act.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      {act.meta?.fairnessScore != null && (
                        <ScoreBadge score={Math.round(act.meta.fairnessScore)} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Grouped entries */}
        {Object.entries(grouped).map(([date, dayEntries]) => (
          <div key={date} className="mb-8">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">{date}</h2>
            <div className="space-y-3">
              {dayEntries.map((entry) => (
                <div key={entry.id}
                  className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${entry.type === "model" ? "bg-gradient-to-br from-purple-100 to-brand-100" : "bg-gradient-to-br from-blue-100 to-indigo-100"}`}>
                      {entry.type === "model" ? "🤖" : "📊"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <StatusDot score={entry.fairnessScore} />
                            <h3 className="font-bold text-slate-800 truncate">{entry.filename}</h3>
                            {entry.modelName && entry.modelName !== entry.filename && (
                              <span className="text-xs text-slate-400 truncate">· {entry.modelName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                            <span>{new Date(entry.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>·</span>
                            <span>{entry.totalRows?.toLocaleString()} rows</span>
                            {entry.protectedAttributes?.length > 0 && (
                              <>
                                <span>·</span>
                                <span>Protected: {entry.protectedAttributes.join(", ")}</span>
                              </>
                            )}
                            {entry.isRegression && (
                              <>
                                <span>·</span>
                                <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-md">Regression</span>
                              </>
                            )}
                          </div>
                        </div>
                        {entry.fairnessScore !== null && <ScoreBadge score={entry.fairnessScore} />}
                      </div>

                      {/* Fairness level */}
                      {entry.fairnessLevel && (
                        <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${
                          entry.fairnessScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          entry.fairnessScore >= 60 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {entry.fairnessScore >= 80 ? "✅" : entry.fairnessScore >= 60 ? "⚠️" : "🚨"}
                          {entry.fairnessLevel}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleReload(entry)}
                        className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="inline-flex items-center text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
