/**
 * Advanced fairness metrics beyond basic demographic parity.
 * Counterfactual fairness, calibration, individual fairness, Theil index.
 */

function isFav(value, favorableValues) {
  const v = String(value ?? "").trim().toLowerCase();
  return favorableValues.some((f) => String(f).trim().toLowerCase() === v);
}

// ─── Counterfactual Fairness ──────────────────────────────────────────────
/**
 * For each record, flip the protected attribute to every other group value.
 * If a model's prediction would change, that's counterfactually unfair.
 * Without a live model, we use the empirical conditional probability.
 * With model predictions, use actual per-record outcomes.
 */
export function counterfactualFairness(data, protectedAttr, targetCol, favorableValues) {
  const groups = [...new Set(data.map((r) => String(r[protectedAttr] ?? "")))];
  if (groups.length < 2) return null;

  // Build empirical outcome model: P(Y=1 | features except protected)
  // Simplified: use record-level comparison by finding near-duplicate records
  // across groups (same values on non-protected columns)
  const nonProtectedCols = Object.keys(data[0]).filter(
    (c) => c !== protectedAttr && c !== targetCol
  );

  let counterfactuallyFair = 0;
  let counterfactuallyUnfair = 0;
  const perGroupFlipRate = {};

  groups.forEach((sourceGroup) => {
    const sourceRows = data.filter((r) => String(r[protectedAttr]) === sourceGroup);
    let flips = 0;
    let comparisons = 0;

    sourceRows.slice(0, 200).forEach((row) => {
      const myOutcome = isFav(row[targetCol], favorableValues);
      // Find records from other groups with similar non-protected features
      const others = data.filter(
        (r) =>
          String(r[protectedAttr]) !== sourceGroup &&
          nonProtectedCols.slice(0, 3).every((c) => {
            const a = String(r[c] ?? "").trim();
            const b = String(row[c] ?? "").trim();
            const na = !isNaN(Number(a)), nb = !isNaN(Number(b));
            if (na && nb) return Math.abs(Number(a) - Number(b)) <= Math.abs(Number(a)) * 0.2 + 1;
            return a === b;
          })
      );
      if (others.length > 0) {
        const otherOutcome = isFav(others[0][targetCol], favorableValues);
        comparisons++;
        if (myOutcome !== otherOutcome) flips++;
      }
    });

    const flipRate = comparisons > 0 ? flips / comparisons : null;
    perGroupFlipRate[sourceGroup] = { flipRate, comparisons, flips };
    if (flipRate !== null) {
      counterfactuallyFair += comparisons - flips;
      counterfactuallyUnfair += flips;
    }
  });

  const total = counterfactuallyFair + counterfactuallyUnfair;
  const overallFlipRate = total > 0 ? counterfactuallyUnfair / total : null;

  return {
    overallFlipRate,
    perGroupFlipRate,
    isFair: overallFlipRate !== null && overallFlipRate < 0.1,
    interpretation:
      overallFlipRate === null
        ? "Insufficient comparable records"
        : overallFlipRate < 0.1
        ? "Counterfactually fair — changing protected attribute rarely changes outcome"
        : overallFlipRate < 0.3
        ? "Moderate counterfactual unfairness detected"
        : "High counterfactual unfairness — protected attribute strongly influences outcome",
  };
}

// ─── Calibration Analysis ─────────────────────────────────────────────────
/**
 * Is the model equally calibrated across groups?
 * Partition predictions into bins, check if each bin's actual positive rate is similar.
 */
export function calibrationAnalysis(data, protectedAttr, predictionCol, actualCol, bins = 5) {
  if (!predictionCol || !actualCol) return null;

  // Only works if prediction column has numeric probabilities [0,1]
  const sample = data.slice(0, 50).map((r) => Number(r[predictionCol]));
  const isProb = sample.every((v) => !isNaN(v) && v >= 0 && v <= 1);
  if (!isProb) return null;

  const groups = [...new Set(data.map((r) => String(r[protectedAttr] ?? "")))];
  const binWidth = 1 / bins;
  const result = {};

  groups.forEach((group) => {
    const groupRows = data.filter((r) => String(r[protectedAttr]) === group);
    const binData = Array.from({ length: bins }, (_, i) => ({
      binMin: i * binWidth,
      binMax: (i + 1) * binWidth,
      label: `${(i * binWidth * 100).toFixed(0)}-${((i + 1) * binWidth * 100).toFixed(0)}%`,
      predicted: 0,
      actual: 0,
      count: 0,
    }));

    groupRows.forEach((row) => {
      const pred = Number(row[predictionCol]);
      const act = Number(row[actualCol]);
      if (isNaN(pred)) return;
      const binIdx = Math.min(Math.floor(pred / binWidth), bins - 1);
      binData[binIdx].count++;
      binData[binIdx].predicted += pred;
      if (!isNaN(act)) binData[binIdx].actual += act;
    });

    result[group] = binData
      .filter((b) => b.count > 0)
      .map((b) => ({
        ...b,
        avgPredicted: b.predicted / b.count,
        avgActual: b.actual / b.count,
        calibrationError: Math.abs(b.predicted / b.count - b.actual / b.count),
      }));
  });

  const eces = Object.entries(result).map(([g, bins]) => ({
    group: g,
    ece: bins.reduce((sum, b) => sum + (b.count / data.length) * b.calibrationError, 0),
  }));
  const maxEceDiff = eces.length > 1
    ? Math.max(...eces.map((e) => e.ece)) - Math.min(...eces.map((e) => e.ece))
    : 0;

  return {
    perGroup: result,
    eces,
    maxEceDiff: parseFloat(maxEceDiff.toFixed(4)),
    isFair: maxEceDiff < 0.05,
  };
}

