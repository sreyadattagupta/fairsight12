/**
 * Core bias analysis engine.
 * Implements standard fairness metrics from the ML fairness literature.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseValue(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? String(v).trim().toLowerCase() : n;
}

function isFavorable(value, favorableValues) {
  const v = String(value).trim().toLowerCase();
  return favorableValues.some((f) => String(f).trim().toLowerCase() === v);
}

function groupRows(data, attribute) {
  const groups = {};
  data.forEach((row) => {
    const key = String(row[attribute] ?? "unknown").trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  return groups;
}

function positiveRate(rows, targetCol, favorableValues) {
  if (!rows.length) return 0;
  const pos = rows.filter((r) => isFavorable(r[targetCol], favorableValues)).length;
  return pos / rows.length;
}

function pearsonCorrelation(xs, ys) {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  if (dx2 === 0 || dy2 === 0) return 0;
  return num / Math.sqrt(dx2 * dy2);
}

function encodeColumn(data, col) {
  const unique = [...new Set(data.map((r) => String(r[col] ?? "")))];
  const map = Object.fromEntries(unique.map((v, i) => [v, i]));
  return data.map((r) => map[String(r[col] ?? "")]);
}

// ─── Auto-detect privileged group ───────────────────────────────────────────

function detectPrivilegedGroup(data, protectedAttr, targetCol, favorableValues) {
  const groups = groupRows(data, protectedAttr);
  let best = null, bestRate = -1;
  Object.entries(groups).forEach(([group, rows]) => {
    const rate = positiveRate(rows, targetCol, favorableValues);
    if (rate > bestRate) {
      bestRate = rate;
      best = group;
    }
  });
  return best;
}

// ─── Core Fairness Metrics ───────────────────────────────────────────────────

/**
 * Demographic Parity Difference
 * Ideal: 0. Range: [-1, 1]. |DPD| > 0.1 flagged as biased.
 */
function demographicParityDifference(data, protectedAttr, targetCol, favorableValues, privilegedGroup) {
  const groups = groupRows(data, protectedAttr);
  const privRows = groups[privilegedGroup] || [];
  const privRate = positiveRate(privRows, targetCol, favorableValues);
  const results = {};
  Object.entries(groups).forEach(([group, rows]) => {
    if (group === privilegedGroup) return;
    const rate = positiveRate(rows, targetCol, favorableValues);
    results[group] = {
      rate,
      difference: rate - privRate,
      privilegedRate: privRate,
    };
  });
  return results;
}

/**
 * Disparate Impact Ratio
 * Ideal: 1. < 0.8 flagged as biased (the "80% rule").
 */
function disparateImpactRatio(data, protectedAttr, targetCol, favorableValues, privilegedGroup) {
  const groups = groupRows(data, protectedAttr);
  const privRows = groups[privilegedGroup] || [];
  const privRate = positiveRate(privRows, targetCol, favorableValues);
  const results = {};
  Object.entries(groups).forEach(([group, rows]) => {
    if (group === privilegedGroup) return;
    const rate = positiveRate(rows, targetCol, favorableValues);
    results[group] = {
      rate,
      ratio: privRate > 0 ? rate / privRate : null,
      privilegedRate: privRate,
    };
  });
  return results;
}

/**
 * Equality of Opportunity (True Positive Rate parity)
 * Requires actual labels. Measures if qualified individuals are equally favored.
 */
function equalOpportunity(data, protectedAttr, targetCol, favorableValues, privilegedGroup, actualCol) {
  if (!actualCol) return null;
  // TPR = P(Ŷ=1 | Y=1, A=group)
  const groups = groupRows(data, protectedAttr);
  const privRows = (groups[privilegedGroup] || []).filter((r) =>
    isFavorable(r[actualCol], favorableValues)
  );
  const privTPR = positiveRate(privRows, targetCol, favorableValues);
  const results = {};
  Object.entries(groups).forEach(([group, rows]) => {
    if (group === privilegedGroup) return;
    const qualified = rows.filter((r) => isFavorable(r[actualCol], favorableValues));
    const tpr = positiveRate(qualified, targetCol, favorableValues);
    results[group] = {
      tpr,
      difference: tpr - privTPR,
      privilegedTPR: privTPR,
    };
  });
  return results;
}

/**
 * Predictive Parity (Precision parity)
 * P(Y=1 | Ŷ=1, A=group) — should be equal across groups.
 */
