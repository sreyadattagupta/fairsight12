export function clsx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatPercent(v, decimals = 1) {
  if (v === null || v === undefined) return "N/A";
  return `${(v * 100).toFixed(decimals)}%`;
}

export function formatRatio(v, decimals = 3) {
  if (v === null || v === undefined) return "N/A";
  return v.toFixed(decimals);
}

export function getBiasColor(value, type) {
  if (type === "dpd") {
    // Demographic Parity Difference: ideal 0, flagged > |0.1|
    const abs = Math.abs(value);
    if (abs <= 0.05) return { color: "text-emerald-600", bg: "bg-emerald-50", label: "Fair" };
    if (abs <= 0.1) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Caution" };
    return { color: "text-red-600", bg: "bg-red-50", label: "Biased" };
  }
  if (type === "dir") {
    // Disparate Impact Ratio: ideal 1, < 0.8 biased
    if (value >= 0.9) return { color: "text-emerald-600", bg: "bg-emerald-50", label: "Fair" };
    if (value >= 0.8) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Caution" };
    return { color: "text-red-600", bg: "bg-red-50", label: "Biased" };
  }
  return { color: "text-slate-600", bg: "bg-slate-50", label: "Unknown" };
}

export function getFairnessColor(score) {
  if (score >= 80) return { color: "#10B981", label: "Fair", ring: "ring-emerald-500" };
  if (score >= 60) return { color: "#F59E0B", label: "Moderate", ring: "ring-yellow-500" };
  return { color: "#EF4444", label: "Biased", ring: "ring-red-500" };
}

export function getSeverityBadge(severity) {
  const map = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return map[severity] || map.low;
}

export function truncate(str, n = 20) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}
