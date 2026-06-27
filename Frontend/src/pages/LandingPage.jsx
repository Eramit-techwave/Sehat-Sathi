import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, FileText, Sparkles, Key, Upload, Heart, Zap, CheckCircle2, 
  Award, Eye, EyeOff, Stethoscope, Clock, Pill, Droplet, Users, 
  MapPin, Phone, Calendar, MessageSquare, Video, Headphones, Shield, 
  Wallet, TrendingUp, AlertCircle as AlertIcon 
} from "lucide-react";

// ── DATA LEDGERS ──────────────────────────────────────────────────────────
const WHY_CHOOSE_FEATURES = [
  { icon: "🔬", title: "AI Report Analysis", desc: "Understand medical reports instantly.", color: "#3b82f6", gradient: "rgba(59,130,246,0.1)" },
  { icon: "👨‍⚕️", title: "Trusted Doctor Consultation", desc: "Connect with verified doctors online.", color: "#60a5fa", gradient: "rgba(96,165,250,0.1)" },
  { icon: "📅", title: "Easy Appointment Booking", desc: "Skip hospital queues and save time.", color: "#2563eb", gradient: "rgba(37,99,235,0.1)" },
  { icon: "🩸", title: "Blood Donor Network", desc: "Find blood donors during emergencies.", color: "#ef4444", gradient: "rgba(239,68,68,0.1)" },
  { icon: "💊", title: "Medicine Assistance", desc: "Locate nearby medical stores and medicines.", color: "#f59e0b", gradient: "rgba(245,158,11,0.1)" },
  { icon: "🔐", title: "Secure Health Records", desc: "Keep all reports organized safely.", color: "#22c55e", gradient: "rgba(34,197,94,0.1)" }
];

const DOCTOR_FEATURES = [
  { icon: <Video size={20} />, label: "Video Consultation", desc: "Face-to-face with specialists" },
  { icon: <Headphones size={20} />, label: "Audio Consultation", desc: "Quick voice consultations" },
  { icon: <MessageSquare size={20} />, label: "Chat Consultation", desc: "Text-based medical advice" },
  { icon: <Shield size={20} />, label: "Verified Profiles", desc: "Certified & experienced doctors" },
  { icon: <Clock size={20} />, label: "Instant Booking", desc: "No waiting, book immediately" },
  { icon: <TrendingUp size={20} />, label: "Specialist Doctors", desc: "Find doctors by specialty" }
];

const APPOINTMENT_PROCESS = [
  { step: "1", title: "Search Hospital", desc: "Find hospitals near you" },
  { step: "2", title: "Choose Doctor", desc: "Select your preferred doctor" },
  { step: "3", title: "Pick Time Slot", desc: "Choose convenient time" },
  { step: "4", title: "Book Appointment", desc: "Confirm and get details" }
];

const HOW_IT_WORKS_STEPS = [
  { step: "01", title: "Upload Medical Report", icon: "📥", desc: "Share your lab reports securely" },
  { step: "02", title: "AI Analyzes Report", icon: "🤖", desc: "Our AI processes your data" },
  { step: "03", title: "Get Health Insights", icon: "📊", desc: "Understand your health status" },
  { step: "04", title: "Consult Doctor", icon: "👨‍⚕️", desc: "Talk to verified specialists" },
  { step: "05", title: "Book Appointment", icon: "📅", desc: "Schedule follow-up visits" },
  { step: "06", title: "Track Progress", icon: "📈", desc: "Monitor your health journey" }
];

const BLOOD_DONOR_INFO = [
  { icon: <Users size={18} />, title: "Register as Donor", desc: "Help save lives in your community" },
  { icon: <AlertIcon size={18} />, title: "Request Blood", desc: "Find donors during emergencies" },
  { icon: <MapPin size={18} />, title: "Search Donors", desc: "Filter by location & blood group" },
  { icon: <Heart size={18} />, title: "Emergency Support", desc: "24/7 emergency blood access" }
];

