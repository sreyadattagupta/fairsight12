"use client";
import { getBiasColor } from "@/lib/utils";

export default function BiasMetricCard({ title, subtitle, value, type, description, tooltip }) {
  const { color, bg, label } = getBiasColor(value, type);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
          label === "Fair"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : label === "Caution"
            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {label}
        </span>
      </div>

      <div className={`text-3xl font-bold ${color} mb-1`}>
        {value !== null && value !== undefined ? value.toFixed(3) : "N/A"}
      </div>

      {description && <p className="text-xs text-slate-500 mt-3 leading-relaxed">{description}</p>}

      {tooltip && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">{tooltip}</p>
        </div>
      )}
    </div>
  );
}
