import Link from "next/link";
import Navbar from "@/components/Navbar";

const FEATURES = [
  {
    icon: "📊",
    gradient: "from-blue-500 to-indigo-600",
    glow: "rgba(99,102,241,0.2)",
    title: "Multi-Metric Analysis",
    desc: "Compute Demographic Parity, Disparate Impact, Equal Opportunity, and Predictive Parity — the full fairness toolkit.",
  },
  {
    icon: "🔍",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.2)",
    title: "Proxy Variable Detection",
    desc: "Automatically surface features correlated with protected attributes that could encode indirect discrimination.",
  },
  {
    icon: "🧩",
    gradient: "from-fuchsia-500 to-pink-600",
    glow: "rgba(236,72,153,0.2)",
    title: "Intersectional Bias",
    desc: "Detect compounded bias at the intersection of multiple attributes — gender × race, age × disability, and more.",
  },
  {
    icon: "💡",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.2)",
    title: "Actionable Remediations",
    desc: "Concrete, prioritized fix strategies: reweighting, fairness constraints, threshold optimization, governance.",
  },
  {
    icon: "📈",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.2)",
    title: "Visual Dashboards",
    desc: "Interactive charts and distribution graphs make disparities immediately visible to technical and non-technical audiences.",
  },
  {
    icon: "📄",
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.2)",
    title: "Audit Reports",
    desc: "Export a complete fairness audit report for compliance, stakeholder review, and regulatory documentation.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: "⬆️",
    color: "from-blue-500 to-indigo-600",
    title: "Upload Your Dataset",
    desc: "Drop any CSV file — hiring records, loan applications, medical assessments. We auto-detect column types.",
  },
  {
    num: "02",
    icon: "⚙️",
    color: "from-violet-500 to-purple-600",
    title: "Configure the Analysis",
    desc: "Select protected attributes (gender, race, age) and the outcome variable. We auto-identify the privileged group.",
  },
  {
    num: "03",
    icon: "✅",
    color: "from-emerald-500 to-teal-600",
    title: "Review & Act",
    desc: "Get a full fairness report with bias scores, visualizations, and a prioritized remediation roadmap.",
  },
];

const METRICS = [
  { name: "Demographic Parity", threshold: "≤ 0.10", rule: "Difference in positive outcome rates across groups", icon: "⚖️" },
  { name: "Disparate Impact", threshold: "≥ 0.80", rule: "80% rule — unprivileged rate ÷ privileged rate", icon: "📐" },
  { name: "Equal Opportunity", threshold: "≤ 0.10", rule: "True positive rate parity across groups", icon: "🎯" },
  { name: "Predictive Parity", threshold: "≤ 0.10", rule: "Precision equality — when predictions are positive", icon: "🔮" },
];

