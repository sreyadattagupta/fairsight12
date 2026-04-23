/**
 * ONNX model loader and inference engine for browser.
 * Supports binary classification, multi-class classification, regression,
 * and deep learning models from sklearn, PyTorch, TensorFlow, XGBoost, etc.
 */

let ort = null;

async function getOrt() {
  if (!ort) {
    ort = await import("onnxruntime-web");
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
  }
  return ort;
}

// ─── Model Loading ────────────────────────────────────────────────────────

export async function loadOnnxModel(arrayBuffer) {
  const ort = await getOrt();
  try {
    const session = await ort.InferenceSession.create(arrayBuffer, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    return {
      session,
      inputNames: session.inputNames,
      outputNames: session.outputNames,
      inputMeta: Object.fromEntries(
        session.inputNames.map((name) => [name, session.inputMetadata?.[name] || {}])
      ),
    };
  } catch (err) {
    throw new Error(`Failed to load ONNX model: ${err.message}`);
  }
}

export function getModelInfo(modelHandle) {
  const { inputNames, outputNames, inputMeta } = modelHandle;
  return { inputNames, outputNames, inputMeta };
}

// ─── Feature Encoding ─────────────────────────────────────────────────────

/**
 * Build encoders for feature columns.
 * options.encodeMode: 'label' (default) | 'onehot' (better for neural networks)
 * options.normalizeMode: 'minmax' (default) | 'zscore' (better for neural networks)
 */
export function buildEncoders(data, featureCols, { encodeMode = "label", normalizeMode = "minmax" } = {}) {
  const encoders = {};
  featureCols.forEach((col) => {
    const vals = data.map((r) => r[col]).filter((v) => v !== null && v !== "" && v !== undefined);
    const isNumeric = vals.length > 0 && vals.every((v) => !isNaN(Number(v)));
    if (isNumeric) {
      const nums = vals.map(Number);
      // Safe min/max for large arrays (avoid spread stack overflow)
      let min = Infinity, max = -Infinity, sum = 0;
      for (const n of nums) {
        if (n < min) min = n;
        if (n > max) max = n;
        sum += n;
      }
      const mean = sum / nums.length;
      let variance = 0;
      for (const n of nums) variance += (n - mean) ** 2;
      const std = Math.sqrt(variance / nums.length) || 1;
      encoders[col] = { type: "numeric", min, max, mean, std, normalizeMode };
    } else {
      const unique = [...new Set(vals.map(String))].sort();
      encoders[col] = { type: "categorical", classes: unique, encodeMode };
    }
  });
  return encoders;
}

/**
 * Compute actual input feature dimension after encoding.
 * One-hot expands each categorical column to N binary features.
 */
export function getEncodedDim(featureCols, encoders) {
  return featureCols.reduce((sum, col) => {
    const enc = encoders[col];
    if (!enc) return sum + 1;
    if (enc.type === "categorical" && enc.encodeMode === "onehot") {
      return sum + Math.max(enc.classes.length, 1);
    }
    return sum + 1;
  }, 0);
}

export function encodeRow(row, featureCols, encoders, normalize = true) {
  const result = [];
  featureCols.forEach((col) => {
    const enc = encoders[col];
    const val = row[col];
    if (!enc) { result.push(0); return; }

    if (enc.type === "numeric") {
      const raw = val === null || val === "" || val === undefined ? enc.mean : Number(val);
      const n = isNaN(raw) ? enc.mean : raw;
      if (normalize) {
        if (enc.normalizeMode === "zscore") {
          result.push((n - enc.mean) / enc.std);
        } else if (enc.max !== enc.min) {
          result.push((n - enc.min) / (enc.max - enc.min));
        } else {
          result.push(0);
        }
      } else {
        result.push(n);
      }
    } else {
      const strVal = String(val ?? "");
      if (enc.encodeMode === "onehot") {
        const idx = enc.classes.indexOf(strVal);
        for (let i = 0; i < enc.classes.length; i++) result.push(i === idx ? 1 : 0);
      } else {
        const idx = enc.classes.indexOf(strVal);
        result.push(idx >= 0 ? idx : 0);
      }
    }
  });
  return result;
}

// ─── Task Detection ───────────────────────────────────────────────────────

/**
 * Infer model task from first output tensor.
 * Returns: 'binary' | 'multiclass' | 'regression'
 */
function detectTaskFromOutput(outputData, dims) {
  if (!dims || dims.length === 0) return "binary";
  const lastDim = Number(dims[dims.length - 1]);
  if (lastDim > 2) return "multiclass";
  if (lastDim === 2) return "binary";
  // 1D: check if values look like class labels (integers 0/1) or continuous
  const sample = Array.from(outputData).slice(0, Math.min(50, outputData.length));
  const allBinary = sample.every((v) => v === 0 || v === 1);
  if (allBinary) return "binary";
  const allInt = sample.every((v) => Math.abs(Number(v) - Math.round(Number(v))) < 1e-4);
  if (allInt) return "multiclass";
  return "regression";
}

// ─── Batch Inference ──────────────────────────────────────────────────────

/**
 * Run batch inference on dataset.
 * taskHint: 'auto' | 'binary' | 'multiclass' | 'regression'
 * Returns { predictions, probabilities, task, numClasses }
 */
export async function runBatchInference(
  modelHandle, data, featureCols, encoders,
  batchSize = 64, onProgress,
  { taskHint = "auto" } = {}
) {
  const ort = await getOrt();
  const { session } = modelHandle;
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  const probOutputName = session.outputNames.find((n) =>
    n.toLowerCase().includes("prob") || n.toLowerCase().includes("score")
  ) || session.outputNames[1];

  const numFeatures = getEncodedDim(featureCols, encoders);
  const allPredictions = [];
  const allProbs = [];
  const total = data.length;
  let detectedTask = taskHint !== "auto" ? taskHint : null;
  let numClasses = 2;

  for (let start = 0; start < total; start += batchSize) {
    const batch = data.slice(start, start + batchSize);
    const bLen = batch.length;

    const inputData = new Float32Array(bLen * numFeatures);
    batch.forEach((row, i) => {
      const encoded = encodeRow(row, featureCols, encoders);
      encoded.forEach((v, j) => {
        inputData[i * numFeatures + j] = isNaN(v) ? 0 : v;
      });
    });

    const tensor = new ort.Tensor("float32", inputData, [bLen, numFeatures]);
    const feeds = { [inputName]: tensor };

    try {
      const results = await session.run(feeds);
      const output = results[outputName];
      const outputData = output.data;
      const dims = Array.from(output.dims || []);

      if (!detectedTask) {
        detectedTask = detectTaskFromOutput(outputData, dims);
      }

      if (detectedTask === "multiclass") {
        const C = dims.length >= 2 ? Number(dims[dims.length - 1]) : 1;
        numClasses = C;
        for (let i = 0; i < bLen; i++) {
          let maxVal = -Infinity, maxIdx = 0;
          for (let c = 0; c < C; c++) {
            const v = Number(outputData[i * C + c]);
            if (v > maxVal) { maxVal = v; maxIdx = c; }
          }
          allPredictions.push(maxIdx);
          allProbs.push(Array.from({ length: C }, (_, c) => Number(outputData[i * C + c])));
        }
      } else if (detectedTask === "regression") {
        for (let i = 0; i < bLen; i++) {
          allPredictions.push(Number(outputData[i]));
        }
      } else {
        // Binary classification
        for (let i = 0; i < bLen; i++) {
          allPredictions.push(Number(outputData[i]));
        }
        // Probabilities from second output (if available)
        if (probOutputName && results[probOutputName]) {
          const probData = results[probOutputName].data;
          const probDims = Array.from(results[probOutputName].dims || []);
          if (probDims.length >= 2) {
            const cols = Number(probDims[probDims.length - 1]);
            for (let i = 0; i < bLen; i++) {
              allProbs.push(Number(probData[i * cols + cols - 1]));
            }
          } else {
            for (let i = 0; i < bLen; i++) {
              allProbs.push(Number(probData[i] ?? 0.5));
            }
          }
        }
      }
    } catch (err) {
      for (let i = 0; i < bLen; i++) allPredictions.push(null);
    }

    if (onProgress) onProgress(Math.min(start + batchSize, total) / total);
  }

  const finalTask = detectedTask || "binary";
  const hasBinaryProbs = finalTask === "binary" && allProbs.length === total;

  return {
    predictions: allPredictions,
    probabilities: hasBinaryProbs ? allProbs : null,
    multiclassProbs: finalTask === "multiclass" ? allProbs : null,
    task: finalTask,
    numClasses,
  };
}

// ─── Attach Predictions to Dataset ───────────────────────────────────────

export function attachPredictions(
  data, predictions, probabilities, task = "binary",
  predCol = "__pred__", probCol = "__prob__"
) {
  return data.map((row, i) => {
    const pred = predictions[i];
    let predStr;
    if (pred === null || pred === undefined) {
      predStr = null;
    } else if (task === "regression") {
      predStr = String(Number(pred).toFixed(6));
    } else {
      predStr = String(Math.round(Number(pred)));
    }
    return {
      ...row,
      [predCol]: predStr,
      ...(probabilities ? { [probCol]: probabilities[i]?.toFixed(4) } : {}),
    };
  });
}

/**
 * For regression models: threshold predictions into binary decisions.
 * Values >= threshold → favorable (1), else 0.
 */
export function thresholdRegressionPredictions(data, predCol, threshold, threshBinaryCol = "__pred_binary__") {
  return data.map((row) => ({
    ...row,
    [threshBinaryCol]: row[predCol] !== null && Number(row[predCol]) >= threshold ? "1" : "0",
  }));
}

// ─── Feature Importance via Permutation ──────────────────────────────────

export async function permutationImportance(
  modelHandle, data, featureCols, encoders,
  labelCol, favorableValues,
  sampleSize = 200, task = "binary"
) {
  const sample = data.slice(0, sampleSize);

  function computeScore(preds) {
    if (task === "regression") {
      const mse = preds.reduce((sum, pred, i) => {
        const actual = Number(sample[i][labelCol] ?? 0);
        return sum + (Number(pred ?? 0) - actual) ** 2;
      }, 0) / sample.length;
      return -mse;
    }
    return preds.reduce((sum, pred, i) => {
      const actual = favorableValues.includes(String(sample[i][labelCol] ?? "")) ? 1 : 0;
      return sum + (actual === Math.round(Number(pred ?? 0)) ? 1 : 0);
    }, 0) / sample.length;
  }

  const { predictions: basePreds } = await runBatchInference(
    modelHandle, sample, featureCols, encoders, 64, null, { taskHint: task }
  );
  const baseScore = computeScore(basePreds);

  const importances = [];

  for (const col of featureCols) {
    const vals = sample.map((r) => r[col]);
    for (let i = vals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vals[i], vals[j]] = [vals[j], vals[i]];
    }
    const permuted = sample.map((r, i) => ({ ...r, [col]: vals[i] }));

    const { predictions: permPreds } = await runBatchInference(
      modelHandle, permuted, featureCols, encoders, 64, null, { taskHint: task }
    );
    const permScore = computeScore(permPreds);

    importances.push({
      feature: col,
      importance: parseFloat(Math.max(0, baseScore - permScore).toFixed(4)),
      drop: parseFloat((baseScore - permScore).toFixed(4)),
    });
  }

  return importances.sort((a, b) => b.importance - a.importance);
}