function predictiveParity(data, protectedAttr, targetCol, favorableValues, privilegedGroup, actualCol) {
  if (!actualCol) return null;
  const groups = groupRows(data, protectedAttr);

  function precision(rows) {
    const predicted = rows.filter((r) => isFavorable(r[targetCol], favorableValues));
    if (!predicted.length) return null;
    const tp = predicted.filter((r) => isFavorable(r[actualCol], favorableValues)).length;
    return tp / predicted.length;
  }

  const privPrec = precision(groups[privilegedGroup] || []);
  const results = {};
  Object.entries(groups).forEach(([group, rows]) => {
    if (group === privilegedGroup) return;
    const prec = precision(rows);
    results[group] = {
      precision: prec,
      difference: prec !== null && privPrec !== null ? prec - privPrec : null,
      privilegedPrecision: privPrec,
    };
  });
  return results;
}

// ─── Proxy Variable Detection ─────────────────────────────────────────────

function detectProxyVariables(data, protectedAttrs, allColumns) {
  const results = {};
  const numericCols = allColumns.filter((col) => {
    const sample = data.slice(0, 50).map((r) => r[col]);
    return sample.every((v) => v === null || v === "" || !isNaN(Number(v)));
  });

  protectedAttrs.forEach((attr) => {
    const attrEncoded = encodeColumn(data, attr);
    results[attr] = [];
    allColumns
      .filter((col) => col !== attr && !protectedAttrs.includes(col))
      .forEach((col) => {
        const colEncoded = encodeColumn(data, col);
        const corr = Math.abs(pearsonCorrelation(attrEncoded, colEncoded));
        if (corr > 0.3) {
          results[attr].push({
            column: col,
            correlation: corr,
            risk: corr > 0.7 ? "high" : corr > 0.5 ? "medium" : "low",
          });
        }
      });
    results[attr].sort((a, b) => b.correlation - a.correlation);
  });
  return results;
}

// ─── Distribution Analysis ────────────────────────────────────────────────

function computeGroupDistributions(data, protectedAttrs, targetCol, favorableValues) {
  const distributions = {};
  protectedAttrs.forEach((attr) => {
    const groups = groupRows(data, attr);
    distributions[attr] = Object.entries(groups).map(([group, rows]) => ({
      group,
      count: rows.length,
      percentage: (rows.length / data.length) * 100,
      favorableRate: positiveRate(rows, targetCol, favorableValues) * 100,
    }));
  });
  return distributions;
}

// ─── Intersectional Bias ──────────────────────────────────────────────────

