/**
 * SymptomChecker — AI-powered symptom analysis for patients.
 * Sehat-Sathi | Updated August 2026
 *
 * Includes:
 * - Render server sleep handling & wakingUp state
 * - Fixed parseAIResponse warningSigns collector
 * - Warning signs UI card display
 * - Smart error messages & instant Retry button
 */
import { useState, useRef } from "react";
import { ArrowLeft, Send, Bot, AlertTriangle, Stethoscope, ShieldCheck, FlaskConical, Loader2, RefreshCw } from "lucide-react";
import DS from "../../ui/design-system";
import T from "../../ui/tokens";

const API_BASE = "https://sehat-sathi-ce58.onrender.com";

const RISK_CONFIG = {
  low:       { label: "Low Risk",      color: T.green,  bg: T.greenLight,  border: T.greenBorder,  icon: "🟢" },
  moderate:  { label: "Moderate Risk", color: T.amber,  bg: T.amberLight,  border: T.amberBorder,  icon: "🟡" },
  high:      { label: "High Risk",     color: T.red,    bg: T.redLight,    border: T.redBorder,    icon: "🔴" },
  emergency: { label: "EMERGENCY",     color: T.red,    bg: T.redLight,    border: T.redBorder,    icon: "🚨" },
};

const SAMPLE_PROMPTS = [
  "I have fever since yesterday with headache and body pain",
  "I've been having chest tightness and shortness of breath",
  "My back has been hurting for 3 days, especially when I sit",
  "I feel dizzy when I stand up quickly, and my hands feel cold",
  "I have a sore throat, runny nose, and mild cough since 2 days",
];

