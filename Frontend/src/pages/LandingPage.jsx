import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Activity, FileText, Sparkles, BarChart3, AlertTriangle, Key, Upload, Heart, Zap, CheckCircle2, Award } from "lucide-react";

const HEALTH_DATA = {
  diabetes: {
    label: "Diabetes",
    color: "#3b82f6",
    icon: "🩸",
    title: "Type-2 Diabetes Management Protocols",
    diet: [
      "Prioritize complex carbohydrates: oats, quinoa, brown rice over refined grains",
      "Incorporate high-fiber greens — spinach, broccoli, and kale daily",
      "Strictly eliminate refined sugars and high-glycemic commercial fruit juices",
    ],
    exercise: [
      "Maintain 30 minutes of moderate brisk walking or indoor cycling daily",
      "Execute light resistance training 2–3× weekly for optimized insulin sensitivity",
      "Consistently monitor blood glucose parameters before and after training sessions",
    ],
    tip: "Never skip meals. A highly consistent eating schedule prevents dangerous glycemic spikes.",
  },
  hypertension: {
    label: "Hypertension",
    color: "#60a5fa",
    icon: "❤️",
    title: "Cardiovascular Care & Regulation Plan",
    diet: [
      "Follow the clinical DASH diet: increase intake of whole fruits and lean proteins",
      "Restrict daily sodium consumption strictly below 1,500 mg",
      "Prioritize potassium-dense items: organic bananas, avocados, sweet potatoes",
    ],
    exercise: [
      "Engage in low-impact aerobic activity: swimming, light jogging, or structural aerobics",
      "Avoid heavy weightlifting cycles that cause immediate cardiovascular pressure spikes",
      "Incorporate 15 minutes of daily regulatory deep breathing or yoga sessions",
    ],
    tip: "Always review packaged food labels — hidden sodium levels are heavily present in processed goods.",
  },
  thyroid: {
    label: "Thyroid",
    color: "#2563eb",
    icon: "🦋",
    title: "Hypothyroidism Metabolic Optimization",
    diet: [
      "Incorporate standard iodine & selenium-dense nutrition: eggs, dairy, whole grains",
      "Always cook goitrogens (cabbage, cauliflower, broccoli) thoroughly before consumption",
      "Maintain an elevated clean lean protein baseline to optimize natural basal metabolic rates",
    ],
    exercise: [
      "Perform consistent moderate-intensity cardio workouts to counter metabolic slowing",
      "Execute strength training modules to build lean mass and increase resting energy expenditure",
      "Execute thorough joint warm-ups — thyroid imbalances frequently trigger structural stiffness",
    ],
    tip: "Take prescribed thyroid regulation medications strictly on an empty stomach, 30–60 minutes before breakfast.",
  },
};

const BMI_DATA = [
  { height: "5'2\" (157 cm)", range: "46 – 61 kg" },
  { height: "5'6\" (168 cm)", range: "53 – 70 kg" },
  { height: "5'10\" (178 cm)", range: "61 – 80 kg" },
  { height: "6'2\" (188 cm)", range: "70 – 91 kg" },
];

const STEPS = [
  { n: "01", title: "Create Profile", desc: "Initialize your profile securely and unlock your dedicated health data repository." },
  { n: "02", title: "Upload Records", desc: "Ingest document binaries via PDF format or capture clear smartphone diagnostic logs." },
  { n: "03", title: "Neural Extraction", desc: "Our multimodal vision algorithm extracts and structures raw data tables instantly." },
  { n: "04", title: "Review Assessment", desc: "Access simplified parameter explanations and view long-term digital health trends." },
];

