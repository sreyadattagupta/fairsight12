"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { detectColumnTypes } from "@/lib/biasAnalysis";
import { parseDataset, analyzeDataQuality, imputeMissingValues, analyzeClassImbalance } from "@/lib/dataParser";

const STEPS = [
  { label: "Upload Dataset", icon: "⬆️" },
  { label: "Select Columns", icon: "⚙️" },
  { label: "Configure & Run", icon: "🚀" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [parseError, setParseError] = useState("");
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [imputeStrategy, setImputeStrategy] = useState("drop");
  const [columnTypes, setColumnTypes] = useState({});
  const [protectedAttrs, setProtectedAttrs] = useState([]);
  const [targetCol, setTargetCol] = useState("");
  const [favorableValues, setFavorableValues] = useState([]);
  const [actualCol, setActualCol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file) return;
    setParseError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseDataset(e.target.result, file.name);
        if (!parsed.data.length) throw new Error("Dataset is empty — needs at least one data row.");
        let processed = parsed.data;
        if (imputeStrategy !== "none") {
          processed = imputeMissingValues(parsed.data, imputeStrategy);
        }
        if (!processed.length) throw new Error("No rows remain after applying missing-value strategy. Try 'Keep As-Is'.");
        setHeaders(parsed.headers);
        setData(processed);
        setFileName(file.name);
        setFileFormat(parsed.format);
        const quality = analyzeDataQuality(processed, parsed.headers);
        setDataQuality(quality);
        const types = detectColumnTypes(processed);
        setColumnTypes(types);
        setProtectedAttrs(parsed.headers.filter((c) => types[c]?.likelyProtected));
        const likelyTarget = parsed.headers.find((c) => types[c]?.likelyTarget);
        if (likelyTarget) setTargetCol(likelyTarget);
        setStep(1);
      } catch (err) {
        setParseError(err.message);
      }
    };
    reader.readAsText(file);
  }, [imputeStrategy]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const toggleProtectedAttr = (col) => {
    setProtectedAttrs((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const toggleFavorableValue = (val) => {
    setFavorableValues((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const targetUniqueValues = targetCol
    ? [...new Set(data.slice(0, 500).map((r) => String(r[targetCol] ?? "")))].filter(Boolean).slice(0, 20)
    : [];

  const canProceedStep1 = protectedAttrs.length > 0 && targetCol;
  const canProceedStep2 = favorableValues.length > 0;

  const handleRun = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, protectedAttributes: protectedAttrs, targetColumn: targetCol, favorableValues, actualColumn: actualCol || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Analysis failed");
      localStorage.setItem("fairsight_results", JSON.stringify(json.results));
      localStorage.setItem("fairsight_filename", fileName);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
      <Navbar />

      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Step indicator */}
        <div className="relative flex items-center justify-between mb-14">
          {/* Track line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-brand-500 to-purple-500 z-10 transition-all duration-500"
            style={{ width: step === 0 ? "0%" : step === 1 ? "50%" : "100%" }}
          />

          {STEPS.map((s, i) => (
            <div key={s.label} className="relative z-20 flex flex-col items-center gap-2">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                  i < step
                    ? "bg-gradient-to-br from-brand-500 to-purple-600 border-brand-500 text-white shadow-lg shadow-brand-200"
                    : i === step
                    ? "bg-white border-brand-500 text-brand-600 shadow-lg shadow-brand-100"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                {i < step ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-base">{s.icon}</span>
                )}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-brand-700" : i < step ? "text-slate-500" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* ─ Step 0: Upload ─ */}
        {step === 0 && (
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Upload Your Dataset</h1>
            <p className="text-slate-500 mb-8">
              Upload a CSV with decision data — hiring records, loan applications, medical assessments.
            </p>

            <div
              className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-brand-500 bg-brand-50 scale-[1.01]"
                  : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/30"
              }`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 transition-all duration-200 ${dragActive ? "bg-brand-500 scale-110" : "bg-gradient-to-br from-brand-100 to-purple-100"}`}>
                <svg className={`w-10 h-10 transition-colors ${dragActive ? "text-white" : "text-brand-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <p className="text-slate-800 font-semibold text-lg mb-1">
                {dragActive ? "Release to upload" : "Drop your CSV file here"}
              </p>
              <p className="text-slate-400 text-sm">or click to browse — up to 100,000 rows</p>
            </div>

            {parseError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex gap-3 text-sm text-red-700 animate-scale-in">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {parseError}
              </div>
            )}

            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-7">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🧪</div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Try our sample dataset</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Download a synthetic hiring dataset with embedded gender and race bias — perfect for exploring FairSight.
                  </p>
                  <button
                    onClick={(e) => {
                      const csv = generateSampleCsv();
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "sample-hiring.csv"; a.click();
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Sample CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ Step 1: Columns ─ */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Select Columns</h1>
            <p className="text-slate-500 mb-8">
              <span className="font-semibold text-slate-700">{fileName}</span>{" "}
              — {data.length.toLocaleString()} rows · {headers.length} columns · auto-detected below
            </p>

            <div className="space-y-5">
              {/* Protected Attributes */}
              <Section
                icon="🛡️"
                title="Protected Attributes"
                badge="Required"
                badgeColor="red"
                desc="Demographic characteristics — gender, race, age, disability, nationality…"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {headers.map((col) => (
                    <ColumnChip
                      key={col}
                      col={col}
                      meta={columnTypes[col]}
                      selected={protectedAttrs.includes(col)}
                      color="brand"
                      onClick={() => toggleProtectedAttr(col)}
                    />
                  ))}
                </div>
              </Section>

              {/* Target Column */}
              <Section
                icon="🎯"
                title="Outcome / Decision Column"
                badge="Required"
                badgeColor="red"
                desc="The column representing the model's decision — hired, approved, granted, etc."
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {headers.filter((c) => !protectedAttrs.includes(c)).map((col) => (
                    <ColumnChip
                      key={col}
                      col={col}
                      meta={columnTypes[col]}
                      selected={targetCol === col}
                      color="emerald"
                      onClick={() => { setTargetCol(col); setFavorableValues([]); }}
                    />
                  ))}
                </div>
              </Section>

              {/* Actual Labels */}
              <Section
                icon="✓"
                title="Ground Truth Labels"
                badge="Optional"
                badgeColor="slate"
                desc="Actual outcomes (not predictions) — enables Equal Opportunity and Predictive Parity metrics."
              >
                <select
                  className="w-full max-w-xs border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
                  value={actualCol}
                  onChange={(e) => setActualCol(e.target.value)}
                >
                  <option value="">— None —</option>
                  {headers.filter((c) => c !== targetCol && !protectedAttrs.includes(c)).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Section>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-200"
              >
                Continue
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ─ Step 2: Configure ─ */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Configure Analysis</h1>
            <p className="text-slate-500 mb-8">Define what counts as a favorable outcome to complete setup.</p>

            <Section
              icon="✅"
              title={`Favorable Values in "${targetCol}"`}
              badge="Required"
              badgeColor="red"
              desc={`Which values mean a positive decision? (e.g., "1", "Yes", "Hired", "Approved")`}
            >
              <div className="flex flex-wrap gap-2">
                {targetUniqueValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => toggleFavorableValue(val)}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                      favorableValues.includes(val)
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-md shadow-emerald-100"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {val}
                    {favorableValues.includes(val) && <span className="ml-1.5">✓</span>}
                  </button>
                ))}
              </div>
            </Section>

            {/* Summary card */}
            <div className="mt-5 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Configuration Summary</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ["Dataset", `${fileName} (${data.length.toLocaleString()} rows)`],
                  ["Protected Attributes", protectedAttrs.join(", ") || "—"],
                  ["Outcome Column", targetCol],
                  ["Favorable Values", favorableValues.join(", ") || "—"],
                  ...(actualCol ? [["Ground Truth", actualCol]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="text-slate-400 w-40 flex-shrink-0">{k}</dt>
                    <dd className="text-slate-800 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex gap-3 text-sm text-red-700 animate-scale-in">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                disabled={!canProceedStep2 || loading}
                onClick={handleRun}
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-10 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-brand-200/60 hover:shadow-2xl hover:-translate-y-0.5 text-base"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  <>
                    🚀 Run Fairness Analysis
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─ Sub-components ─ */
function Section({ icon, title, badge, badgeColor, desc, children }) {
  const badgeClasses = {
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="font-bold text-slate-800">{title}</h2>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${badgeClasses[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-5 ml-7">{desc}</p>
      {children}
    </div>
  );
}

function ColumnChip({ col, meta, selected, color, onClick }) {
  const colors = {
    brand: selected
      ? "border-brand-500 bg-gradient-to-br from-brand-50 to-indigo-50 text-brand-700 shadow-md shadow-brand-100"
      : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
    emerald: selected
      ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-md shadow-emerald-100"
      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300",
  };
  return (
    <button
      onClick={onClick}
      className={`relative text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 group ${colors[color]}`}
    >
      {meta?.likelyProtected && color === "brand" && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-white" />
      )}
      {meta?.likelyTarget && color === "emerald" && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      )}
      <div className="font-semibold truncate">{col}</div>
      <div className="text-xs opacity-60 mt-0.5">
        {meta?.uniqueCount} unique{(meta?.likelyProtected && color === "brand") || (meta?.likelyTarget && color === "emerald") ? " · suggested" : ""}
      </div>
    </button>
  );
}

function generateSampleCsv() {
  const rows = ["age,gender,race,education,years_experience,zip_code,hired"];
  const genders = ["Male", "Female", "Non-binary"];
  const races = ["White", "Black", "Hispanic", "Asian"];
  const educations = ["High School", "Bachelor", "Master", "PhD"];
  for (let i = 0; i < 500; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const race = races[Math.floor(Math.random() * races.length)];
    const edu = educations[Math.floor(Math.random() * educations.length)];
    const age = Math.floor(Math.random() * 40) + 22;
    const exp = Math.floor(Math.random() * 20);
    const zip = Math.floor(Math.random() * 90000) + 10000;
    let p = 0.35;
    if (gender === "Male") p += 0.18;
    if (race === "White") p += 0.15;
    if (race === "Asian") p += 0.05;
    if (edu === "Master") p += 0.15;
    if (edu === "PhD") p += 0.2;
    if (exp > 10) p += 0.1;
    rows.push(`${age},${gender},${race},${edu},${exp},${zip},${Math.random() < Math.min(p, 0.9) ? 1 : 0}`);
  }
  return rows.join("\n");
}