// ─── Individual Fairness (Lipschitz approximation) ───────────────────────
/**
 * Similar individuals should receive similar treatment.
 * We approximate: for a random sample of pairs, measure outcome difference
 * relative to feature similarity.
 */
export function individualFairness(data, targetCol, favorableValues, numericCols, sampleSize = 300) {
  if (numericCols.length === 0) return null;

  const sample = data.slice(0, sampleSize);
  let violations = 0;
  let pairs = 0;

  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < Math.min(i + 10, sample.length); j++) {
      const a = sample[i], b = sample[j];

      // Feature distance (normalized)
      const dists = numericCols.map((c) => {
        const va = Number(a[c] || 0), vb = Number(b[c] || 0);
        return Math.abs(va - vb);
      });
      const featureDist = Math.sqrt(dists.reduce((s, d) => s + d * d, 0)) / numericCols.length;

      // Outcome similarity
      const outA = isFav(a[targetCol], favorableValues) ? 1 : 0;
      const outB = isFav(b[targetCol], favorableValues) ? 1 : 0;
      const outcomeDiff = Math.abs(outA - outB);

      pairs++;
      // Violation: similar features but different outcomes
      if (featureDist < 0.5 && outcomeDiff === 1) violations++;
    }
  }

  const violationRate = pairs > 0 ? violations / pairs : 0;
  return {
    violationRate: parseFloat(violationRate.toFixed(4)),
    violations,
    pairs,
    isFair: violationRate < 0.1,
    interpretation:
      violationRate < 0.05
        ? "Strong individual fairness — similar people receive similar outcomes"
        : violationRate < 0.15
        ? "Moderate individual fairness concerns"
        : "Individual fairness violations — similar people receiving very different outcomes",
  };
}

// ─── Theil Index (inequality measure) ────────────────────────────────────
/**
 * Measures outcome inequality across the dataset.
 * 0 = perfectly equal, higher = more inequality.
 */
export function theilIndex(data, targetCol, favorableValues) {
  const outcomes = data.map((r) => (isFav(r[targetCol], favorableValues) ? 1 : 0));
  const n = outcomes.length;
  const mean = outcomes.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return { theil: 0, gini: 0 };

  // Theil T index
  const theil = outcomes.reduce((sum, yi) => {
    if (yi === 0) return sum;
    return sum + (yi / mean) * Math.log(yi / mean);
  }, 0) / n;

  // Gini coefficient
  const sorted = [...outcomes].sort((a, b) => a - b);
  let giniSum = 0;
  sorted.forEach((yi, i) => { giniSum += (2 * (i + 1) - n - 1) * yi; });
  const gini = Math.abs(giniSum / (n * n * mean));

  return {
    theil: parseFloat(theil.toFixed(4)),
    gini: parseFloat(gini.toFixed(4)),
    interpretation:
      theil < 0.1 ? "Low inequality in outcomes" : theil < 0.3 ? "Moderate inequality" : "High outcome inequality",
  };
}

// ─── Between-Group Variance ───────────────────────────────────────────────
export function betweenGroupVariance(data, protectedAttr, targetCol, favorableValues) {
  const groups = {};
  data.forEach((r) => {
    const g = String(r[protectedAttr] ?? "");
    if (!groups[g]) groups[g] = [];
    groups[g].push(isFav(r[targetCol], favorableValues) ? 1 : 0);
  });

  const groupMeans = Object.entries(groups).map(([g, vals]) => ({
    group: g,
    mean: vals.reduce((a, b) => a + b, 0) / vals.length,
    n: vals.length,
  }));

  const overallMean = data.filter((r) => isFav(r[targetCol], favorableValues)).length / data.length;

  const bgv = groupMeans.reduce((sum, gm) => {
    return sum + (gm.n / data.length) * (gm.mean - overallMean) ** 2;
  }, 0);

  return {
    value: parseFloat(bgv.toFixed(6)),
    groupMeans,
    overallMean: parseFloat(overallMean.toFixed(4)),
    interpretation:
      bgv < 0.001 ? "Negligible between-group variance" : bgv < 0.01 ? "Moderate" : "High — groups have very different outcome rates",
  };
}

// ─── Slicing Analysis ─────────────────────────────────────────────────────
/**
 * Find dataset slices where model performs worst for each group.
 */
export function slicingAnalysis(data, protectedAttr, targetCol, favorableValues, sliceCol) {
  if (!sliceCol) return null;
  const sliceValues = [...new Set(data.map((r) => String(r[sliceCol] ?? "")))].slice(0, 10);
  const groups = [...new Set(data.map((r) => String(r[protectedAttr] ?? "")))];

  const result = sliceValues.map((sv) => {
    const slice = data.filter((r) => String(r[sliceCol] ?? "") === sv);
    const groupRates = {};
    groups.forEach((g) => {
      const rows = slice.filter((r) => String(r[protectedAttr]) === g);
      groupRates[g] = rows.length > 0
        ? rows.filter((r) => isFav(r[targetCol], favorableValues)).length / rows.length
        : null;
    });
    return { slice: sv, count: slice.length, groupRates };
  });

  return result;
}
