"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { parseDataset, analyzeDataQuality, imputeMissingValues, detectColumnRole } from "@/lib/dataParser";

const STEPS = [
  { label: "Upload Model", icon: "🤖" },
  { label: "Upload Dataset", icon: "📊" },
  { label: "Map Features", icon: "🔗" },
  { label: "Configure & Run", icon: "🚀" },
];

const SUPPORTED_MODEL_FORMATS = [
  { ext: ".onnx", name: "ONNX", desc: "Exports from sklearn, PyTorch, TensorFlow, XGBoost, LightGBM" },
];

const ENCODE_MODES = [
  { val: "label", label: "Label Encoding", desc: "Int index per category — sklearn, XGBoost, LightGBM" },
  { val: "onehot", label: "One-Hot Encoding", desc: "Binary vector per category — neural networks, PyTorch, TF/Keras" },
];

const NORMALIZE_MODES = [
  { val: "minmax", label: "Min-Max [0,1]", desc: "Default — sklearn, tree-based models" },
  { val: "zscore", label: "Z-Score (μ=0, σ=1)", desc: "Better for neural networks, SVM" },
];

const TASK_TYPES = [
  { val: "auto", label: "Auto-Detect", desc: "Inferred from model output shape & values" },
  { val: "binary", label: "Binary Classification", desc: "Output is 0 or 1" },
  { val: "multiclass", label: "Multi-Class Classification", desc: "Output is class index or probability vector" },
  { val: "regression", label: "Regression", desc: "Output is a continuous numeric value" },
];

const PYTHON_EXAMPLES = [
  {
    title: "scikit-learn",
    code: `from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Convert any sklearn pipeline/model
initial_type = [('float_input', FloatTensorType([None, X_train.shape[1]]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)

with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())`,
  },
  {
    title: "PyTorch",
    code: `import torch

dummy_input = torch.randn(1, num_features)
torch.onnx.export(
    model, dummy_input, "model.onnx",
    export_params=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch'}, 'output': {0: 'batch'}}
)`,
  },
  {
    title: "TensorFlow / Keras",
    code: `import tf2onnx
import tensorflow as tf

spec = (tf.TensorSpec((None, num_features), tf.float32),)
model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec)

with open("model.onnx", "wb") as f:
    f.write(model_proto.SerializeToString())`,
  },
  {
    title: "XGBoost / LightGBM",
    code: `# XGBoost
from skl2onnx.common.data_types import FloatTensorType
from onnxmltools import convert_xgboost
initial_type = [('float_input', FloatTensorType([None, n_features]))]
onnx_model = convert_xgboost(xgb_model, initial_types=initial_type)

# LightGBM
from onnxmltools import convert_lightgbm
onnx_model = convert_lightgbm(lgb_model, initial_types=initial_type)`,
  },
];

