/**
 * Multi-format dataset parser with data quality analysis.
 * Supports: CSV, TSV, JSON (array), JSONL, and auto-detection.
 */

// ─── Format Parsers ──────────────────────────────────────────────────────────

function parseCsvOrTsv(text, delimiter = null) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("File needs a header row and at least one data row");

  // Auto-detect delimiter
  if (!delimiter) {
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    if (tabCount > commaCount && tabCount > semicolonCount) delimiter = "\t";
    else if (semicolonCount > commaCount) delimiter = ";";
    else delimiter = ",";
  }

  // Parse with quote handling
  function parseRow(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseRow(lines[0]);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseRow(lines[i]);
    if (vals.length !== headers.length) continue;
    const row = {};
    headers.forEach((h, j) => (row[h] = vals[j] === "" ? null : vals[j]));
    data.push(row);
  }
  return { headers, data, format: delimiter === "\t" ? "TSV" : "CSV" };
}

function parseJson(text) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    if (!parsed.length) throw new Error("JSON array is empty");
    const headers = Object.keys(parsed[0]);
    return { headers, data: parsed, format: "JSON" };
  }
  // Try common wrapping patterns
  const candidates = ["data", "rows", "records", "items", "results"];
  for (const key of candidates) {
    if (parsed[key] && Array.isArray(parsed[key])) {
      const headers = Object.keys(parsed[key][0]);
      return { headers, data: parsed[key], format: "JSON" };
    }
  }
  throw new Error("JSON must be an array or have a 'data'/'rows'/'records' key");
}

function parseJsonl(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const data = lines.map((l, i) => {
    try { return JSON.parse(l); }
    catch { throw new Error(`Invalid JSON on line ${i + 1}`); }
  });
  if (!data.length) throw new Error("JSONL file is empty");
  const headers = Object.keys(data[0]);
  return { headers, data, format: "JSONL" };
}

export function parseDataset(text, fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();

  try {
    if (ext === "tsv") return parseCsvOrTsv(text, "\t");
    if (ext === "jsonl" || ext === "ndjson") return parseJsonl(text);
    if (ext === "json") return parseJson(text);
    // Auto-detect for .csv or unknown
    try { return parseCsvOrTsv(text); }
    catch { /* fall through */ }
    try { return parseJson(text); }
    catch { /* fall through */ }
    return parseJsonl(text);
  } catch (err) {
    throw new Error(`Could not parse ${fileName || "file"}: ${err.message}`);
  }
}

// ─── Column Role Detection ────────────────────────────────────────────────

/**
 * Detect the role/nature of a column for ML purposes.
 * Returns: 'numeric' | 'binary' | 'low_cardinality' | 'high_cardinality' | 'text'
 */
export function detectColumnRole(data, col, sampleSize = 200) {
  const sample = data.slice(0, sampleSize).map((r) => r[col]).filter((v) => v !== null && v !== "" && v !== undefined);
  if (!sample.length) return "unknown";

  const isNumeric = sample.every((v) => !isNaN(Number(v)));
  if (isNumeric) return "numeric";

  const unique = new Set(sample.map(String));
  const uniqueRatio = unique.size / sample.length;

  // Detect text by avg word count
  const avgWords = sample.reduce((s, v) => s + String(v).trim().split(/\s+/).length, 0) / sample.length;
  if (avgWords > 4 || uniqueRatio > 0.8) return "text";

  if (unique.size <= 2) return "binary";
  if (unique.size <= 15) return "low_cardinality";
  return "high_cardinality";
}

// ─── Data Quality Analysis ────────────────────────────────────────────────

