<div align="center">

# 🛡️ FairSight

### AI Bias Detection & Fairness Auditing Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_1.5_Pro-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX-Runtime_Web-005CED?style=for-the-badge&logo=onnx)](https://onnxruntime.ai/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **Detect, measure, and fix AI bias before it impacts real people.**  
> Full-stack fairness auditing for datasets and ML/DL models — with regulatory compliance checking, AI-generated audit narratives, and persistent user history.

---

```
╔══════════════════════════════════════════════════════════════════════╗
║  Upload Dataset or ONNX Model  →  Compute Fairness Metrics          ║
║  →  Compliance Check  →  AI Audit Narrative  →  Save to History     ║
╚══════════════════════════════════════════════════════════════════════╝
```

</div>

---

## 📋 Table of Contents

- [What Is FairSight?](#-what-is-fairsight)
- [Live Features](#-live-features)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Fairness Metrics Explained](#-fairness-metrics-explained)
- [Regulatory Compliance Checks](#-regulatory-compliance-checks)
- [ML/DL Model Support](#-mldl-model-support)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)

---

## 🔍 What Is FairSight?

FairSight is a **competition-grade AI fairness auditing platform** built with Next.js. It lets researchers, engineers, and compliance officers:

| What You Bring | What FairSight Returns |
|---|---|
| A CSV / JSON dataset | Bias metrics across every protected group |
| A trained ONNX model + dataset | Prediction fairness audit with feature importance |
| Either of the above | 6-regulation compliance scorecard |
| Either of the above | AI-written audit narrative (Google Gemini) |
| A user account | Full persistent history across sessions |

---

## ✨ Live Features

<details>
<summary><b>📊 Dataset Bias Analysis</b> — click to expand</summary>

- Upload CSV or JSON datasets up to **500,000 rows** (auto-stratified to 100K for API)
- Auto-detect column roles: numeric, binary, categorical, text, protected attributes, target
- Missing-value strategies: drop rows, mean/mode imputation, keep as-is
- Class imbalance detection with severity flags
- Compute **6 fairness metrics** per protected attribute per group
- Proxy variable detection via Pearson/Cramér's V correlation
- Intersectional bias analysis (e.g. gender × race compound effects)
- Remediation roadmap with 5+ actionable fixes
- Auto-save to localStorage history + MongoDB (if logged in)

</details>

<details>
<summary><b>🤖 ML/DL Model Analysis</b> — click to expand</summary>

- Upload any **ONNX model** (sklearn, XGBoost, LightGBM, PyTorch, TensorFlow/Keras)
- Upload the corresponding dataset; map features visually
- Choose encoding: **Label Encoding** (sklearn/tree) or **One-Hot Encoding** (neural nets)
- Choose normalization: **Min-Max [0,1]** or **Z-Score (μ=0, σ=1)**
- Task type: auto-detected from output tensor shape or manually set
  - Binary classification → sigmoid/threshold
  - Multi-class → argmax over probability vector
  - Regression → continuous output + threshold-to-binary conversion
- **Permutation feature importance** (model-agnostic, in-browser)
- Advanced metrics: Counterfactual Fairness, Theil Index, Between-Group Variance
- Same 6 fairness metrics on model *predictions* vs actual outcomes

</details>

<details>
<summary><b>📜 Regulatory Compliance</b> — click to expand</summary>

Automatic scoring against 6 real-world regulations:

| Regulation | Jurisdiction | Key Metric |
|---|---|---|
| EEOC 4/5 Rule | 🇺🇸 United States | Disparate Impact Ratio ≥ 0.80 |
| EU AI Act | 🇪🇺 European Union | Score ≥ 70, DPD < 0.15 |
| GDPR Article 22 | 🇪🇺 European Union | DPD < 0.20, no high-risk proxies |
| NYC Local Law 144 | 🗽 New York City | DIR ≥ 0.80, annual audit required |
| ECOA / Fair Lending | 🇺🇸 United States | DIR ≥ 0.80, DPD < 0.10 |
| ISO/IEC 42001 | 🌐 International | Score ≥ 75, ≥ 100 sample rows |

Each check returns: **Pass / Caution / Fail / Unknown** with a specific remediation recommendation.

</details>

<details>
<summary><b>✍️ AI Audit Narrative (Google Gemini)</b> — click to expand</summary>

One-click generation of a professional bias audit report via **Gemini 1.5 Pro**:

1. **Executive Summary** — score, risk level, critical finding
2. **Key Bias Findings** — 3–5 bullets with numeric values
3. **Who Is Affected** — demographic groups + real-world impact
4. **Root Causes** — data collection bias, historical patterns, proxies
5. **Priority Actions** — 3 ranked technical interventions
6. **Regulatory Risk** — which laws may be violated

Uses your `GOOGLE_AI_API_KEY` env var, or users can supply their own key in the UI.

</details>

<details>
<summary><b>🕐 History & Account System</b> — click to expand</summary>

- **Guest mode**: analyses auto-saved to `localStorage` (up to 50 entries)
- **Logged-in mode**: all activity synced to MongoDB
  - Full activity feed: logins, registrations, analyses, narratives
  - `totalAnalyses` counter on user profile
  - Auto-prunes to last 200 activities per user
- JWT auth stored in `httpOnly` cookie (7-day expiry)
- Register / Login modal in Navbar — no separate auth page
- User avatar with initials + dropdown: Activity History / Sign Out

</details>

---

## 🔄 How It Works

### Dataset Analysis Flow

```
User uploads CSV/JSON
        │
        ▼
  parseDataset()          ← lib/dataParser.js
  imputeMissingValues()   ← handles nulls/NaN
  analyzeDataQuality()    ← column roles, missing %, outliers
        │
        ▼
  POST /api/analyze       ← app/api/analyze/route.js
  stratifiedSample()      ← if > 100K rows, preserve group proportions
        │
        ▼
  analyzeDataset()        ← lib/biasAnalysis.js
  ├── demographicParityDifference()
  ├── disparateImpactRatio()
  ├── equalOpportunity()
  ├── predictiveParity()
  ├── detectProxyVariables()    ← Pearson + Cramér's V
  ├── intersectionalBias()
  └── generateRemediations()
        │
        ▼
  Results → localStorage + MongoDB (if logged in)
        │
        ▼
  /dashboard              ← Recharts visualizations
  ├── Compliance tab      ← checkCompliance() lib/compliance.js
  └── AI Report tab       ← POST /api/narrative → Gemini 1.5 Pro
```

### Model Analysis Flow

```
User uploads .onnx model + CSV dataset
        │
        ▼
  loadOnnxModel()         ← onnxruntime-web (WebAssembly, in-browser)
  buildEncoders()         ← label or one-hot encoding per column
  getEncodedDim()         ← computes tensor input shape after encoding
        │
        ▼
  runBatchInference()     ← batch size 64, progress callbacks
  ├── detectTaskFromOutput()   ← binary / multiclass / regression
  ├── Binary:      sigmoid output, threshold at 0.5
  ├── Multiclass:  argmax over probability vector
  └── Regression:  raw output, user-defined threshold
        │
        ▼
  attachPredictions()     ← adds __pred__ column to dataset
  thresholdRegressionPredictions()   ← regression → binary for metrics
        │
        ▼
  analyzeDataset()        ← same fairness engine as dataset flow
  permutationImportance() ← shuffle each feature, measure accuracy drop
  counterfactualFairness()← flip protected attr, measure prediction change
  theilIndex()            ← income inequality analog for predictions
  betweenGroupVariance()  ← variance in outcomes between groups
        │
        ▼
  Results → /model-dashboard
```

### Auth Flow

```
User clicks "Get started" in Navbar
        │
        ▼
  AuthModal.js (login/register form)
        │
        ▼
  POST /api/auth/register  or  POST /api/auth/login
  ├── connectDB()           ← lib/mongoose.js (singleton connection)
  ├── User.findOne() / User.create()
  ├── bcrypt.hash(password, 12)   ← on register
  ├── bcrypt.compare()            ← on login
  ├── Activity.create({ type: "login" | "register" })
  └── signToken() → setAuthCookie()   ← httpOnly JWT cookie, 7d
        │
        ▼
  AuthContext.login(user)   ← React context updates instantly
  Navbar shows avatar + name
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ /analyze │  │ /model   │  │ /dashboard│  │ /history     │  │
│  │ (upload) │  │ (upload) │  │ (results) │  │ (feed)       │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘  │
│       │              │              │                │          │
│       │    ┌─────────┴──────────────┴────────────┐  │          │
│       │    │         ONNX Runtime Web             │  │          │
│       │    │  (WebAssembly inference, in-browser) │  │          │
│       │    └──────────────────────────────────────┘  │          │
│       │                                              │          │
│  ┌────▼──────────────────────────────────────────────▼────────┐ │
│  │                    AuthContext + Navbar                      │ │
│  │           JWT cookie ←→ /api/auth/me (on load)             │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTP (fetch)
┌────────────────────────▼────────────────────────────────────────┐
│                      NEXT.JS SERVER (API Routes)                │
│                                                                 │
│  POST /api/analyze      ← dataset fairness engine              │
│  POST /api/narrative    ← Google Gemini 1.5 Pro                │
│  POST /api/auth/login   ┐                                       │
│  POST /api/auth/register├─ JWT cookie auth                      │
│  POST /api/auth/logout  │                                       │
│  GET  /api/auth/me      ┘                                       │
│  GET  /api/activity     ┐                                       │
│  POST /api/activity     ┘ ← user activity feed                 │
│                                                                 │
└────────────────┬───────────────────────┬────────────────────────┘
                 │                       │
    ┌────────────▼────────┐   ┌─────────▼──────────┐
    │      MongoDB        │   │  Google Gemini API  │
    │  Users collection   │   │  gemini-1.5-pro     │
    │  Activity collection│   └────────────────────┘
    └─────────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14.2** App Router | Server components + API routes in one codebase |
| Styling | **Tailwind CSS 3.4** | Utility-first, no runtime CSS-in-JS overhead |
| Charts | **Recharts 2.12** | Declarative React charts for metrics visualization |
| ML Inference | **ONNX Runtime Web 1.18** | Run any ONNX model in-browser via WebAssembly |
| CSV Parsing | **PapaParse 5.4** | Fast streaming CSV parser |
| PDF Export | **jsPDF + AutoTable** | Client-side PDF report generation |
| Auth | **bcryptjs + jsonwebtoken** | Secure password hashing + stateless JWT |
| Database | **MongoDB + Mongoose 9.5** | Flexible document model for activity logs |
| AI Narrative | **Google Gemini 1.5 Pro** | State-of-the-art text generation for audit reports |
| State | **React Context** | Lightweight global auth state, no Redux needed |

---

## 📐 Fairness Metrics Explained

<details>
<summary><b>Demographic Parity Difference (DPD)</b></summary>

```
DPD = P(Ŷ=1 | A=unprivileged) − P(Ŷ=1 | A=privileged)

Fair range: |DPD| < 0.10
```

Measures the raw gap in positive outcome rates between groups. A DPD of -0.15 means the unprivileged group receives the favorable outcome 15% less often.

</details>

<details>
<summary><b>Disparate Impact Ratio (DIR)</b></summary>

```
DIR = P(Ŷ=1 | A=unprivileged) ÷ P(Ŷ=1 | A=privileged)

Legal minimum: DIR ≥ 0.80 (EEOC 4/5 Rule)
```

The EEOC 4/5 Rule: if the unprivileged group's selection rate is less than 80% of the privileged group's rate, there is evidence of adverse impact under US employment law.

</details>

<details>
<summary><b>Equal Opportunity Difference (EOD)</b></summary>

```
EOD = TPR(unprivileged) − TPR(privileged)
    where TPR = P(Ŷ=1 | Y=1, A=group)

Fair range: |EOD| < 0.10
```

Requires an actual outcome column. Checks if truly qualified/eligible individuals across groups have equal chances of being correctly identified.

</details>

<details>
<summary><b>Predictive Parity Difference (PPD)</b></summary>

```
PPD = Precision(unprivileged) − Precision(privileged)
    where Precision = P(Y=1 | Ŷ=1, A=group)

Fair range: |PPD| < 0.10
```

Among those predicted positive, what fraction actually are? Groups should have similar precision — a low precision for one group means false positives fall disproportionately on them.

</details>

<details>
<summary><b>Theil Index</b></summary>

```
T = (1/n) Σ (yᵢ/ȳ) × ln(yᵢ/ȳ)

Range: 0 (perfect equality) → ∞
Concerning: T > 0.20
```

Borrowed from income inequality economics. Measures how unevenly favorable outcomes are distributed across the population — regardless of group membership.

</details>

<details>
<summary><b>Counterfactual Fairness</b></summary>

```
CF = P(Ŷ=1 | A=a, X=x) vs P(Ŷ=1 | A=a', X=x)
Flip the protected attribute, keep everything else identical.

Fair: < 5% of predictions change
```

The strongest individual fairness measure. Asks: "Would this person's outcome change if only their protected attribute were different?" Estimates this by actually flipping the attribute value and re-running inference.

</details>

---

## ⚖️ Regulatory Compliance Checks

```
┌─────────────────┬──────────────────┬───────────┬────────────────────────┐
│ Regulation       │ Jurisdiction     │ Status    │ Key Threshold          │
├─────────────────┼──────────────────┼───────────┼────────────────────────┤
│ EEOC 4/5 Rule   │ 🇺🇸 USA          │ Pass/Fail │ DIR ≥ 0.80             │
│ EU AI Act       │ 🇪🇺 EU           │ Pass/Fail │ Score ≥ 70, DPD < 0.15 │
│ GDPR Art. 22    │ 🇪🇺 EU           │ Pass/Caution│ DPD < 0.20           │
│ NYC Local Law 144│ 🗽 NYC          │ Pass/Fail │ DIR ≥ 0.80             │
│ ECOA / Fair Lending│ 🇺🇸 USA      │ Pass/Caution/Fail│ DIR ≥ 0.80, DPD < 0.10│
│ ISO/IEC 42001   │ 🌐 International │ Pass/Caution│ Score ≥ 75, n ≥ 100  │
└─────────────────┴──────────────────┴───────────┴────────────────────────┘
```

---

## 🤖 ML/DL Model Support

### Supported Model Formats

Only **ONNX** (`.onnx`) is supported. Export your model before uploading:

<details>
<summary><b>scikit-learn</b></summary>

```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

initial_type = [('float_input', FloatTensorType([None, X_train.shape[1]]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)

with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
```

</details>

<details>
<summary><b>PyTorch</b></summary>

```python
import torch

dummy_input = torch.randn(1, num_features)
torch.onnx.export(
    model, dummy_input, "model.onnx",
    export_params=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch'}, 'output': {0: 'batch'}}
)
```

</details>

<details>
<summary><b>TensorFlow / Keras</b></summary>

```python
import tf2onnx
import tensorflow as tf

spec = (tf.TensorSpec((None, num_features), tf.float32),)
model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec)

with open("model.onnx", "wb") as f:
    f.write(model_proto.SerializeToString())
```

</details>

<details>
<summary><b>XGBoost / LightGBM</b></summary>

```python
# XGBoost
from skl2onnx.common.data_types import FloatTensorType
from onnxmltools import convert_xgboost

initial_type = [('float_input', FloatTensorType([None, n_features]))]
onnx_model = convert_xgboost(xgb_model, initial_types=initial_type)

# LightGBM
from onnxmltools import convert_lightgbm
onnx_model = convert_lightgbm(lgb_model, initial_types=initial_type)

with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
```

</details>

### Encoding Guide

| Model Type | Encoding | Normalization |
|---|---|---|
| sklearn, XGBoost, LightGBM | Label Encoding | Min-Max [0,1] |
| PyTorch, TensorFlow neural nets | One-Hot Encoding | Z-Score (μ=0, σ=1) |
| SVM | Label Encoding | Z-Score (μ=0, σ=1) |

---

## 📁 Project Structure

```
fairsight/
├── app/
│   ├── page.js                  # Landing page (server component)
│   ├── layout.js                # Root layout — wraps app in AuthProvider
│   ├── globals.css
│   │
│   ├── analyze/
│   │   └── page.js              # Step wizard: upload → configure → run
│   ├── dashboard/
│   │   └── page.js              # Dataset results: metrics, compliance, AI report
│   ├── model/
│   │   └── page.js              # Model upload wizard + in-browser ONNX inference
│   ├── model-dashboard/
│   │   └── page.js              # Model results dashboard
│   ├── history/
│   │   └── page.js              # localStorage + MongoDB activity feed
│   │
│   └── api/
│       ├── analyze/route.js     # POST — runs dataset fairness analysis
│       ├── narrative/route.js   # POST — generates Gemini AI audit report
│       ├── activity/route.js    # GET/POST — user activity feed (MongoDB)
│       └── auth/
│           ├── login/route.js   # POST — authenticate, set JWT cookie
│           ├── register/route.js# POST — create account, set JWT cookie
│           ├── logout/route.js  # POST — clear cookie, log activity
│           └── me/route.js      # GET — return current user from cookie
│
├── components/
│   ├── Navbar.js                # Sticky nav — auth state aware
│   ├── AuthModal.js             # Login / Register modal
│   ├── FairnessGauge.js         # Animated SVG score gauge (0–100)
│   ├── RemediationCard.js       # Expandable remediation recommendation card
│   └── BiasMetricCard.js        # Metric value card with threshold badge
│
├── lib/
│   ├── biasAnalysis.js          # Core fairness engine (6 metrics, proxy vars, remediations)
│   ├── dataParser.js            # CSV/JSON parser, quality analysis, imputation
│   ├── modelLoader.js           # ONNX loader, encoders, batch inference, permutation importance
│   ├── advancedMetrics.js       # Counterfactual fairness, Theil index, calibration
│   ├── compliance.js            # 6-regulation compliance checker
│   ├── history.js               # localStorage history (50-entry cap)
│   ├── auth.js                  # JWT sign/verify, cookie helpers, getCurrentUser()
│   ├── authContext.js           # React context: AuthProvider + useAuth() hook
│   ├── mongoose.js              # MongoDB singleton connection
│   ├── utils.js                 # getBiasColor, formatters
│   └── models/
│       ├── User.js              # Mongoose schema: name, email, password (bcrypt), role
│       └── Activity.js          # Mongoose schema: userId, type, label, meta, results
│
├── .env.local                   # MONGODB_URI, JWT_SECRET, GOOGLE_AI_API_KEY
├── .env.local.example           # Template for above
├── next.config.js               # ONNX WebAssembly webpack config
├── tailwind.config.js           # Brand colors, animations
├── jsconfig.json                # Path aliases (@/*), IDE support
└── package.json
```

---

## 🌐 API Reference

<details>
<summary><b>POST /api/analyze</b> — Dataset Fairness Analysis</summary>

**Request body:**
```json
{
  "data": [{ "age": 34, "gender": "F", "hired": "1" }],
  "protectedAttributes": ["gender", "race"],
  "targetColumn": "hired",
  "favorableValues": ["1"],
  "actualColumn": null,
  "regressionThreshold": null
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "summary": {
      "fairnessScore": 74,
      "fairnessLevel": "Moderate Bias",
      "totalRows": 5000,
      "protectedAttributes": ["gender"]
    },
    "metricsPerAttribute": { "gender": { "demographicParity": {}, "disparateImpact": {} } },
    "proxyVariables": { "gender": [{ "column": "zipcode", "correlation": 0.72, "risk": "high" }] },
    "intersectional": {},
    "remediations": [{ "title": "Reweighting", "category": "Pre-processing", "severity": "high" }]
  },
  "sampled": false,
  "originalRows": 5000,
  "analyzedRows": 5000
}
```

</details>

<details>
<summary><b>POST /api/narrative</b> — AI Audit Report</summary>

**Request body:**
```json
{
  "results": { "summary": {}, "metricsPerAttribute": {}, "proxyVariables": {}, "remediations": [] },
  "apiKey": "optional-override-key"
}
```

**Response:**
```json
{
  "success": true,
  "narrative": "## Executive Summary\n..."
}
```

</details>

<details>
<summary><b>POST /api/auth/register</b> — Create Account</summary>

**Request body:**
```json
{ "name": "Jane Smith", "email": "jane@example.com", "password": "securepass123" }
```

**Response:** Sets `httpOnly` JWT cookie. Returns user object (no password).

</details>

<details>
<summary><b>POST /api/auth/login</b> — Authenticate</summary>

**Request body:**
```json
{ "email": "jane@example.com", "password": "securepass123" }
```

**Response:** Sets `httpOnly` JWT cookie. Returns user object.

</details>

<details>
<summary><b>GET /api/activity?limit=50</b> — Fetch Activity Feed</summary>

**Auth:** Requires valid JWT cookie.

**Response:**
```json
{
  "activities": [
    { "_id": "...", "type": "dataset_analysis", "label": "Analyzed hiring_data.csv", "meta": { "fairnessScore": 74 }, "createdAt": "2024-01-15T10:30:00Z" }
  ]
}
```

</details>

<details>
<summary><b>POST /api/activity</b> — Save Activity</summary>

**Auth:** Requires valid JWT cookie.

**Request body:**
```json
{
  "type": "dataset_analysis",
  "label": "Analyzed hiring_data.csv",
  "meta": { "filename": "hiring_data.csv", "fairnessScore": 74, "totalRows": 5000 }
}
```

Valid `type` values: `dataset_analysis`, `model_analysis`, `narrative_generated`, `history_viewed`, `login`, `logout`, `register`

</details>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** (Atlas free tier works perfectly)
- **Google AI API key** (free at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/fairsight.git
cd fairsight

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and keys

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create `.env.local` in the project root:

```bash
# MongoDB — required for login/register/activity history
# Get a free cluster at mongodb.com/atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fairsight?retryWrites=true&w=majority

# JWT signing secret — use a long random string in production
JWT_SECRET=change-me-to-a-random-secret-at-least-32-chars

# Google Gemini API key — for AI audit narrative generation
# Get one free at aistudio.google.com
GOOGLE_AI_API_KEY=your-key-here
```

> **Note:** `GOOGLE_AI_API_KEY` is optional — users can supply their own key directly in the dashboard UI if the env var is not set.

---

## 📊 Fairness Score Formula

```
Score = 100

For each protected attribute:
  For each metric (DPD, DIR, EOD, PPD):
    If metric fails threshold:
      Score -= penalty (5–25 points based on severity)

Proxy variables:
  Each high-risk proxy:   −10 points
  Each medium-risk proxy: −5 points

Final score clamped to [0, 100]

Levels:
  80–100 → Low Bias (green)
  60–79  → Moderate Bias (yellow)
  0–59   → High Bias (red)
```

---

## 🛠️ Key Design Decisions

| Decision | Rationale |
|---|---|
| ONNX inference runs in the browser (WebAssembly) | No model data ever leaves the user's machine — privacy-preserving |
| Stratified sampling for large datasets | Preserves group proportions so fairness metrics remain accurate |
| `httpOnly` JWT cookies (not localStorage) | Prevents XSS token theft; cookies are inaccessible to JavaScript |
| Singleton Mongoose connection via `global._mongooseCache` | Prevents connection storms in serverless/edge environments |
| Activity auto-pruned to 200 per user | Keeps MongoDB storage bounded without manual cleanup |
| Guest mode with localStorage | Zero friction — fairness analysis works without creating an account |

---

<div align="center">

Built with ❤️ for AI fairness • Next.js + MongoDB + Google Gemini + ONNX Runtime

</div>