export default function SymptomChecker({ onBack }) {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  // Parse the AI text response into structured sections
  const parseAIResponse = (text) => {
    if (!text) return null;

    const response = {
      rawText: text,
      possibleCauses: [],
      riskLevel: "low",
      urgency: "",
      recommendedSpecialist: "",
      homePrecautions: [],
      warningSigns: [],
      labTests: [],
      summary: "",
    };

    const lines = text.split("\n").filter(l => l.trim());

    lines.forEach(line => {
      const l = line.toLowerCase().trim();

      // Detect risk level
      if (l.includes("emergency") || l.includes("911") || l.includes("112") || l.includes("immediately")) response.riskLevel = "emergency";
      else if (l.includes("high risk") || l.includes("serious") || l.includes("urgent")) response.riskLevel = "high";
      else if (l.includes("moderate") || l.includes("consult")) response.riskLevel = "moderate";

      // Detect specialist recommendation
      if (l.includes("cardiologist")) response.recommendedSpecialist = "Cardiologist";
      else if (l.includes("neurologist")) response.recommendedSpecialist = "Neurologist";
      else if (l.includes("pulmonologist") || l.includes("chest specialist")) response.recommendedSpecialist = "Pulmonologist";
      else if (l.includes("gastroenterologist")) response.recommendedSpecialist = "Gastroenterologist";
      else if (l.includes("dermatologist")) response.recommendedSpecialist = "Dermatologist";
      else if (l.includes("general physician") || l.includes("doctor")) response.recommendedSpecialist = "General Physician";

      // Build summary from first meaningful sentence
      if (!response.summary && line.trim().length > 30 && !line.startsWith("*") && !line.startsWith("-")) {
        response.summary = line.trim().replace(/\*\*/g, "");
      }
    });

    // Extract bullet points for causes, precautions, warnings, labs
    const bulletRegex = /^[\-\*•]\s+(.+)$/;
    let inSection = "";

    lines.forEach(line => {
      const ltrim = line.trim();
      const llower = ltrim.toLowerCase();

      if (llower.includes("possible cause") || llower.includes("could be") || llower.includes("may indicate")) inSection = "causes";
      else if (llower.includes("warning") || llower.includes("emergency sign") || llower.includes("seek immediate")) inSection = "warning";
      else if (llower.includes("precaution") || llower.includes("home care") || llower.includes("rest") || llower.includes("you should")) inSection = "precautions";
      else if (llower.includes("test") || llower.includes("blood") || llower.includes("cbc") || llower.includes("lab")) inSection = "labs";

      const match = ltrim.match(bulletRegex);
      if (match) {
        const item = match[1].replace(/\*\*/g, "").trim();
        if (inSection === "causes" && response.possibleCauses.length < 5) response.possibleCauses.push(item);
        else if (inSection === "warning" && response.warningSigns.length < 4) response.warningSigns.push(item);
        else if (inSection === "precautions" && response.homePrecautions.length < 5) response.homePrecautions.push(item);
        else if (inSection === "labs" && response.labTests.length < 4) response.labTests.push(item);
      }
    });

    // Fallback — split text into chunks if no bullets found
    if (response.possibleCauses.length === 0) {
      const textContent = text.replace(/\*\*/g, "");
      const sentences = textContent.split(/[.!?]/).filter(s => s.trim().length > 15).slice(0, 8);
      response.rawSentences = sentences;
    }

    return response;
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    // PROBLEM 2: Quick health ping with 5s timeout to detect server sleep
    let isServerAwake = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const pingRes = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (pingRes.ok) isServerAwake = true;
    } catch {
      isServerAwake = false;
    }

    if (!isServerAwake) {
      setWakingUp(true);
      // Wait 10 seconds for Render server to finish waking up
      await new Promise(resolve => setTimeout(resolve, 10000));
      setWakingUp(false);
    }

    try {
      const token = localStorage.getItem("sehat_sathi_token");
      const res = await fetch(`${API_BASE}/analyzer/symptom-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ symptoms }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(parseAIResponse(data.analysis || data.response || data.text || JSON.stringify(data)));
      } else {
        if (res.status === 401 || res.status === 403) {
          throw new Error("401");
        } else if (res.status >= 500) {
          throw new Error("500");
        }

        // Fallback: use AI chat endpoint
        const res2 = await fetch(`${API_BASE}/analyzer/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: `I have the following symptoms: ${symptoms}. Please analyze them and tell me: possible causes, risk level (low/moderate/high/emergency), whether I need immediate consultation, recommended specialist, home precautions, emergency warning signs, and any suggested lab tests. Be structured and clear.`,
            report_context: null,
          }),
        });

        if (res2.ok) {
          const data2 = await res2.json();
          setResult(parseAIResponse(data2.response || data2.text || JSON.stringify(data2)));
        } else {
          if (res2.status === 401 || res2.status === 403) throw new Error("401");
          if (res2.status >= 500) throw new Error("500");
          throw new Error("NET_ERROR");
        }
      }
    } catch (e) {
      // PROBLEM 5: Smart error messages
      if (e.message === "401") {
        setError("🔒 Session expired. Please log in again to use Symptom Checker.");
      } else if (e.message === "500") {
        setError("🔴 Server error occurred. Our team has been notified. Please try again in a moment.");
      } else {
        setError("⚠️ Could not connect to server. It may be starting up. Please wait 15 seconds and try again.");
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
  };

  const risk = result ? RISK_CONFIG[result.riskLevel] || RISK_CONFIG.low : null;

  return (
    <div style={{ animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both", maxWidth: 760, margin: "0 auto" }}>

      {/* ── BACK ──────────────────────────────────────────────────── */}
      {onBack && (
        <button onClick={onBack} style={{ ...DS.btnGhost(), marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      )}

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <div style={DS.card({ marginBottom: 24, background: `linear-gradient(135deg, ${T.primaryLight}, ${T.surfaceAlt})` })}>
        <div style={DS.row(14, { marginBottom: 12 })}>
          <div style={DS.iconCircle(T.primary, 56)}>
            <Bot size={26} style={{ color: T.primary }} />
          </div>
          <div>
            <h2 style={DS.sectionTitle({ fontSize: 20 })}>AI Symptom Checker</h2>
            <p style={DS.sectionSub()}>Describe your symptoms in natural language and get instant health guidance</p>
          </div>
        </div>
        {/* Disclaimer */}
        <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: T.radiusMd, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, color: T.amber, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={11} /> This tool provides health guidance, not a confirmed medical diagnosis. Always consult a qualified doctor for proper treatment.
          </div>
        </div>
      </div>

      {/* ── INPUT AREA ────────────────────────────────────────────── */}
      {!result && (
        <div style={DS.card({ marginBottom: 24 })}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 12 }}>
            Describe your symptoms
          </div>
          <textarea
            ref={textareaRef}
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="E.g. I have fever since yesterday with headache and body pain. I also feel tired and my throat is slightly sore..."
            style={{
              ...DS.input(),
              minHeight: 120,
              resize: "vertical",
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          />
          <div style={DS.between({ flexWrap: "wrap", gap: 10 })}>
            <div style={{ fontSize: 11, color: T.textMuted }}>
              Tip: Be specific about duration, severity, and location of symptoms. Press Ctrl+Enter to analyze.
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!symptoms.trim() || loading}
              style={{
                ...DS.btnPrimary(),
                opacity: !symptoms.trim() || loading ? 0.6 : 1,
                cursor: !symptoms.trim() || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? (wakingUp ? "Waking Server..." : "Analyzing...") : "Analyze Symptoms"}
            </button>
          </div>

          {/* PROBLEM 5 & 6: Smart Error Display + Retry Button */}
          {error && (
            <div style={{ marginTop: 16, background: T.redLight, border: `1px solid ${T.redBorder}`, borderRadius: T.radiusMd, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, color: T.red, marginBottom: 10, lineHeight: 1.5, fontWeight: 500 }}>
                {error}
              </div>
              <button
                onClick={handleAnalyze}
                style={{ ...DS.btnPrimary(), fontSize: 12, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* Sample prompts */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Try these examples:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setSymptoms(p); textareaRef.current?.focus(); }}
                  style={{ ...DS.btnGhost({ padding: "5px 12px", fontSize: 11 }) }}
                >
                  {p.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LOADING STATE — PROBLEM 2 Waking Up Feedback ───────────── */}
      {loading && (
        <div style={{ ...DS.card(), textAlign: "center", padding: "48px 24px" }}>
          <div style={{ ...DS.iconCircle(T.primary, 64), margin: "0 auto 16px" }}>
            <Bot size={30} style={{ color: T.primary, animation: "pulse 2s infinite" }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>
            {wakingUp ? "⏳ Server Starting Up..." : "🔍 Analyzing Your Symptoms"}
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, maxWidth: 420, margin: "0 auto" }}>
            {wakingUp
              ? "Our server was resting. Waking it up, please wait 10-15 seconds..."
              : "Our AI is reviewing your symptoms and preparing health guidance..."}
          </div>
        </div>
      )}

      {/* ── RESULT ────────────────────────────────────────────────── */}
      {result && !loading && (
        <div>
          {/* Risk Level Banner */}
          <div style={{
            background: risk.bg,
            border: `1px solid ${risk.border}`,
            borderRadius: T.radiusLg,
            padding: "18px 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{ fontSize: 36 }}>{risk.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: risk.color }}>{risk.label}</div>
              {result.urgency && <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{result.urgency}</div>}
            </div>
          </div>

          {/* If we have raw text only (unstructured) */}
          {(!result.possibleCauses?.length && !result.homePrecautions?.length) ? (
            <div style={DS.card({ marginBottom: 20 })}>
              <div style={DS.row(8, { marginBottom: 16 })}>
                <Bot size={18} style={{ color: T.primary }} />
                <span style={DS.sectionTitle({ fontSize: 14 })}>AI Health Analysis</span>
              </div>
              <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {result.rawText}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
              {/* Possible Causes */}
              {result.possibleCauses?.length > 0 && (
                <div style={DS.card()}>
                  <div style={DS.row(8, { marginBottom: 14 })}>
                    <div style={DS.iconCircle(T.primary, 32)}><Stethoscope size={14} style={{ color: T.primary }} /></div>
                    <span style={DS.sectionTitle({ fontSize: 14 })}>Possible Causes</span>
                  </div>
                  {result.possibleCauses.map((cause, i) => (
                    <div key={i} style={DS.row(8, { marginBottom: 8 })}>
                      <span style={{ color: T.primary, fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: T.textSecondary }}>{cause}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Specialist */}
              {result.recommendedSpecialist && (
                <div style={{ ...DS.card(), background: T.primaryLight, border: `1px solid ${T.primaryBorder}` }}>
                  <div style={DS.row(10)}>
                    <div style={DS.iconCircle(T.primary, 40)}><Stethoscope size={18} style={{ color: T.primary }} /></div>
                    <div>
                      <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, marginBottom: 2 }}>RECOMMENDED SPECIALIST</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{result.recommendedSpecialist}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Home Precautions */}
              {result.homePrecautions?.length > 0 && (
                <div style={DS.card()}>
                  <div style={DS.row(8, { marginBottom: 14 })}>
                    <div style={DS.iconCircle(T.green, 32)}><ShieldCheck size={14} style={{ color: T.green }} /></div>
                    <span style={DS.sectionTitle({ fontSize: 14 })}>Home Precautions</span>
                  </div>
                  {result.homePrecautions.map((p, i) => (
                    <div key={i} style={DS.row(8, { marginBottom: 8 })}>
                      <span style={{ color: T.green }}>✓</span>
                      <span style={{ fontSize: 13, color: T.textSecondary }}>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* PROBLEM 4: Warning Signs UI Card */}
              {result.warningSigns?.length > 0 && (
                <div style={DS.card()}>
                  <div style={DS.row(8, { marginBottom: 14 })}>
                    <div style={DS.iconCircle(T.red, 32)}>
                      <AlertTriangle size={14} style={{ color: T.red }} />
                    </div>
                    <span style={DS.sectionTitle({ fontSize: 14 })}>
                      Warning Signs — Seek Immediate Help
                    </span>
                  </div>
                  {result.warningSigns.map((sign, i) => (
                    <div key={i} style={DS.row(8, { marginBottom: 8 })}>
                      <span style={{ color: T.red }}>⚠️</span>
                      <span style={{ fontSize: 13, color: T.textSecondary }}>
                        {sign}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Lab Tests */}
              {result.labTests?.length > 0 && (
                <div style={DS.card()}>
                  <div style={DS.row(8, { marginBottom: 14 })}>
                    <div style={DS.iconCircle(T.purple, 32)}><FlaskConical size={14} style={{ color: T.purple }} /></div>
                    <span style={DS.sectionTitle({ fontSize: 14 })}>Suggested Lab Tests</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.labTests.map((test, i) => (
                      <span key={i} style={DS.badge("purple")}>{test}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medical Disclaimer */}
          <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: T.radiusMd, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: T.amber, lineHeight: 1.6 }}>
              <strong>⚠️ Medical Disclaimer:</strong> This AI analysis is for informational guidance only and does not constitute a medical diagnosis. The results should not replace professional medical advice, examination, or treatment. Always consult a qualified healthcare professional before making any health decisions.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={DS.row(10)}>
            <button onClick={() => { setResult(null); setSymptoms(""); setError(""); }} style={DS.btnGhost()}>
              <RefreshCw size={14} /> Check Again
            </button>
            <button style={DS.btnPrimary()}>
              <Stethoscope size={14} /> Book a Doctor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
