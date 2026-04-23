/**
 * Regulatory compliance checker for AI fairness.
 * Checks analysis results against real-world legal standards.
 */

function getMinDIR(metricsPerAttribute) {
  let min = Infinity;
  Object.values(metricsPerAttribute).forEach(({ disparateImpact }) => {
    if (!disparateImpact) return;
    Object.values(disparateImpact).forEach(({ ratio }) => {
      if (ratio !== null && ratio !== undefined && ratio < min) min = ratio;
    });
  });
  return isFinite(min) ? min : null;
}

function getMaxAbsDPD(metricsPerAttribute) {
  let max = 0;
  Object.values(metricsPerAttribute).forEach(({ demographicParity }) => {
    if (!demographicParity) return;
    Object.values(demographicParity).forEach(({ difference }) => {
      if (difference !== null && Math.abs(difference) > max) max = Math.abs(difference);
    });
  });
  return max;
}

function getMaxAbsEODiff(metricsPerAttribute) {
  let max = 0;
  Object.values(metricsPerAttribute).forEach(({ equalOpportunity }) => {
    if (!equalOpportunity) return;
    Object.values(equalOpportunity).forEach(({ difference }) => {
      if (difference !== null && Math.abs(difference) > max) max = Math.abs(difference);
    });
  });
  return max;
}

function hasHighRiskProxyVars(proxyVariables) {
  return Object.values(proxyVariables || {}).some((arr) =>
    arr.some((p) => p.risk === "high")
  );
}

/**
 * Run all compliance checks against analysis results.
 * Returns array of { regulation, jurisdiction, article, description, requirement, status, value, threshold, recommendation }
 */