export function analyzeDataQuality(data, headers) {
  const n = data.length;
  const report = {};

  headers.forEach((col) => {
    const values = data.map((r) => r[col]);
    const nullCount = values.filter((v) => v === null || v === "" || v === undefined).length;
    const nonNull = values.filter((v) => v !== null && v !== "" && v !== undefined);
    const unique = new Set(nonNull.map(String));
    const isNumeric = nonNull.length > 0 && nonNull.every((v) => !isNaN(Number(v)));
    const role = detectColumnRole(data, col);

    let stats = {
      nullCount,
      nullPct: (nullCount / n) * 100,
      uniqueCount: unique.size,
      uniqueValues: [...unique].slice(0, 20),
      isNumeric,
      role,
      quality: nullCount / n < 0.01 ? "good" : nullCount / n < 0.1 ? "warning" : "poor",
    };

    if (isNumeric && nonNull.length > 0) {
      const nums = nonNull.map(Number).sort((a, b) => a - b);
      let sum = 0;
      for (const v of nums) sum += v;
      const mean = sum / nums.length;
      const q1 = nums[Math.floor(nums.length * 0.25)];
      const q3 = nums[Math.floor(nums.length * 0.75)];
      const iqr = q3 - q1;
      const outliers = nums.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length;
      let variance = 0;
      for (const v of nums) variance += (v - mean) ** 2;
      variance /= nums.length;
      stats = {
        ...stats,
        mean: mean.toFixed(4),
        std: Math.sqrt(variance).toFixed(4),
        min: nums[0],
        max: nums[nums.length - 1],
        q1,
        median: nums[Math.floor(nums.length / 2)],
        q3,
        outlierCount: outliers,
        outlierPct: (outliers / nonNull.length) * 100,
      };
    }

    report[col] = stats;
  });

  // Overall data quality score
  const avgNull = Object.values(report).reduce((a, c) => a + c.nullPct, 0) / headers.length;
  const totalOutliers = Object.values(report).filter((c) => c.isNumeric).reduce((a, c) => a + (c.outlierCount || 0), 0);
  const qualityScore = Math.max(0, Math.round(100 - avgNull * 2 - (totalOutliers / n) * 100));

  return { columns: report, qualityScore, totalRows: n, totalColumns: headers.length };
}

// ─── Feature Correlation Matrix ───────────────────────────────────────────

function pearsonR(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  if (dx2 === 0 || dy2 === 0) return 0;
  return num / Math.sqrt(dx2 * dy2);
}

export function computeCorrelationMatrix(data, columns) {
  // Only numeric columns
  const numericCols = columns.filter((col) => {
    const sample = data.slice(0, 50).map((r) => r[col]);
    return sample.filter((v) => v !== null && v !== "").every((v) => !isNaN(Number(v)));
  });

  const encoded = {};
  numericCols.forEach((col) => {
    encoded[col] = data.map((r) => (r[col] === null || r[col] === "" ? 0 : Number(r[col])));
  });

  const matrix = {};
  numericCols.forEach((c1) => {
    matrix[c1] = {};
    numericCols.forEach((c2) => {
      matrix[c1][c2] = parseFloat(pearsonR(encoded[c1], encoded[c2]).toFixed(3));
    });
  });

  return { matrix, columns: numericCols };
}

// ─── Class Imbalance Analysis ─────────────────────────────────────────────

export function analyzeClassImbalance(data, targetCol) {
  const counts = {};
  data.forEach((r) => {
    const v = String(r[targetCol] ?? "null");
    counts[v] = (counts[v] || 0) + 1;
  });
  const total = data.length;
  const distribution = Object.entries(counts)
    .map(([value, count]) => ({ value, count, pct: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);

  const maxPct = Math.max(...distribution.map((d) => d.pct));
  const minPct = Math.min(...distribution.map((d) => d.pct));
  const imbalanceRatio = minPct > 0 ? maxPct / minPct : Infinity;

  return {
    distribution,
    imbalanceRatio: isFinite(imbalanceRatio) ? parseFloat(imbalanceRatio.toFixed(2)) : null,
    isImbalanced: imbalanceRatio > 3,
    severity: imbalanceRatio > 10 ? "severe" : imbalanceRatio > 3 ? "moderate" : "balanced",
  };
}

// ─── Missing Value Imputation ─────────────────────────────────────────────

export function imputeMissingValues(data, strategy = "drop") {
  if (strategy === "drop") {
    return data.filter((row) =>
      Object.values(row).every((v) => v !== null && v !== "" && v !== undefined)
    );
  }

  const headers = Object.keys(data[0]);
  const stats = {};
  headers.forEach((col) => {
    const vals = data.map((r) => r[col]).filter((v) => v !== null && v !== "" && v !== undefined);
    const isNumeric = vals.every((v) => !isNaN(Number(v)));
    if (isNumeric && vals.length > 0) {
      const nums = vals.map(Number);
      stats[col] = { type: "numeric", mean: nums.reduce((a, b) => a + b, 0) / nums.length };
    } else if (vals.length > 0) {
      const freq = {};
      vals.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
      stats[col] = { type: "categorical", mode: Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] };
    }
  });

  return data.map((row) => {
    const newRow = { ...row };
    headers.forEach((col) => {
      if (newRow[col] === null || newRow[col] === "" || newRow[col] === undefined) {
        if (!stats[col]) return;
        if (strategy === "mean" && stats[col].type === "numeric") {
          newRow[col] = String(stats[col].mean.toFixed(4));
        } else if (strategy === "mode") {
          newRow[col] = stats[col].type === "numeric"
            ? String(stats[col].mean.toFixed(4))
            : stats[col].mode;
        }
      }
    });
    return newRow;
  });
}