export default function ModelPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [codeTab, setCodeTab] = useState(0);

  // Model state
  const [modelFile, setModelFile] = useState(null);
  const [modelBuffer, setModelBuffer] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [modelError, setModelError] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  const modelRef = useRef();

  // Dataset state
  const [dataFile, setDataFile] = useState(null);
  const [dataHeaders, setDataHeaders] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [dataError, setDataError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [imputeStrategy, setImputeStrategy] = useState("drop");
  const dataRef = useRef();

  // Encoding & task config
  const [encodeMode, setEncodeMode] = useState("label");
  const [normalizeMode, setNormalizeMode] = useState("minmax");
  const [taskType, setTaskType] = useState("auto");
  const [regressionThreshold, setRegressionThreshold] = useState("0.5");
  const [encodedDim, setEncodedDim] = useState(null);

  // Feature mapping
  const [featureCols, setFeatureCols] = useState([]);
  const [textCols, setTextCols] = useState([]);
  const [protectedAttrs, setProtectedAttrs] = useState([]);
  const [targetCol, setTargetCol] = useState("");
  const [favorableValues, setFavorableValues] = useState([]);
  const [labelCol, setLabelCol] = useState("");

  // Run state
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runError, setRunError] = useState("");

  // ─── Model Loading ───────────────────────────────────────────────────────
  const handleModelFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".onnx")) {
      setModelError("Only .onnx files supported. See export instructions below.");
      return;
    }
    setModelError("");
    setModelLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const { loadOnnxModel } = await import("@/lib/modelLoader");
      const handle = await loadOnnxModel(buf);
      setModelBuffer(buf);
      setModelFile(file);
      setModelInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        inputNames: handle.inputNames,
        outputNames: handle.outputNames,
        handle,
      });
      setStep(1);
    } catch (err) {
      setModelError(err.message);
    } finally {
      setModelLoading(false);
    }
  };

  // ─── Dataset Loading ─────────────────────────────────────────────────────
  const handleDataFile = useCallback((file) => {
    if (!file) return;
    setDataError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { headers, data, format } = parseDataset(e.target.result, file.name);
        let processed = data;
        if (imputeStrategy !== "none") {
          processed = imputeMissingValues(data, imputeStrategy);
        }
        setDataHeaders(headers);
        setDataRows(processed);
        setDataFile({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB", format, rawRows: data.length, cleanRows: processed.length });
        const quality = analyzeDataQuality(processed, headers);
        setDataQuality(quality);
        // Detect text columns (unsuitable as model features without embedding)
        const detected = headers.filter((h) => detectColumnRole(processed, h) === "text");
        setTextCols(detected);
        // Auto-select feature cols = numeric + low_cardinality (excluding text)
        const numericAndCat = headers.filter((h) => {
          const role = quality.columns[h]?.role;
          return role === "numeric" || role === "binary" || role === "low_cardinality";
        });
        setFeatureCols(numericAndCat);
        setStep(2);
      } catch (err) {
        setDataError(err.message);
      }
    };
    reader.readAsText(file);
  }, [imputeStrategy]);

  // ─── Feature toggle ───────────────────────────────────────────────────────
  const toggleFeature = (col) => {
    setFeatureCols((p) => {
      const next = p.includes(col) ? p.filter((c) => c !== col) : [...p, col];
      return next;
    });
  };
  const toggleProtected = (col) =>
    setProtectedAttrs((p) => p.includes(col) ? p.filter((c) => c !== col) : [...p, col]);
  const toggleFavorable = (v) =>
    setFavorableValues((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const targetUniqueVals = targetCol
    ? [...new Set(dataRows.slice(0, 500).map((r) => String(r[targetCol] ?? "")))].filter(Boolean).slice(0, 20)
    : [];

  const isRegressionMode = taskType === "regression";

  // ─── Run Analysis ─────────────────────────────────────────────────────────
  const handleRun = async () => {
    setRunning(true);
    setRunError("");
    setProgress(0);
    try {
      const {
        loadOnnxModel, buildEncoders, getEncodedDim, runBatchInference,
        attachPredictions, thresholdRegressionPredictions, permutationImportance,
      } = await import("@/lib/modelLoader");

      const { analyzeDataset } = await import("@/lib/biasAnalysis");
      const {
        counterfactualFairness, theilIndex, betweenGroupVariance,
      } = await import("@/lib/advancedMetrics");

      setProgress(0.05);
      const handle = await loadOnnxModel(modelBuffer);
      setProgress(0.1);

      const encoders = buildEncoders(dataRows, featureCols, { encodeMode, normalizeMode });
      const dim = getEncodedDim(featureCols, encoders);
      setEncodedDim(dim);
      setProgress(0.15);

      // Run inference
      const { predictions, probabilities, task, numClasses } = await runBatchInference(
        handle, dataRows, featureCols, encoders, 64,
        (p) => setProgress(0.15 + p * 0.45),
        { taskHint: taskType }
      );
      setProgress(0.6);

      const detectedTask = task;
      let augmented = attachPredictions(dataRows, predictions, probabilities, detectedTask);
      let predCol = "__pred__";

      // For regression: threshold into binary for bias analysis
      const threshold = parseFloat(regressionThreshold) || 0.5;
      if (detectedTask === "regression") {
        augmented = thresholdRegressionPredictions(augmented, predCol, threshold);
        predCol = "__pred_binary__";
      }

      const favVals = favorableValues.length ? favorableValues : ["1"];
      const biasResults = analyzeDataset({
        data: augmented,
        protectedAttributes: protectedAttrs,
        targetColumn: predCol,
        favorableValues: favVals,
        actualColumn: labelCol || null,
        regressionThreshold: detectedTask === "regression" ? threshold : null,
      });
      setProgress(0.7);

      // Advanced metrics
      const cf = counterfactualFairness(augmented, protectedAttrs[0], predCol, favVals);
      const theil = theilIndex(augmented, predCol, favVals);
      const bgv = betweenGroupVariance(augmented, protectedAttrs[0], predCol, favVals);
      setProgress(0.8);

      // Feature importance (permutation, limited sample)
      let featureImportance = null;
      try {
        featureImportance = await permutationImportance(
          handle, dataRows.slice(0, 150), featureCols, encoders,
          labelCol || "__pred__", favVals, 150, detectedTask
        );
      } catch { /* skip if label col not available */ }
      setProgress(0.95);

      const modelMeta = {
        modelName: modelFile.name,
        modelSize: modelFile.size,
        inputNames: handle.inputNames,
        outputNames: handle.outputNames,
        featureCols,
        protectedAttrs,
        totalRows: augmented.length,
        detectedTask,
        numClasses,
        encodedInputDim: dim,
        encodeMode,
        normalizeMode,
        regressionThreshold: detectedTask === "regression" ? threshold : null,
        predictedPositiveRate: predictions.filter(
          (p) => p !== null && Math.round(Number(p)) === 1
        ).length / predictions.length,
      };

      const fullResults = {
        ...biasResults,
        modelMeta,
        featureImportance,
        advancedMetrics: { counterfactual: cf, theil, betweenGroupVariance: bgv },
        isModelAnalysis: true,
      };

      localStorage.setItem("fairsight_model_results", JSON.stringify(fullResults));
      localStorage.setItem("fairsight_model_name", modelFile.name);
      router.push("/model-dashboard");
    } catch (err) {
      setRunError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const canRunStep3 = featureCols.length > 0 && protectedAttrs.length > 0;
  const canRunStep4 = isRegressionMode ? true : favorableValues.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <Navbar />
      <div className="h-1 bg-gradient-to-r from-purple-500 via-brand-500 to-pink-500" />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Step indicator */}
        <div className="relative flex items-center justify-between mb-14">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-brand-500 z-10 transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => (
            <div key={s.label} className="relative z-20 flex flex-col items-center gap-2">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                i < step ? "bg-gradient-to-br from-purple-500 to-brand-600 border-purple-500 text-white shadow-lg"
                : i === step ? "bg-white border-brand-500 shadow-lg" : "bg-white border-slate-200 text-slate-400"
              }`}>
                {i < step ? "✓" : s.icon}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-brand-700" : i < step ? "text-slate-500" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* ─ Step 0: Upload Model ─ */}
        {step === 0 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center text-2xl shadow-lg">🤖</div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Upload Your ML/DL Model</h1>
                <p className="text-slate-500">ONNX format — export from any framework</p>
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-200 mb-6 ${
                dragActive ? "border-purple-500 bg-purple-50 scale-[1.01]" : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30"
              }`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleModelFile(e.dataTransfer.files[0]); }}
              onClick={() => modelRef.current?.click()}
            >
              <input ref={modelRef} type="file" accept=".onnx" className="hidden" onChange={(e) => handleModelFile(e.target.files[0])} />
              {modelLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-purple-700 font-semibold">Loading model into WebAssembly runtime…</p>
                </div>
              ) : (
                <>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 transition-all ${dragActive ? "bg-purple-500 scale-110" : "bg-gradient-to-br from-purple-100 to-brand-100"}`}>
                    <svg className={`w-10 h-10 ${dragActive ? "text-white" : "text-purple-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9m-9-6l6 6m-6-6v6h6" />
                    </svg>
                  </div>
                  <p className="font-semibold text-slate-800 text-lg mb-1">Drop your .onnx model here</p>
                  <p className="text-slate-400 text-sm">sklearn · PyTorch · TensorFlow · XGBoost · LightGBM</p>
                </>
              )}
            </div>

            {modelError && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 animate-scale-in flex gap-3">
                <span className="text-lg">⚠️</span> {modelError}
              </div>
            )}

            {/* Export instructions */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-lg">How to export your model to ONNX</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                {PYTHON_EXAMPLES.map((e, i) => (
                  <button
                    key={e.title}
                    onClick={() => setCodeTab(i)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${codeTab === i ? "bg-brand-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"}`}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
              <pre className="bg-slate-900 text-green-300 rounded-2xl p-5 text-xs overflow-x-auto leading-relaxed">
                {PYTHON_EXAMPLES[codeTab].code}
              </pre>
            </div>
          </div>
        )}

        {/* ─ Step 1: Upload Dataset ─ */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setStep(0)} className="text-slate-400 hover:text-slate-700 mr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-md">📊</div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Upload Test Dataset</h1>
                <p className="text-slate-400 text-sm">CSV, TSV, JSON, or JSONL</p>
              </div>
            </div>

            {/* Model loaded badge */}
            <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-6">
              <span className="text-lg">🤖</span>
              <div>
                <div className="text-sm font-bold text-purple-900">{modelInfo?.name}</div>
                <div className="text-xs text-purple-600">{modelInfo?.size} · Inputs: {modelInfo?.inputNames?.join(", ")} · Outputs: {modelInfo?.outputNames?.join(", ")}</div>
              </div>
              <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Loaded</span>
            </div>

            {/* Imputation strategy */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3">Missing Value Strategy</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: "drop", label: "Drop Rows", desc: "Remove rows with any null" },
                  { val: "mean", label: "Mean / Mode Fill", desc: "Fill with column average" },
                  { val: "none", label: "Keep As-Is", desc: "No imputation" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setImputeStrategy(opt.val)}
                    className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl border text-sm transition-all text-left ${imputeStrategy === opt.val ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Encoding & normalization */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3">Feature Encoding</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Categorical Encoding</p>
                  <div className="flex flex-col gap-2">
                    {ENCODE_MODES.map((opt) => (
                      <button key={opt.val} onClick={() => setEncodeMode(opt.val)}
                        className={`px-4 py-3 rounded-xl border text-sm transition-all text-left ${encodeMode === opt.val ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 bg-white text-slate-600 hover:border-purple-200"}`}>
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Numeric Normalization</p>
                  <div className="flex flex-col gap-2">
                    {NORMALIZE_MODES.map((opt) => (
                      <button key={opt.val} onClick={() => setNormalizeMode(opt.val)}
                        className={`px-4 py-3 rounded-xl border text-sm transition-all text-left ${normalizeMode === opt.val ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 bg-white text-slate-600 hover:border-purple-200"}`}>
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all mb-5 ${dragActive ? "border-brand-500 bg-brand-50 scale-[1.01]" : "border-slate-200 bg-white hover:border-brand-300"}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleDataFile(e.dataTransfer.files[0]); }}
              onClick={() => dataRef.current?.click()}
            >
              <input ref={dataRef} type="file" accept=".csv,.tsv,.json,.jsonl,.ndjson" className="hidden" onChange={(e) => handleDataFile(e.target.files[0])} />
              <div className="text-4xl mb-3">📂</div>
              <p className="font-semibold text-slate-700 text-lg mb-1">Drop dataset here</p>
              <p className="text-slate-400 text-sm">CSV · TSV · JSON · JSONL — up to 100K rows</p>
            </div>

            {dataError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 flex gap-3">
                <span>⚠️</span> {dataError}
              </div>
            )}
          </div>
        )}

        {/* ─ Step 2: Map Features ─ */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700 mr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-md">🔗</div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Map Features</h1>
                <p className="text-slate-400 text-sm">{dataFile?.name} · {dataRows.length.toLocaleString()} rows · {dataHeaders.length} columns · {dataFile?.format}</p>
              </div>
            </div>

            {/* Data quality badge */}
            {dataQuality && (
              <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 mb-5 border ${dataQuality.qualityScore >= 80 ? "bg-emerald-50 border-emerald-200" : dataQuality.qualityScore >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
                <span className="text-2xl">{dataQuality.qualityScore >= 80 ? "✅" : dataQuality.qualityScore >= 60 ? "⚠️" : "🚨"}</span>
                <div>
                  <div className="font-bold text-slate-800">Data Quality Score: {dataQuality.qualityScore}/100</div>
                  <div className="text-xs text-slate-500">{dataRows.length.toLocaleString()} clean rows · {Object.values(dataQuality.columns).filter(c => c.nullPct > 5).length} columns with high null rate</div>
                </div>
              </div>
            )}

            {/* Text columns warning */}
            {textCols.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 flex gap-3">
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Text columns detected</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {textCols.join(", ")} — these columns have high cardinality and likely contain free text.
                    They are excluded from auto-selected features. Include only if your model was trained with text embeddings.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Task type */}
              <SectionCard icon="🎯" gradient="from-orange-500 to-red-500" title="Model Task Type" badge="Important" badgeColor="slate"
                desc="How to interpret model outputs — affects prediction parsing and fairness metric calculations."
              >
                <div className="grid grid-cols-2 gap-2">
                  {TASK_TYPES.map((t) => (
                    <button key={t.val} onClick={() => setTaskType(t.val)}
                      className={`px-4 py-3 rounded-xl border text-sm transition-all text-left ${taskType === t.val ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md" : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"}`}>
                      <div className="font-semibold">{t.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                {taskType === "regression" && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-sm text-slate-600 font-medium">Decision threshold:</label>
                    <input
                      type="number" step="0.05" min="0" max="1"
                      value={regressionThreshold}
                      onChange={(e) => setRegressionThreshold(e.target.value)}
                      className="w-28 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span className="text-xs text-slate-400">predictions ≥ threshold → positive outcome</span>
                  </div>
                )}
              </SectionCard>

              {/* Model input features */}
              <SectionCard icon="⚙️" gradient="from-blue-500 to-indigo-600" title="Model Input Features" badge="Required" badgeColor="red"
                desc="Columns fed to the model for prediction. Must match the features used during training."
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dataHeaders.map((col) => (
                    <ColChip key={col} col={col} meta={dataQuality?.columns[col]} selected={featureCols.includes(col)} isText={textCols.includes(col)} color="blue" onClick={() => toggleFeature(col)} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Auto-selected: numeric &amp; categorical columns.
                  {encodeMode === "onehot" && dataQuality && (
                    <span className="ml-1 text-purple-600 font-medium">
                      One-hot encoding active — actual input dim will be larger than column count.
                    </span>
                  )}
                </p>
              </SectionCard>

              {/* Protected attributes */}
              <SectionCard icon="🛡️" gradient="from-purple-500 to-brand-600" title="Protected Attributes" badge="Required" badgeColor="red"
                desc="Demographic features to audit for bias — gender, race, age, etc. NOT fed to model."
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dataHeaders.filter(c => !featureCols.includes(c)).map((col) => (
                    <ColChip key={col} col={col} meta={dataQuality?.columns[col]} selected={protectedAttrs.includes(col)} color="purple" onClick={() => toggleProtected(col)} />
                  ))}
                </div>
              </SectionCard>

              {/* Ground truth (optional) */}
              <SectionCard icon="✓" gradient="from-emerald-500 to-teal-600" title="Ground Truth Labels" badge="Optional" badgeColor="slate"
                desc="Actual outcomes for computing Equal Opportunity, calibration, and permutation importance."
              >
                <select
                  className="border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={labelCol}
                  onChange={(e) => setLabelCol(e.target.value)}
                >
                  <option value="">— None —</option>
                  {dataHeaders.filter(c => !featureCols.includes(c) && !protectedAttrs.includes(c)).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </SectionCard>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                disabled={!canRunStep3}
                onClick={() => setStep(3)}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-200"
              >
                Continue
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ─ Step 3: Configure & Run ─ */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-700 mr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-md">🚀</div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Configure & Run</h1>
                <p className="text-slate-400 text-sm">Define favorable outcome, then run analysis</p>
              </div>
            </div>

            {isRegressionMode ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-5">
                <h3 className="font-bold text-slate-800 mb-1">Regression Decision Threshold</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Predictions ≥ threshold count as a positive outcome for fairness analysis.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number" step="0.05" min="0" max="10000"
                    value={regressionThreshold}
                    onChange={(e) => setRegressionThreshold(e.target.value)}
                    className="w-36 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono"
                  />
                  <span className="text-sm text-slate-500">
                    e.g., 0.5 for probability output, or the natural threshold for your target variable
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-5">
                <h3 className="font-bold text-slate-800 mb-1">Favorable Model Output Values</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Model predictions that represent a positive decision (e.g., "1", "True", "hired")
                </p>
                <p className="text-xs text-slate-400 mb-3">Common model output values:</p>
                <div className="flex flex-wrap gap-2">
                  {["1", "0", "true", "false", "yes", "no"].map((val) => (
                    <button
                      key={val}
                      onClick={() => toggleFavorable(val)}
                      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${favorableValues.includes(val) ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}
                    >
                      {val} {favorableValues.includes(val) && "✓"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Config summary */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 mb-5">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">Summary</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ["Model", `${modelFile?.name}`],
                  ["Dataset", `${dataFile?.name} (${dataRows.length.toLocaleString()} rows, ${dataFile?.format})`],
                  ["Input Features", `${featureCols.length} columns: ${featureCols.slice(0, 4).join(", ")}${featureCols.length > 4 ? "…" : ""}`],
                  ["Encoding", `${encodeMode === "onehot" ? "One-Hot" : "Label"} · ${normalizeMode === "zscore" ? "Z-Score" : "Min-Max"} normalization`],
                  ["Task Type", taskType.charAt(0).toUpperCase() + taskType.slice(1)],
                  ["Protected Attributes", protectedAttrs.join(", ")],
                  isRegressionMode
                    ? ["Decision Threshold", regressionThreshold]
                    : ["Favorable Outputs", favorableValues.join(", ") || "—"],
                  ...(labelCol ? [["Ground Truth", labelCol]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="text-slate-400 w-44 flex-shrink-0">{k}</dt>
                    <dd className="text-slate-800 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Progress bar */}
            {running && (
              <div className="bg-brand-50 border border-brand-200 rounded-2xl px-5 py-4 mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-brand-800">
                    {progress < 0.15 ? "Loading model…" : progress < 0.6 ? "Running inference…" : progress < 0.8 ? "Computing fairness metrics…" : "Computing feature importance…"}
                  </span>
                  <span className="ml-auto text-xs text-brand-600 font-mono">{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            )}

            {runError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 flex gap-3">
                <span>🚨</span> {runError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                disabled={!canRunStep4 || running}
                onClick={handleRun}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 disabled:opacity-40 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-purple-200/60 hover:-translate-y-0.5 text-base"
              >
                {running ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing Model…</>
                ) : (
                  <>🚀 Run Model Fairness Analysis<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ icon, gradient, title, badge, badgeColor, desc, children }) {
  const bc = { red: "bg-red-50 text-red-700 border-red-200", slate: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-base shadow-md`}>{icon}</div>
          <h2 className="font-bold text-slate-800">{title}</h2>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bc[badgeColor]}`}>{badge}</span>
      </div>
      <p className="text-sm text-slate-500 mb-4 ml-12">{desc}</p>
      {children}
    </div>
  );
}

function ColChip({ col, meta, selected, color, onClick, isText = false }) {
  const colors = {
    blue: selected ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md" : isText ? "border-amber-200 bg-amber-50 text-amber-700 opacity-80" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300",
    purple: selected ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-purple-300",
  };
  const roleLabel = meta?.role || (meta?.isNumeric ? "numeric" : "categorical");
  return (
    <button onClick={onClick} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${colors[color]}`}>
      <div className="font-semibold truncate flex items-center gap-1">
        {col}
        {isText && <span className="text-xs bg-amber-200 text-amber-700 px-1 rounded">text</span>}
      </div>
      <div className="text-xs opacity-60 mt-0.5">
        {roleLabel} · {meta?.uniqueCount} unique
        {meta?.nullPct > 5 ? ` · ${meta.nullPct.toFixed(0)}% null` : ""}
      </div>
    </button>
  );
}