const PROBLEMS = [
  { domain: "Hiring", icon: "👤", stat: "83%", desc: "of large companies use AI screening tools that have demonstrated gender or racial bias", color: "from-red-500 to-rose-600", bg: "bg-red-50", border: "border-red-100" },
  { domain: "Lending", icon: "💳", stat: "2.5×", desc: "higher loan rejection rate for Black applicants vs white applicants with similar credit profiles", color: "from-orange-500 to-amber-600", bg: "bg-orange-50", border: "border-orange-100" },
  { domain: "Healthcare", icon: "⚕️", stat: "56%", desc: "of medical AI tools have never been tested for racial or demographic bias before deployment", color: "from-yellow-500 to-amber-500", bg: "bg-yellow-50", border: "border-yellow-100" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#1a1040] to-slate-900 text-white min-h-[92vh] flex items-center">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-[-5%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute top-40 right-[-5%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-0 left-[30%] w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[140px] animate-float-slower" />
          {/* Dot grid */}
          <div className="absolute inset-0 dot-grid opacity-[0.07]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-sm mb-8 animate-fade-in-up">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-slate-300">Google Solution Challenge 2026</span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] mb-6 animate-fade-in-up-delay">
              Detect AI Bias
              <span className="block gradient-text mt-1">Before It Harms</span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl animate-fade-in-up-delay2">
              FairSight finds hidden discrimination in datasets and AI models —
              measuring fairness, flagging bias, and providing a clear roadmap to
              fix it before real people are impacted.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up-delay2">
              <Link
                href="/analyze"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 btn-glow text-lg shadow-xl shadow-brand-900/40"
              >
                Analyze a Dataset
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-lg"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Right — floating mock cards */}
          <div className="hidden lg:flex items-center justify-center relative h-[480px]">
            {/* Main card */}
            <div className="absolute left-8 top-8 glass rounded-2xl p-5 w-72 shadow-2xl animate-float z-20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                <span className="text-xs font-semibold text-slate-700">Bias Detected</span>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">38</div>
              <div className="text-xs text-slate-500 mb-3">Fairness Score / 100</div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: "38%" }} />
              </div>
            </div>

            {/* Metric card 1 */}
            <div className="absolute right-4 top-4 glass rounded-2xl p-4 w-56 shadow-xl animate-float-slow z-20">
              <div className="text-xs text-slate-500 mb-1">Demographic Parity</div>
              <div className="text-2xl font-bold text-red-600 mb-1">-0.312</div>
              <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Biased</span>
            </div>

            {/* Metric card 2 */}
            <div className="absolute right-0 bottom-24 glass rounded-2xl p-4 w-56 shadow-xl animate-float-slower z-20">
              <div className="text-xs text-slate-500 mb-1">Disparate Impact</div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">0.71</div>
              <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">Below 80% Rule</span>
            </div>

            {/* Group distribution mini */}
            <div className="absolute left-0 bottom-8 glass rounded-2xl p-4 w-64 shadow-xl animate-float z-20" style={{ animationDelay: "2s" }}>
              <div className="text-xs text-slate-500 mb-2">Outcome Rate by Gender</div>
              {[["Male", 72, "#6366F1"], ["Female", 41, "#EC4899"], ["Non-binary", 38, "#8B5CF6"]].map(([g, v, c]) => (
                <div key={g} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-600 w-20 flex-shrink-0">{g}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: c }} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 w-8 text-right">{v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "4+", label: "Fairness Metrics", icon: "📊" },
              { value: "Auto", label: "Proxy Detection", icon: "🔍" },
              { value: "Real-time", label: "Analysis Speed", icon: "⚡" },
              { value: "5 Types", label: "Remediation Plans", icon: "🛠️" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="stagger-item text-center p-6 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all duration-200 card-hover"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black text-slate-900 mb-1">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem section ── */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-sm text-red-700 font-medium mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> Real-world Impact
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The Problem We're Solving</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Automated systems now make life-changing decisions about who gets hired, approved for loans, or
              receives medical care. When trained on flawed data, they silently amplify discrimination — at
              scale, without accountability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROBLEMS.map((item, i) => (
              <div
                key={item.domain}
                className={`stagger-item border rounded-2xl p-8 ${item.bg} ${item.border} card-hover group cursor-default`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className={`text-5xl font-extrabold mb-2 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                  {item.stat}
                </div>
                <div className="font-bold text-slate-800 mb-2 text-lg">{item.domain}</div>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-sm text-brand-700 font-medium mb-4">
              Simple 3-Step Process
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How FairSight Works</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              From raw data to a complete, actionable fairness audit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[calc(33%-20px)] right-[calc(33%-20px)] h-0.5 bg-gradient-to-r from-brand-200 via-purple-300 to-emerald-200 z-0" />

            {STEPS.map((step, i) => (
              <div key={step.num} className="stagger-item relative z-10 text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  {step.icon}
                </div>
                <div className="text-xs font-black text-slate-300 mb-2 tracking-widest">{step.num}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f8faff 0%, #f3f0ff 50%, #fdf2f8 100%)" }}>
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600 font-medium mb-4 shadow-sm">
              Full Feature Set
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need to Ensure Fairness</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              A complete fairness toolkit for data scientists, compliance officers, and policymakers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="stagger-item bg-white rounded-2xl border border-white/80 p-7 card-hover group shadow-sm"
                style={{ "--glow": f.glow }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-xl mb-5 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics reference ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-sm text-emerald-700 font-medium mb-4">
              Industry Standard
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Fairness Metrics</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Same metrics adopted by Google, IBM, Microsoft, and regulatory bodies worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {METRICS.map((m, i) => (
              <div
                key={m.name}
                className="stagger-item flex items-start gap-5 bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-2xl p-6 card-hover"
              >
                <div className="text-3xl flex-shrink-0">{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="font-bold text-slate-900">{m.name}</h3>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono px-2 py-0.5 rounded-lg">
                      {m.threshold}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{m.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 animated-gradient" style={{ backgroundSize: "300% 300%" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute inset-0 dot-grid opacity-10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            No account required
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to audit your system for bias?</h2>
          <p className="text-xl text-brand-200 mb-12 max-w-2xl mx-auto">
            Upload a CSV file and get a complete fairness analysis in seconds — free, instant, no signup.
          </p>
          <Link
            href="/analyze"
            className="group inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-12 py-5 rounded-2xl text-xl hover:bg-brand-50 transition-all duration-200 shadow-2xl shadow-black/20 hover:scale-105"
          >
            Start Free Analysis
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-white font-bold">FairSight</span>
          </div>
          <p className="text-sm">Built for Google Solution Challenge 2026 — Ensuring AI Fairness for Everyone</p>
        </div>
      </footer>
    </div>
  );
}