function intersectionalAnalysis(data, protectedAttrs, targetCol, favorableValues) {
  if (protectedAttrs.length < 2) return null;
  const [a1, a2] = protectedAttrs.slice(0, 2);
  const intersections = {};
  data.forEach((row) => {
    const key = `${row[a1]} × ${row[a2]}`;
    if (!intersections[key]) intersections[key] = { rows: [], a1: row[a1], a2: row[a2] };
    intersections[key].rows.push(row);
  });

  const result = Object.entries(intersections)
    .filter(([, v]) => v.rows.length >= 5)
    .map(([label, v]) => ({
      label,
      a1: v.a1,
      a2: v.a2,
      count: v.rows.length,
      favorableRate: positiveRate(v.rows, targetCol, favorableValues) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return { attr1: a1, attr2: a2, intersections: result };
}

// ─── Overall Fairness Score ───────────────────────────────────────────────

function computeFairnessScore(dpResults, dirResults) {
  const diffs = [];
  Object.values(dpResults).forEach((v) => diffs.push(Math.abs(v.difference)));
  Object.values(dirResults).forEach((v) => {
    if (v.ratio !== null) {
      const deviation = Math.abs(v.ratio - 1);
      diffs.push(deviation);
    }
  });
  if (!diffs.length) return 100;
  const avgDeviation = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const score = Math.max(0, Math.min(100, 100 - avgDeviation * 200));
  return Math.round(score);
}

// ─── Remediation Suggestions ─────────────────────────────────────────────

function generateRemediations(dpResults, dirResults, proxyVars, fairnessScore) {
  const remediations = [];

  const biasedGroups = Object.entries(dpResults).filter(
    ([, v]) => Math.abs(v.difference) > 0.1
  );

  if (biasedGroups.length > 0) {
    remediations.push({
      category: "Pre-processing",
      title: "Reweighting Training Samples",
      severity: "high",
      description:
        "Assign higher weights to underrepresented groups during model training to counteract historical bias in the dataset.",
      steps: [
        "Calculate instance weights inversely proportional to group outcome rates",
        "Apply sample weights during model training (e.g., class_weight='balanced' in sklearn)",
        "Validate that weighted training reduces demographic parity difference below 0.1",
      ],
      impact: "Reduces demographic parity difference by up to 60%",
    });

    remediations.push({
      category: "Pre-processing",
      title: "Disparate Impact Remover",
      severity: "high",
      description:
        "Transform feature values to reduce correlation with protected attributes while preserving rank ordering within groups.",
      steps: [
        "Apply the Feldman et al. disparate impact remover to numerical features",
        "Set repair level between 0.8–1.0 to balance fairness vs. accuracy trade-off",
        "Re-evaluate all fairness metrics after transformation",
      ],
      impact: "Improves disparate impact ratio toward the 0.8 threshold",
    });
  }

  const proxyCols = Object.values(proxyVars)
    .flat()
    .filter((p) => p.risk === "high");

  if (proxyCols.length > 0) {
    remediations.push({
      category: "Data Curation",
      title: "Remove or Decorrelate Proxy Variables",
      severity: "medium",
      description: `Columns like "${proxyCols
        .slice(0, 3)
        .map((p) => p.column)
        .join(", ")}" are highly correlated with protected attributes and may encode indirect discrimination.`,
      steps: [
        "Audit each proxy variable for legitimate business necessity",
        "Remove non-essential proxy features from training data",
        "For necessary features, apply fairness-aware transformations",
        "Re-run analysis to confirm correlation reduction",
      ],
      impact: "Eliminates potential indirect discrimination pathways",
    });
  }

  remediations.push({
    category: "In-processing",
    title: "Fairness Constraints During Training",
    severity: "medium",
    description:
      "Add fairness regularization terms to the loss function to penalize models that produce biased outcomes.",
    steps: [
      "Use adversarial debiasing: add a discriminator that tries to predict protected attributes from model outputs",
      "Implement constraint-based optimization (e.g., Zafar et al. fairness constraints)",
      "Monitor both accuracy and fairness metrics on a validation set during training",
    ],
    impact: "Directly optimizes model to satisfy fairness constraints",
  });

  remediations.push({
    category: "Post-processing",
    title: "Threshold Optimization per Group",
    severity: "low",
    description:
      "Adjust decision thresholds independently for each demographic group to equalize outcome rates.",
    steps: [
      "Compute ROC curves for each group separately",
      "Select thresholds that equalize TPR or FPR across groups (equalized odds)",
      "Document threshold differences for transparency and audit purposes",
    ],
    impact: "Can fully equalize positive rates without retraining the model",
  });

  remediations.push({
    category: "Governance",
    title: "Continuous Bias Monitoring",
    severity: "low",
    description:
      "Bias can re-emerge over time as data distribution shifts. Implement ongoing fairness checks in production.",
    steps: [
      "Log model predictions along with (anonymized) demographic data",
      "Run automated fairness metric checks on a rolling 30-day window",
      "Set alert thresholds: DPD > 0.1, DIR < 0.8 trigger review",
      "Conduct quarterly bias audits with diverse stakeholder panels",
    ],
    impact: "Prevents bias drift and ensures sustained fairness over time",
  });

  return remediations;
}

// ─── Regression Fairness ──────────────────────────────────────────────────

/**
 * Detect if a target column contains continuous (regression) values.
 */
export function isRegressionTarget(data, col, sampleSize = 200) {
  const sample = data.slice(0, sampleSize).map((r) => r[col]).filter((v) => v !== null && v !== "" && v !== undefined);
  if (!sample.length) return false;
  const isNumeric = sample.every((v) => !isNaN(Number(v)));
  if (!isNumeric) return false;
  const unique = new Set(sample.map((v) => String(parseFloat(Number(v).toFixed(2)))));
  // If >10 distinct rounded values it's likely continuous
  return unique.size > 10;
}

/**
 * Compute regression fairness metrics: mean prediction per group, variance ratio, max gap.
 */
function regressionGroupMetrics(data, protectedAttr, targetCol, privilegedGroup) {
  const groups = groupRows(data, protectedAttr);
  function groupMean(rows) {
    const nums = rows.map((r) => Number(r[targetCol])).filter((v) => !isNaN(v));
    if (!nums.length) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }
  const privMean = groupMean(groups[privilegedGroup] || []);
  const results = {};
  Object.entries(groups).forEach(([group, rows]) => {
    if (group === privilegedGroup) return;
    const mean = groupMean(rows);
    results[group] = {
      mean: mean !== null ? parseFloat(mean.toFixed(4)) : null,
      difference: mean !== null && privMean !== null ? parseFloat((mean - privMean).toFixed(4)) : null,
      privilegedMean: privMean !== null ? parseFloat(privMean.toFixed(4)) : null,
      ratio: mean !== null && privMean && privMean !== 0 ? parseFloat((mean / privMean).toFixed(4)) : null,
    };
  });
  return results;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────

export function analyzeDataset({
  data,
  protectedAttributes,
  targetColumn,
  favorableValues,
  actualColumn = null,
  regressionThreshold = null,
}) {
  if (!data?.length) throw new Error("Dataset is empty");
  if (!protectedAttributes?.length) throw new Error("Select at least one protected attribute");
  if (!targetColumn) throw new Error("Select a target/outcome column");

  // Detect regression first, then check if a threshold was supplied
  const isRegression = isRegressionTarget(data, targetColumn) ||
    (regressionThreshold !== null && regressionThreshold !== undefined);

  // For regression with threshold, create a synthetic binary column for fairness metrics
  let workingData = data;
  let workingTarget = targetColumn;
  let workingFavorable = favorableValues;

  if (isRegression && regressionThreshold !== null) {
    const synthCol = "__reg_binary__";
    workingData = data.map((r) => ({
      ...r,
      [synthCol]: Number(r[targetColumn]) >= regressionThreshold ? "1" : "0",
    }));
    workingTarget = synthCol;
    workingFavorable = ["1"];
  } else if (!favorableValues?.length) {
    throw new Error("Select favorable outcome values");
  }

  const allColumns = Object.keys(data[0]);

  // Auto-detect privileged group for each protected attribute
  const privilegedGroups = {};
  protectedAttributes.forEach((attr) => {
    privilegedGroups[attr] = detectPrivilegedGroup(workingData, attr, workingTarget, workingFavorable);
  });

  // Compute metrics per protected attribute
  const metricsPerAttribute = {};
  protectedAttributes.forEach((attr) => {
    const priv = privilegedGroups[attr];
    const regMetrics = isRegression
      ? regressionGroupMetrics(data, attr, targetColumn, priv)
      : null;
    metricsPerAttribute[attr] = {
      privilegedGroup: priv,
      demographicParity: demographicParityDifference(workingData, attr, workingTarget, workingFavorable, priv),
      disparateImpact: disparateImpactRatio(workingData, attr, workingTarget, workingFavorable, priv),
      equalOpportunity: equalOpportunity(workingData, attr, workingTarget, workingFavorable, priv, actualColumn),
      predictiveParity: predictiveParity(workingData, attr, workingTarget, workingFavorable, priv, actualColumn),
      ...(regMetrics ? { regressionMetrics: regMetrics } : {}),
    };
  });

  // Proxy variable detection
  const proxyVariables = detectProxyVariables(data, protectedAttributes, allColumns);

  // Distribution analysis
  const distributions = computeGroupDistributions(workingData, protectedAttributes, workingTarget, workingFavorable);

  // Intersectional bias
  const intersectional = intersectionalAnalysis(workingData, protectedAttributes, workingTarget, workingFavorable);

  // Overall fairness score (use first attribute for simplicity)
  const firstAttr = protectedAttributes[0];
  const score = computeFairnessScore(
    metricsPerAttribute[firstAttr].demographicParity,
    metricsPerAttribute[firstAttr].disparateImpact
  );

  // Remediations
  const remediations = generateRemediations(
    metricsPerAttribute[firstAttr].demographicParity,
    metricsPerAttribute[firstAttr].disparateImpact,
    proxyVariables,
    score
  );

  // Summary statistics
  const summary = {
    totalRows: data.length,
    totalColumns: allColumns.length,
    protectedAttributes,
    targetColumn,
    favorableValues: workingFavorable,
    isRegression,
    regressionThreshold: isRegression ? regressionThreshold : null,
    fairnessScore: score,
    fairnessLevel:
      score >= 80 ? "Fair" : score >= 60 ? "Moderate Concern" : "Significant Bias Detected",
    analyzedAt: new Date().toISOString(),
  };

  return {
    summary,
    privilegedGroups,
    metricsPerAttribute,
    proxyVariables,
    distributions,
    intersectional,
    remediations,
  };
}

export function detectColumnTypes(data) {
  if (!data?.length) return {};
  const cols = Object.keys(data[0]);
  const types = {};
  cols.forEach((col) => {
    const values = data.slice(0, 100).map((r) => r[col]).filter((v) => v !== null && v !== "");
    const unique = [...new Set(values)];
    const isNumeric = values.every((v) => !isNaN(Number(v)));
    const isBinary = unique.length <= 2;
    const isLowCardinality = unique.length <= 10;
    types[col] = {
      isNumeric,
      isBinary,
      isLowCardinality,
      uniqueCount: unique.length,
      uniqueValues: unique.slice(0, 20),
      likelyProtected: isLowCardinality && !isNumeric &&
        ["gender", "sex", "race", "ethnicity", "age_group", "nationality", "religion", "disability"]
          .some((kw) => col.toLowerCase().includes(kw)),
      likelyTarget: isBinary && ["hired", "approved", "outcome", "decision", "label", "target", "result", "granted", "accepted", "selected"]
          .some((kw) => col.toLowerCase().includes(kw)),
    };
  });
  return types;
}