export function checkCompliance(results) {
  const { summary, metricsPerAttribute, proxyVariables } = results;
  const score = summary?.fairnessScore ?? 0;
  const minDIR = getMinDIR(metricsPerAttribute || {});
  const maxDPD = getMaxAbsDPD(metricsPerAttribute || {});
  const maxEODiff = getMaxAbsEODiff(metricsPerAttribute || {});
  const highRiskProxy = hasHighRiskProxyVars(proxyVariables);
  const totalRows = summary?.totalRows ?? 0;

  const checks = [];

  // ── 1. EEOC Uniform Guidelines — 4/5 Rule ────────────────────────────────
  checks.push({
    id: "eeoc_4_5",
    regulation: "EEOC 4/5 Rule",
    jurisdiction: "🇺🇸 United States",
    article: "29 CFR Part 1607",
    description: "Employment selection procedures must not have disparate impact exceeding the 4/5 (80%) rule.",
    requirement: "Disparate Impact Ratio ≥ 0.80 for all protected groups",
    status: minDIR === null ? "unknown" : minDIR >= 0.8 ? "pass" : "fail",
    value: minDIR !== null ? minDIR.toFixed(3) : "N/A",
    threshold: "≥ 0.80",
    metric: "DIR",
    recommendation: minDIR !== null && minDIR < 0.8
      ? "Apply disparate impact remover or reweight training samples. Document business necessity justification."
      : null,
  });

  // ── 2. EU AI Act — High-Risk Systems ────────────────────────────────────
  const euAiActPass = score >= 70 && maxDPD < 0.15 && !highRiskProxy;
  checks.push({
    id: "eu_ai_act",
    regulation: "EU AI Act",
    jurisdiction: "🇪🇺 European Union",
    article: "Articles 10 & 15 (Annex III)",
    description: "High-risk AI systems (employment, credit, education) must be trained on sufficiently representative, error-free data with bias mitigation.",
    requirement: "Demonstrated bias testing & mitigation for protected characteristics",
    status: euAiActPass ? "pass" : "fail",
    value: `Score ${score}/100`,
    threshold: "Score ≥ 70, DPD < 0.15, no high-risk proxies",
    metric: "Composite",
    recommendation: !euAiActPass
      ? "Conduct pre-deployment conformity assessment. Implement bias mitigation and document in technical file."
      : null,
  });

  // ── 3. GDPR Article 22 ────────────────────────────────────────────────────
  const gdprPass = maxDPD < 0.2 && !highRiskProxy;
  checks.push({
    id: "gdpr_art22",
    regulation: "GDPR",
    jurisdiction: "🇪🇺 European Union",
    article: "Article 22",
    description: "Individuals have rights against solely automated decisions with significant legal effects. Systems must not discriminate on protected grounds.",
    requirement: "Non-discriminatory automated decisions, human oversight available",
    status: gdprPass ? "pass" : "caution",
    value: `DPD max ${maxDPD.toFixed(3)}`,
    threshold: "DPD < 0.20 (indicative)",
    metric: "DPD",
    recommendation: !gdprPass
      ? "Implement human review mechanism. Provide data subjects with right to explanation and contest automated decisions."
      : null,
  });

  // ── 4. NYC Local Law 144 (AEDT) ─────────────────────────────────────────
  const nycPass = minDIR !== null && minDIR >= 0.8 && !highRiskProxy;
  checks.push({
    id: "nyc_ll144",
    regulation: "NYC Local Law 144",
    jurisdiction: "🗽 New York City",
    article: "Local Law 144 of 2021",
    description: "Automated Employment Decision Tools (AEDTs) used in NYC must conduct annual bias audits for gender and race/ethnicity and publish results.",
    requirement: "Annual third-party bias audit, public disclosure of results, DIR ≥ 0.80",
    status: nycPass ? "pass" : "fail",
    value: minDIR !== null ? minDIR.toFixed(3) : "N/A",
    threshold: "DIR ≥ 0.80, annual audit required",
    metric: "DIR",
    recommendation: !nycPass
      ? "Commission annual third-party bias audit. Publish audit summary and provide candidate notification."
      : null,
  });

  // ── 5. Equal Credit Opportunity Act (ECOA) / Fair Lending ────────────────
  const ecoaPass = minDIR !== null && minDIR >= 0.8 && maxDPD < 0.1;
  checks.push({
    id: "ecoa",
    regulation: "ECOA / Fair Lending",
    jurisdiction: "🇺🇸 United States",
    article: "15 U.S.C. §1691 & Reg B",
    description: "Credit decisions must not discriminate based on race, sex, national origin, religion, age, or marital status.",
    requirement: "No disparate treatment or disparate impact in credit outcomes",
    status: ecoaPass ? "pass" : minDIR !== null && minDIR >= 0.7 ? "caution" : "fail",
    value: `DIR ${minDIR !== null ? minDIR.toFixed(3) : "N/A"}, DPD ${maxDPD.toFixed(3)}`,
    threshold: "DIR ≥ 0.80, DPD < 0.10",
    metric: "DIR + DPD",
    recommendation: !ecoaPass
      ? "Perform disparate impact analysis per Interagency Fair Lending Examination Procedures. Consider HMDA data if mortgage-related."
      : null,
  });

  // ── 6. ISO/IEC 42001 — AI Management Systems ─────────────────────────────
  const isoPass = score >= 75 && totalRows >= 100;
  checks.push({
    id: "iso_42001",
    regulation: "ISO/IEC 42001",
    jurisdiction: "🌐 International",
    article: "Clause 8.4 (Impacts)",
    description: "AI management systems standard requiring documented processes to identify and mitigate AI risks including fairness.",
    requirement: "Documented risk assessment, bias testing with ≥100 samples",
    status: isoPass ? "pass" : "caution",
    value: `Score ${score}/100, ${totalRows.toLocaleString()} rows`,
    threshold: "Score ≥ 75, adequate sample size",
    metric: "Composite",
    recommendation: !isoPass
      ? "Document AI risk management process. Increase test set size for statistical reliability."
      : null,
  });

  return checks;
}

export function getComplianceSummary(checks) {
  const pass = checks.filter((c) => c.status === "pass").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const caution = checks.filter((c) => c.status === "caution").length;
  const unknown = checks.filter((c) => c.status === "unknown").length;
  return { pass, fail, caution, unknown, total: checks.length };
}