export default function LandingPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [activeTab, setActiveTab] = useState("diabetes");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const openLogin = () => { setAuthMode("login"); setAuthOpen(true); };
    const openSignup = () => { setAuthMode("signup"); setAuthOpen(true); };

    window.addEventListener("trigger-login-modal", openLogin);
    window.addEventListener("trigger-signup-modal", openSignup);

    return () => {
      window.removeEventListener("trigger-login-modal", openLogin);
      window.removeEventListener("trigger-signup-modal", openSignup);
    };
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    const result = await loginWithEmail(email, password);
    if (result.success) {
      setAuthOpen(false);
      setEmail(""); setPassword(""); setName("");
    } else {
      alert(`Auth failed: ${result.error}`);
    }
  };

  const handleGoogleAuth = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      setAuthOpen(false);
    }
  };

  const tab = HEALTH_DATA[activeTab];

  return (
    <>
      {/* HERO SECTION */}
      <header className="relative" style={{ zIndex: 2, maxWidth: 1140, margin: "0 auto", padding: "80px 6% 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.18)", color: "#60a5fa", fontSize: 11, fontWeight: 600, padding: "6px 16px", borderRadius: 100, marginBottom: 24, letterSpacing: "0.05em" }}>
          <Sparkles size={12} /> AUTOMATED CLINICAL INTELLIGENCE FRAMEWORK
        </div>

        <h1 className="serif" style={{ fontSize: "clamp(38px, 5.2vw, 70px)", lineHeight: 1.1, color: "#ffffff", marginBottom: 20, letterSpacing: "-0.02em" }}>
          Understand your <br />
          <span className="shimmer-text">medical lab reports</span> <br />
          <em style={{ color: "#64748b", fontSize: "0.82em" }}>in plain, clinical clarity</em>
        </h1>

        <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Transform unstructured diagnostic readouts, complex medical blood test sheets, and biochemical reports into completely structured explanations instantly.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button className="btn-primary" style={{ fontSize: 14, padding: "16px 36px" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
            Start Assessment Free
          </button>
        </div>

        {/* HIGH-FIDELITY APP INTERACTION MOCKUP */}
        <div style={{ marginTop: 64, position: "relative" }}>
          <div className="float-card" style={{ position: "absolute", top: 20, left: "2%", zIndex: 5, background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 18px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700, marginBottom: 2, letterSpacing: "0.04em" }}>HEMOGLOBIN BASAL</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>14.5 <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>g/dL</span></div>
            <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>● Reference Normal</div>
          </div>

          <div className="float-card-2" style={{ position: "absolute", bottom: 36, right: "2%", zIndex: 5, background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 18px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 700, marginBottom: 2, letterSpacing: "0.04em" }}>FASTING GLUCOSE</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>112 <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>mg/dL</span></div>
            <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 4 }}>▲ Borderline Elevated</div>
          </div>

          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>sehatsathi_mesh_terminal // production</span>
              </div>
              <span style={{ fontSize: 11, color: "#60a5fa", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 6, padding: "3px 10px", fontFamily: "monospace" }}>
                Parser Active
              </span>
            </div>

            <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 20, alignItems: "center" }}>
              <div style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, height: 210, display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", justify: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>SOURCE_METRICS.PDF</span>
                  <FileText size={14} className="text-blue-500" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.2 }}>
                  <div style={{ height: 6, borderRadius: 3, width: "80%", background: "#fff" }} />
                  <div style={{ height: 6, borderRadius: 3, width: "50%", background: "#fff" }} />
                </div>
                <div className="report-line" />
                <span style={{ fontSize: 11, color: "#475569" }}>Processing raw report vectors...</span>
              </div>

              <div style={{ color: "#2563eb", fontSize: 16, fontWeight: "bold", textAlign: "center" }}>➔</div>

              <div style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, height: 210, display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", justify: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "#60a5fa", fontFamily: "monospace" }}>MAPPED_INDEX</span>
                  <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700 }}>99.4% Accurate</span>
                </div>
                {[{ n: "Hemoglobin Count", v: "14.5 g/dL" }, { n: "Glucose Index", v: "112 mg/dL" }, { n: "Serum Cholesterol", v: "178 mg/dL" }].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 12 }}>
                    <span style={{ color: "#94a3b8" }}>{r.n}</span>
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ANTHROPOMETRY RANGE METRICS SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto", padding: "40px 6%" }}>
        <div style={{ background: "#091022", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 24, padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Anthropometric Standards</div>
            <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 38px)", color: "#ffffff", lineHeight: 1.2, marginBottom: 16 }}>
              Ideal Physiological Proportions
              <br /><em style={{ color: "#64748b", fontSize: "0.78em" }}>Standard BMI 18.5 – 24.9 Parameters</em>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.65 }}>
              Optimal health metrics require keeping total body mass balanced relative to vertical skeletal framework constraints. View clinical weight tracking references.
            </p>
          </div>

          <div style={{ background: "#030712", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "left" }}>
              <span style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>HEIGHT RANGE</span>
              <span style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>OPTIMAL WEIGHT BASELINE</span>
            </div>
            {BMI_DATA.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "14px 18px", borderBottom: i < BMI_DATA.length - 1 ? "1px solid rgba(255,255,255,0.02)" : "none", textAlign: "left" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{row.height}</span>
                <span style={{ fontSize: 13, color: "#60a5fa", fontWeight: 600 }}>{row.range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEALTH HUB PLATFORM INTERACTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto", padding: "40px 6%", textAlign: "left" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Therapeutic Lifestyle Index</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 42px)", color: "#ffffff", fontWeight: 400 }}>
            Clinical Nutrition & Activity
            <br /><em style={{ color: "#64748b" }}>Guidelines Sorted by Condition</em>
          </h2>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: 6, width: "fit-content" }}>
          {Object.entries(HEALTH_DATA).map(([key, val]) => (
            <button key={key} className="tab-btn" onClick={() => setActiveTab(key)} style={{
              background: activeTab === key ? "rgba(37,99,235,0.15)" : "transparent",
              border: `1px solid ${activeTab === key ? "rgba(37,99,235,0.3)" : "transparent"}`,
              color: activeTab === key ? "#60a5fa" : "#64748b",
              padding: "10px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer"
            }}>
              <span style={{ marginRight: 6 }}>{val.icon}</span>{val.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div className="card-hover" style={{ borderRadius: 16, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", center: "center", justifyContent: "center", fontSize: 16 }}>🍏</div>
              <div>
                <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase" }}>DIETARY INTAKE GUIDANCE</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{tab.title}</div>
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {tab.diet.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: 16 }}>▪</span>
                  <span style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-hover" style={{ borderRadius: 16, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", center: "center", justifyContent: "center", fontSize: 16 }}>💪</div>
              <div>
                <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase" }}>EXERCISE FRAMEWORK</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>Prescribed Physical Activity Map</div>
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {tab.exercise.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: 16 }}>▪</span>
                  <span style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ background: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "16px 24px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>💡</span>
          <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6 }}><span style={{ color: "#ffffff", fontWeight: 700 }}>Clinical Advisory Summary:</span> {tab.tip}</p>
        </div>
      </section>

      {/* OPERATIONS ARCHITECTURE MAPPING */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto", padding: "40px 6% 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Operational Flow</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: "#ffffff" }}>How SehatSathi operates</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Four distinct execution stages from upload parameters to clarity.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {STEPS.map((step, i) => (
            <div key={i} className="card-hover" style={{ borderRadius: 16, padding: "26px", position: "relative" }}>
              <span style={{ position: "absolute", top: 16, right: 18, fontSize: 11, color: "#1d4ed8", fontFamily: "monospace", fontWeight: 700 }}>//{step.n}</span>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 16 }}>
                {["👤", "📥", "🔬", "📊"][i]}
              </div>
              <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{step.title}</h4>
              <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION LINK FOR REGISTRATION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "0 6%" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(30,58,138,0.03))", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 24, padding: "50px 32px", textAlign: "center" }}>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: "#ffffff", marginBottom: 12 }}>
            Ready to break down <br /><em style={{ color: "#60a5fa" }}>your clinical metrics?</em>
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Secure your timeline historical logs within our database structures for free.</p>
          <button className="btn-primary" style={{ fontSize: 14, padding: "15px 36px" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
            Initialize Architecture Gateway
          </button>
        </div>
      </section>

      {/* ACCOUNT AUTHORIZATION MODAL WINDOW WITH GOOGLE SIGN-IN */}
      {authOpen && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(2,4,8,0.8)", backdropFilter: "blur(16px)" }} onClick={() => setAuthOpen(false)}>
          <div className="modal-card" style={{ width: "100%", maxWidth: 390, background: "#0b1329", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px 36px 36px", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }} onClick={() => setAuthOpen(false)}>✕</button>
            
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 6px 16px rgba(37,99,235,0.2)" }}>
                <Activity size={20} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>{authMode === "login" ? "Verify Credentials" : "Provision Profile"}</h3>
              <p style={{ fontSize: 12, color: "#64748b" }}>{authMode === "login" ? "Access secure monitoring layers" : "Configure localized user access paths"}</p>
            </div>

            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {authMode === "signup" && (
                <div>
                  <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>FULL OPERATIONAL NAME</label>
                  <input className="input-field" type="text" required placeholder="Amit Dubey" value={name} onChange={e => setName(e.target.value)} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL NETWORK KEY</label>
                <input className="input-field" type="email" required placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>SECURITY ACCESS PHRASE</label>
                <input className="input-field" type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              
              <button type="submit" className="btn-primary" style={{ marginTop: 4, width: "100%", fontSize: 13 }}>
                {authMode === "login" ? "Authenticate →" : "Authorize Session →"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0", opacity: 0.5 }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              </div>

              <button 
                type="button"
                onClick={handleGoogleAuth}
                style={{
                  width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px", padding: "12px 16px", color: "#fff", fontSize: "13px", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {authMode === "login" ? "Unregistered identity node? " : "Credentials already provisioned? "}
                <button style={{ background: "none", border: "none", color: "#60a5fa", fontWeight: 700, cursor: "pointer", fontSize: 12 }} onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                  {authMode === "login" ? "Register Node" : "Sign In"}
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}