const HEALTH_DATA = {
  diabetes: {
    label: "Diabetes", color: "#3b82f6", icon: "🩸", title: "Type-2 Diabetes Management Protocols",
    diet: ["Prioritize complex carbohydrates: oats, quinoa, brown rice over refined grains", "Incorporate high-fiber greens — spinach, broccoli, and kale daily", "Strictly eliminate refined sugars and high-glycemic commercial fruit juices"],
    exercise: ["Maintain 30 minutes of moderate brisk walking or indoor cycling daily", "Execute light resistance training 2–3× weekly for optimized insulin sensitivity", "Consistently monitor blood glucose parameters before and after training sessions"],
    tip: "Never skip meals. A highly consistent eating schedule prevents dangerous glycemic spikes."
  },
  hypertension: {
    label: "Hypertension", color: "#60a5fa", icon: "❤️", title: "Cardiovascular Care & Regulation Plan",
    diet: ["Follow the clinical DASH diet: increase intake of whole fruits and lean proteins", "Restrict daily sodium consumption strictly below 1,500 mg", "Prioritize potassium-dense items: organic bananas, avocados, sweet potatoes"],
    exercise: ["Engage in low-impact aerobic activity: swimming, light jogging, or structural aerobics", "Avoid heavy weightlifting cycles that cause immediate cardiovascular pressure spikes", "Incorporate 15 minutes of daily regulatory deep breathing or yoga sessions"],
    tip: "Always review packaged food labels — hidden sodium levels are heavily present in processed goods."
  },
  thyroid: {
    label: "Thyroid", color: "#2563eb", icon: "🦋", title: "Hypothyroidism Metabolic Optimization",
    diet: ["Incorporate standard iodine & selenium-dense nutrition: eggs, dairy, whole grains", "Always cook goitrogens (cabbage, cauliflower, broccoli) thoroughly before consumption", "Maintain an elevated clean lean protein baseline to optimize natural basal metabolic rates"],
    exercise: ["Perform consistent moderate-intensity cardio workouts to counter metabolic slowing", "Execute strength training modules to build lean mass and increase resting energy expenditure", "Execute thorough joint warm-ups — thyroid imbalances frequently trigger structural stiffness"],
    tip: "Take prescribed thyroid regulation medications strictly on an empty stomach, 30–60 minutes before breakfast."
  }
};

const BMI_DATA = [
  { height: "5'2\" (157 cm)", range: "46 – 61 kg" },
  { height: "5'6\" (168 cm)", range: "53 – 70 kg" },
  { height: "5'10\" (178 cm)", range: "61 – 80 kg" },
  { height: "6'2\" (188 cm)", range: "70 – 91 kg" }
];

const STEPS = [
  { n: "01", title: "Create Profile", desc: "Initialize your profile securely and unlock your dedicated health data repository." },
  { n: "02", title: "Upload Records", desc: "Ingest document binaries via PDF format or capture clear smartphone diagnostic logs." },
  { n: "03", title: "Neural Extraction", desc: "Our multimodal vision algorithm extracts and structures raw data tables instantly." },
  { n: "04", title: "Review Assessment", desc: "Access simplified parameter explanations and view long-term digital health trends." }
];

