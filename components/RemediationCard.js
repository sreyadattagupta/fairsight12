"use client";
import { useState } from "react";

const categoryMeta = {
  "Pre-processing": { icon: "⚙️", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
  "In-processing": { icon: "🧠", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50" },
  "Post-processing": { icon: "🎯", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
  "Data Curation": { icon: "🗂️", gradient: "from-orange-500 to-amber-600", bg: "bg-orange-50" },
  "Governance": { icon: "📋", gradient: "from-slate-500 to-slate-700", bg: "bg-slate-50" },
};

const severityConfig = {
  high: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "High Priority" },
  medium: { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", label: "Medium Priority" },
  low: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400", label: "Low Priority" },
};

export default function RemediationCard({ remediation, index }) {
  const [open, setOpen] = useState(index === 0);
  const { category, title, severity, description, steps, impact } = remediation;
  const meta = categoryMeta[category] || categoryMeta["Governance"];
  const sev = severityConfig[severity] || severityConfig.low;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${open ? "border-brand-200 shadow-md shadow-brand-50" : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        {/* Category icon */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
          {meta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${sev.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
              {sev.label}
            </span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{category}</span>
          </div>
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{description}</p>
        </div>

        <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-200 ${open ? "bg-brand-100 rotate-180" : "hover:bg-slate-200"}`}>
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-6 pt-0 border-t border-slate-100 animate-fade-in-up">
          <p className="text-sm text-slate-600 leading-relaxed mt-4 mb-5">{description}</p>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Implementation Steps</h4>
          <ol className="space-y-3 mb-5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className={`flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br ${meta.gradient} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-xl">📈</span>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Expected Impact</span>
              <p className="text-sm text-emerald-800 mt-0.5 font-medium">{impact}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