export default function LandingPage() {
  const { loginNode, registerNode, loginWithGoogle, resetPassword } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [activeTab, setActiveTab] = useState("diabetes");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Patient");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("input");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [medicalRegNumber, setMedicalRegNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [signupPending, setSignupPending] = useState(false);

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
    if (authMode === "signup") {
      const result = await registerNode(
        name, email, password, selectedRole, null,
        medicalRegNumber || undefined,
        registrationNumber || undefined
      );
      if (result.success) {
        if (result.verification_required) {
          setSignupPending(true);
          setAuthOpen(false);
          setEmail(""); setPassword(""); setName("");
          setMedicalRegNumber(""); setRegistrationNumber("");
        } else {
          alert(`✅ Account created as ${selectedRole}! Please Sign In.`);
          setAuthMode("login");
          setPassword("");
        }
      } else {
        alert(`❌ Signup Failed: ${result.error}`);
      }
    } else {
      const result = await loginNode(email, password);
      if (result.success) {
        setAuthOpen(false);
        setEmail(""); setPassword(""); setName("");
      } else {
        alert(`❌ Authentication Failed Try again: ${result.error}`);
      }
    }
  };

  const handleGoogleAuth = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      setAuthOpen(false);
    }
  };

  const handleForgotOpen = () => {
    setForgotEmail(""); setForgotStep("input"); setForgotLoading(false);
    setAuthOpen(false); setForgotOpen(true);
  };

  const handleForgotClose = () => {
    setForgotOpen(false); setForgotEmail(""); setForgotStep("input"); setForgotLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    const result = await resetPassword(forgotEmail);
    setForgotLoading(false);
    if (result.success) {
      setForgotStep("sent");
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleBackToLogin = () => {
    handleForgotClose(); setAuthMode("login"); setAuthOpen(true);
  };

  const tab = HEALTH_DATA[activeTab] || HEALTH_DATA["diabetes"];
  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: "6px" };
  const selectStyle = { width: "100%", background: "#091022", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#fbbf24", fontSize: 13, fontWeight: "600", outline: "none", boxSizing: "border-box", marginTop: "6px", cursor: "pointer" };

  return (
    <div style={{ background: "#030712", color: "#f3f4f6", minHeight: "100vh", width: "100vw", overflowX: "hidden" }}>
      {/* HERO SECTION */}
      <header className="relative" style={{ zIndex: 2, maxWidth: 1140, margin: "0 auto", padding: "80px 6% 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.18)", color: "#60a5fa", fontSize: 11, fontWeight: 600, padding: "6px 16px", borderRadius: 100, marginBottom: 24, letterSpacing: "0.05em" }}>
          <Sparkles size={12} /> AUTOMATED CLINICAL INTELLIGENCE FRAMEWORK
        </div>

        <h1 className="serif" style={{ fontSize: "clamp(38px, 5.2vw, 70px)", lineHeight: 1.1, color: "#ffffff", marginBottom: 20, letterSpacing: "-0.02em", margin: 0 }}>
          Understand your <br />
          <span className="shimmer-text">medical lab reports</span> <br />
          <em style={{ color: "#64748b", fontSize: "0.82em" }}>in plain, clinical clarity</em>
        </h1>

        <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 580, margin: "16px auto 36px", lineHeight: 1.7 }}>
          Transform unstructured diagnostic readouts, complex medical blood test sheets, and biochemical reports into completely structured explanations instantly.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ fontSize: 14, padding: "16px 36px" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
            Start Assessment Free
          </button>
        </div>

        <div style={{ marginTop: 64, position: "relative" }}>
          <div style={{ position: "absolute", top: 20, left: "2%", zIndex: 5, background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 18px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700, marginBottom: 2, letterSpacing: "0.04em" }}>HEMOGLOBIN BASAL</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>14.5 <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>g/dL</span></div>
            <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>● Reference Normal</div>
          </div>

          <div style={{ position: "absolute", bottom: 36, right: "2%", zIndex: 5, background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 18px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10 }}>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 8 }}>
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
            <br /><em style={{ color: "#64748b holiday" }}>Guidelines Sorted by Condition</em>
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
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍏</div>
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
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💪</div>
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

      {/* CALL TO ACTION */}
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

      {/* WHY CHOOSE SEHAT SATHI SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "60px 6%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Platform Features</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: "#ffffff", marginBottom: 12 }}>
            Why Choose Sehat Sathi?
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, maxWidth: 580, margin: "0 auto" }}>Complete healthcare ecosystem designed to make your medical journey seamless and transparent.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {WHY_CHOOSE_FEATURES.map((feature, idx) => (
            <div key={idx} className="card-hover" style={{ borderRadius: 16, padding: "28px", background: `${feature.gradient}80`, border: `1px solid ${feature.color}20`, textAlign: "left", cursor: "pointer", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: feature.gradient, filter: "blur(40px)", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{feature.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>{feature.title}</h4>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTOR CONSULTATION SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "60px 6%" }}>
        <div style={{ background: "linear-gradient(135deg, #0a1428, #0e1a38)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 24, padding: "50px 40px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Healthcare Service</div>
              <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 38px)", color: "#ffffff", lineHeight: 1.2, marginBottom: 16 }}>
                Consult Experienced <br />Doctors
              </h2>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>
                Connect with verified healthcare professionals from the comfort of your home. Choose your preferred consultation method and get medical advice instantly.
              </p>
              <button className="btn-primary" style={{ fontSize: 14, padding: "14px 32px", marginBottom: 24 }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
                Consult Now
              </button>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                ✓ Verified doctors | ✓ Confidential | ✓ Fast response
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {DOCTOR_FEATURES.map((feature, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "18px", textAlign: "center" }}>
                  <div style={{ color: "#60a5fa", marginBottom: 8, display: "flex", justifyContent: "center" }}>{feature.icon}</div>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>{feature.label}</h5>
                  <p style={{ fontSize: 11, color: "#64748b" }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOSPITAL APPOINTMENT SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "60px 6%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Seamless Booking</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: "#ffffff" }}>
            Book Hospital Appointments<br />Without Waiting
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, maxWidth: 580, margin: "20px auto 0" }}>Skip the queues. Get instant confirmation for your hospital visits.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {APPOINTMENT_PROCESS.map((item, idx) => (
            <div key={idx} style={{ position: "relative", textAlign: "center" }}>
              <div style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, fontWeight: 800, color: "#ffffff" }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>{item.title}</h4>
              <p style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</p>
              {idx < 3 && (
                <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", width: "100%", textAlign: "center", color: "#2563eb", fontSize: 20 }}>↓</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="btn-primary" style={{ fontSize: 14, padding: "14px 32px" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
            Book Appointment
          </button>
        </div>
      </section>

      {/* MEDICAL STORE SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "60px 6%" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 24, padding: "50px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" }}>
            <div style={{ order: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "🏪", title: "Nearby Stores", desc: "Medical stores close to you" },
                { icon: "🔍", title: "Availability Check", desc: "Check medicine stock instantly" },
                { icon: "📝", title: "Prescription Upload", desc: "Upload & verify prescriptions" },
                { icon: "🚚", title: "Fast Delivery", desc: "Quick home delivery support" }
              ].map((item, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "18px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>{item.title}</h5>
                  <p style={{ fontSize: 11, color: "#64748b" }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ order: 1, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Pharmacy Service</div>
              <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 38px)", color: "#ffffff", lineHeight: 1.2, marginBottom: 16 }}>
                Medicines At Your Fingertips
              </h2>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>
                Find nearby medical stores, check medicine availability, and upload prescriptions. Get your medicines delivered quickly and safely.
              </p>
              <button className="btn-primary" style={{ fontSize: 14, padding: "14px 32px" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
                Find Medicines
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BLOOD DONOR SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "60px 6%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Emergency Support</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: "#ffffff", marginBottom: 16 }}>
            Find Blood Donors When<br />You Need Them
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 600, margin: "0 auto" }}>
            Connect with verifiyed blood donors in your area. Request blood during emergencies or register as a donor to help save lives.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 32 }}>
          {BLOOD_DONOR_INFO.map((info, idx) => (
            <div key={idx} className="card-hover" style={{ borderRadius: 16, padding: "28px", background: "rgba(239,68,68,0.02)", border: "1px solid rgba(239,68,68,0.15)", textAlign: "center" }}>
              <div style={{ color: "#ef4444", marginBottom: 16, display: "flex", justifyContent: "center", background: "rgba(239,68,68,0.1)", width: 48, height: 48, borderRadius: "50%", alignItems: "center", margin: "0 auto 16px" }}>
                {info.icon}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>{info.title}</h4>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{info.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 20, padding: "40px", textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>Search Blood Donors</h3>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Filter donors by blood group, location, and availability status</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24, maxWidth: 600, margin: "0 auto 24px" }}>
            {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg, idx) => (
              <button key={idx} className="btn-ghost" style={{ fontSize: 13, fontWeight: 600, padding: "10px 16px", cursor: "pointer" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
                {bg}
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{ fontSize: 14, padding: "14px 32px" }} onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
            Find Donors Now
          </button>
        </div>
      </section>

      {/* HOW SEHAT SATHI WORKS SECTION */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1140, margin: "0 auto 80px", padding: "60px 6%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Complete Journey</div>
          <h2 className="serif" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: "#ffffff" }}>
            How Sehat Sathi Works
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, maxWidth: 580, margin: "20px auto 0" }}>From upload to health tracking, we guide you through every step.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {HOW_IT_WORKS_STEPS.map((item, idx) => (
            <div key={idx} className="card-hover" style={{ borderRadius: 16, padding: "28px", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 12, right: 16, fontSize: 11, color: "#1d4ed8", fontFamily: "monospace", fontWeight: 700 }}>{item.step}</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>{item.title}</h4>
              <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUTH MODAL WITH ROLE SELECTOR */}
      {authOpen && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(2,4,8,0.8)", backdropFilter: "blur(16px)" }} onClick={() => setAuthOpen(false)}>
          <div className="modal-card" style={{ width: "100%", maxWidth: 420, background: "#0b1329", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "24px 32px 28px", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }} onClick={() => setAuthOpen(false)}>✕</button>

            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: "0 6px 16px rgba(37,99,235,0.2)" }}>
                <Activity size={18} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 3 }}>{authMode === "login" ? "Verify Credentials" : "Provision Profile"}</h3>
              <p style={{ fontSize: 11, color: "#64748b" }}>{authMode === "login" ? "Access secure monitoring layers" : "Configure localized user access paths"}</p>
            </div>

            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {authMode === "signup" && (
                <>
                  <div>
                    <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>FULL NAME</label>
                    <input className="input-field" type="text" required placeholder="Enter Your Name " value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>REGISTER AS</label>
                    
                    <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={selectStyle}>
                      <option value="Patient">🧑 Patient</option>
                      <option value="Doctor">👨‍⚕️ Doctor / Specialist</option>
                      <option value="Hospital">🏥 Hospital</option>
                    </select>
                  </div>

                  {/* Doctor-specific extra fields */}
                  {selectedRole === "Doctor" && (
                    <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700, marginBottom: 8, letterSpacing: "0.04em" }}>DOCTOR DETAILS</div>
                      <input type="text" placeholder="Medical Registration Number (e.g. MCI-2024-XXXXX)" value={medicalRegNumber} onChange={e => setMedicalRegNumber(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                      <p style={{ fontSize: 10, color: "#64748b", marginTop: 6 }}>⚠️ Your account will be reviewed before activation.</p>
                    </div>
                  )}

                  {/* Hospital-specific extra fields */}
                  {selectedRole === "Hospital" && (
                    <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, marginBottom: 6, letterSpacing: "0.04em" }}>HOSPITAL DETAILS</div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(245,158,11,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>🏥</span>
                        <div>
                          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginBottom: 2 }}>Unique Hospital ID will be auto-assigned for your hospital</div>
                          <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5 }}>A unique platform ID (e.g. <code style={{ color: "#fbbf24" }}>HSP548921</code>) will be generated automatically upon registration. No manual entry needed.</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 10, color: "#64748b", marginTop: 8 }}>⚠️ Congratulation Your hospital will be listed publicly only once after admin verification.</p>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL NETWORK KEY</label>
                <input className="input-field" type="email" required placeholder="Enter Your Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              
              <div>
                <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>SECURITY ACCESS PHRASE</label>
                <div style={{ position: "relative" }}>
                  <input className="input-field" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(prev => !prev)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authMode === "login" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
                  <button type="button" onClick={handleForgotOpen} style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: 4, width: "100%", fontSize: 13 }}>
                {authMode === "login" ? "Authenticate →" : "Authorize Session →"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0", opacity: 0.5 }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              </div>

              <button type="button" onClick={handleGoogleAuth} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "12px 16px", color: "#fff", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92(1.35?):8.09z" />
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

      {/* FORGOT PASSWORD MODAL */}
      {forgotOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(2,4,8,0.8)", backdropFilter: "blur(16px)" }} onClick={handleForgotClose}>
          <div style={{ width: "100%", maxWidth: 390, background: "#0b1329", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px 36px 36px", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }} onClick={handleForgotClose}>✕</button>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 6px 16px rgba(37,99,235,0.2)" }}>
                <Key size={20} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>
                {forgotStep === "sent" ? "Reset Link Dispatched" : "Reset Access Phrase"}
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                {forgotStep === "sent" ? `A reset link has been sent to ${forgotEmail}. Check your inbox.` : "Enter your registered email and we'll dispatch a secure reset link."}
              </p>
            </div>

            {forgotStep === "input" ? (
              <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>REGISTERED EMAIL ADDRESS</label>
                  <input className="input-field" type="email" required placeholder="Enter Your Email ID" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ marginTop: 4, width: "100%", fontSize: 13, opacity: forgotLoading ? 0.7 : 1, cursor: forgotLoading ? "not-allowed" : "pointer" }}>
                  {forgotLoading ? "Dispatching Link..." : "Send Reset Link →"}
                </button>
                <div style={{ textAlign: "center" }}>
                  <button type="button" onClick={handleBackToLogin} style={{ background: "none", border: "none", color: "#60a5fa", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>← Back to Sign In</button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📬</div>
                  <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>If this email is registered, you'll receive a reset link shortly. Check spam folder too.</p>
                </div>
                <button type="button" className="btn-primary" onClick={handleBackToLogin} style={{ width: "100%", fontSize: 13 }}>← Return to Sign In</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PENDING VERIFICATION SUCCESS MODAL */}
      {signupPending && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(2,4,8,0.9)", backdropFilter: "blur(20px)" }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0b1329", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 24, padding: "36px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", marginBottom: 8 }}>Account Under Review</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>
              Your registration has been submitted successfully! Our admin team will review your credentials and credentials within and you will get approved  <strong style={{ color: "#60a5fa" }}>24–48 hours</strong>.
              <br /><br />
              Once approved, you'll be able to log in and access your full dashboard !.

            </p>
            <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 8 }}>WHAT HAPPENS NEXT</div>
              {["Admin reviews your registration details", "Your credentials are verified against records", "You receive access notification once approved", "You can then login and set up your profile"].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 12 }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{step}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: "100%", fontSize: 13 }} onClick={() => { setSignupPending(false); setAuthMode("login"); setAuthOpen(true); }}>
              Go For Sign In When Ready →
            </button>
          </div>
        </div>
      )}

     {/* CORPORATE FOOTER SECTION */}
      <footer style={{ background: "#030712", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "80px", paddingTop: "60px", paddingBottom: "20px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 6%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 40, marginBottom: 60 }}>

            {/* Brand Column */}
            <div style={{ textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Heart size={16} style={{ color: "#ffffff" }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", margin: 0 }}>SehatSathi</h4>
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 0 }}>
                A comprehensive AI-powered healthcare platform designed to simplify medical report interpretation, connect patients with verified doctors, and make quality healthcare accessible to every Indian.
              </p>
            </div>

            {/* Services Column */}
            <div style={{ textAlign: "left" }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 16px 0" }}>Services</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0 }}>
                {["AI Report Analysis", "Doctor Consultation", "Hospital Appointments", "Blood Donor Network", "Medicine Assistance"].map((title, i) => (
                  <li key={i}><a href="#" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#94a3b8"} onMouseLeave={e => e.target.style.color = "#64748b"}>{title}</a></li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div style={{ textAlign: "left" }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 16px 0" }}>Company</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0 }}>
                {["Our Mission", "Meet the Team", "Blog & Updates", "Press Kit", "Careers"].map((link, i) => (
                  <li key={i}><a href="#" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#94a3b8"} onMouseLeave={e => e.target.style.color = "#64748b"}>{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div style={{ textAlign: "left" }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 16px 0" }}>Legal & Support</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0 }}>
                {["Privacy Policy", "Terms of Service", "Contact Support", "FAQs", "Security"].map((title, i) => (
                  <li key={i}><a href="#" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#94a3b8"} onMouseLeave={e => e.target.style.color = "#64748b"}>{title}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider + Team Info */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 32, paddingBottom: 20 }}>
            <div style={{ background: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div style={{ textAlign: "left" }}>
                  <h5 style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Founder & Lead Engineer</h5>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: "#ffffff" }}>Amit Dubey</strong> — AI & Full-Stack Engineer
                    <br />Building technology-driven healthcare solutions to improve patient outcomes across India.
                  </p>
                </div>
                <div style={{ textAlign: "left" }}>
                  <h5 style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Our Mission</h5>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Empowering every Indian patient have right to understand their health data with clarity.
                    <br /><strong style={{ color: "#ffffff" }}>Making healthcare accessible, transparent, and intelligent — for everyone.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.03)" }}>
              <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>© 2026 <span style={{ color: "#60a5fa", fontWeight: 700 }}>SehatSathi</span>. All rights reserved.</p>
              <p style={{ fontSize: 11, color: "#334155", margin: 0 }}>Crafted with <span style={{ color: "#ef4444" }}>❤️</span> to advance healthcare in India.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
