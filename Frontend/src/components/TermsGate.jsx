/**
 * TermsGate.jsx — Terms & Conditions Acceptance Gate
 * Sehat-Sathi | v1.0 | 01 August 2026
 *
 * Renders a full-screen modal BEFORE any login/signup proceeds.
 * - Checks localStorage for prior acceptance (versioned)
 * - Requires ALL checkboxes to be ticked
 * - Stores acceptance with timestamp + version
 * - Supports English and Hindi
 * - Works for ALL roles: Patient, Doctor, Hospital, etc.
 */
import { useState, useEffect, useCallback } from "react";
import { X, Shield, CheckCircle2, AlertCircle, ExternalLink, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TERMS_VERSION = "1.0";
const STORAGE_KEY = `sehat_terms_accepted_v${TERMS_VERSION}`;

const CONSENT_ITEMS = [
  {
    id: "platform_role",
    en: "I understand that Sehat-Sathi is a Healthcare Technology Platform, NOT a hospital, clinic, or medical provider. It connects patients with licensed healthcare professionals.",
    hi: "मैं समझता/समझती हूं कि सेहत-साथी एक हेल्थकेयर टेक्नोलॉजी प्लेटफ़ॉर्म है, अस्पताल, क्लिनिक या चिकित्सा प्रदाता नहीं। यह मरीजों को लाइसेंस प्राप्त स्वास्थ्य पेशेवरों से जोड़ता है।",
    icon: "🏥",
  },
  {
    id: "no_medical_advice",
    en: "I understand that AI-generated health insights are informational ONLY and do NOT constitute medical advice, diagnosis, or treatment. I will consult a licensed doctor for medical decisions.",
    hi: "मैं समझता/समझती हूं कि AI-उत्पन्न स्वास्थ्य अंतर्दृष्टि केवल सूचनात्मक हैं और चिकित्सा सलाह, निदान या उपचार का गठन नहीं करती। मैं चिकित्सा निर्णयों के लिए एक लाइसेंस प्राप्त डॉक्टर से परामर्श करूंगा/करूंगी।",
    icon: "🤖",
  },
  {
    id: "emergency",
    en: "I understand that in any medical emergency, I must call 112 IMMEDIATELY. Sehat-Sathi does NOT guarantee ambulance availability, ICU beds, or emergency response times.",
    hi: "मैं समझता/समझती हूं कि किसी भी चिकित्सा आपातकाल में, मुझे तुरंत 112 पर कॉल करना होगा। सेहत-साथी एम्बुलेंस उपलब्धता, ICU बेड या आपातकालीन प्रतिक्रिया समय की गारंटी नहीं देता।",
    icon: "🚨",
  },
  {
    id: "data_privacy",
    en: "I consent to Sehat-Sathi collecting and processing my health data to provide services, in compliance with the Digital Personal Data Protection Act, 2023 (India). I can withdraw consent anytime.",
    hi: "मैं सेहत-साथी को डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के अनुपालन में सेवाएं प्रदान करने के लिए मेरे स्वास्थ्य डेटा को एकत्र और संसाधित करने की सहमति देता/देती हूं। मैं किसी भी समय सहमति वापस ले सकता/सकती हूं।",
    icon: "🔒",
  },
  {
    id: "accurate_info",
    en: "I agree to provide accurate, truthful information. I understand that uploading fake medical reports or false credentials is a violation of Platform terms and may constitute fraud under Indian law.",
    hi: "मैं सटीक, सत्य जानकारी प्रदान करने के लिए सहमत हूं। मैं समझता/समझती हूं कि नकली मेडिकल रिपोर्ट या झूठे क्रेडेंशियल अपलोड करना प्लेटफ़ॉर्म नियमों का उल्लंघन है और भारतीय कानून के तहत धोखाधड़ी हो सकता है।",
    icon: "✅",
  },
];

export default function TermsGate({ onAccept }) {
  const [lang, setLang] = useState("en");
  const [checked, setChecked] = useState({});
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const navigate = useNavigate();

  // Check if already accepted
  const isAlreadyAccepted = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      return parsed.version === TERMS_VERSION && parsed.accepted === true;
    } catch {
      return false;
    }
  }, []);

  // Show gate
  const show = useCallback(() => {
    if (isAlreadyAccepted()) {
      onAccept?.();
      return;
    }
    setVisible(true);
    requestAnimationFrame(() => setAnimateIn(true));
  }, [isAlreadyAccepted, onAccept]);

  // Expose show method globally & auto-trigger on mount
  useEffect(() => {
    show();
    window.__showTermsGate = show;
    return () => { delete window.__showTermsGate; };
  }, [show]);

  const allChecked = CONSENT_ITEMS.every(item => checked[item.id]);

  function toggleCheck(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAccept() {
    if (!allChecked) return;
    const record = {
      version: TERMS_VERSION,
      accepted: true,
      timestamp: new Date().toISOString(),
      lang,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      onAccept?.();
    }, 250);
  }

  function handleDecline() {
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 250);
  }

  function handleViewLegal() {
    navigate("/legal");
    handleDecline();
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        opacity: animateIn ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) handleDecline(); }}
    >
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-xl, 20px)",
        border: "1px solid var(--border)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxWidth: 600,
        width: "100%",
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: animateIn ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>
                Sehat-Sathi
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                {lang === "hi" ? "नियम एवं शर्तें" : "Terms & Conditions"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Language toggle */}
            <div style={{ display: "flex", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", overflow: "hidden" }}>
              {[{ code: "en", label: "EN" }, { code: "hi", label: "HI" }].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  style={{
                    border: "none", padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                    background: lang === l.code ? "rgba(255,255,255,0.25)" : "transparent",
                    color: "#fff", transition: "all 0.15s",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleDecline}
              style={{
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: 8, padding: "6px", cursor: "pointer",
                color: "#fff", display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* Notice */}
          <div style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              {lang === "hi"
                ? "सेहत-साथी का उपयोग करने के लिए, कृपया नीचे दी गई सभी शर्तों को पढ़ें और स्वीकार करें। सभी चेकबॉक्स अनिवार्य हैं।"
                : "To use Sehat-Sathi, please read and accept all terms below. All checkboxes are mandatory. You must be 18+ years of age."
              }
            </p>
          </div>

          {/* Consent checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {CONSENT_ITEMS.map(item => (
              <label
                key={item.id}
                style={{
                  display: "flex", gap: 14, cursor: "pointer",
                  background: checked[item.id] ? "rgba(37,99,235,0.06)" : "var(--surface-alt)",
                  border: `1px solid ${checked[item.id] ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  transition: "all 0.15s",
                  alignItems: "flex-start",
                }}
              >
                {/* Custom checkbox */}
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => toggleCheck(item.id)}
                    style={{ display: "none" }}
                  />
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    border: `2px solid ${checked[item.id] ? "var(--primary)" : "var(--border)"}`,
                    background: checked[item.id] ? "var(--primary)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}>
                    {checked[item.id] && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                  </div>
                  <p style={{
                    fontSize: 12.5, lineHeight: 1.65,
                    color: checked[item.id] ? "var(--text)" : "var(--text-secondary)",
                    margin: 0, fontWeight: checked[item.id] ? 500 : 400,
                    transition: "color 0.15s",
                  }}>
                    {lang === "hi" ? item.hi : item.en}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* View full legal link */}
          <button
            onClick={handleViewLegal}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "var(--primary)", fontSize: 12.5, fontWeight: 600,
              padding: 0, marginBottom: 8,
            }}
          >
            <ExternalLink size={13} />
            {lang === "hi" ? "सभी 50 कानूनी दस्तावेज देखें →" : "View all 50 legal documents →"}
          </button>

          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            {lang === "hi"
              ? "संस्करण 1.0 | प्रभावी: 01 अगस्त 2026 | क्षेत्राधिकार: भारत गणराज्य | संपर्क: legal@sehatsathi.in"
              : "Version 1.0 | Effective: 01 August 2026 | Jurisdiction: Republic of India | Contact: legal@sehatsathi.in"
            }
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex", gap: 12, flexShrink: 0,
          flexDirection: "column",
        }}>
          {/* Progress indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: "var(--surface-alt)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: "var(--primary)",
                width: `${(Object.values(checked).filter(Boolean).length / CONSENT_ITEMS.length) * 100}%`,
                transition: "width 0.3s ease",
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", flexShrink: 0 }}>
              {Object.values(checked).filter(Boolean).length}/{CONSENT_ITEMS.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleDecline}
              style={{
                flex: "0 0 auto", padding: "12px 20px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", background: "var(--surface-alt)",
                color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {lang === "hi" ? "रद्द करें" : "Cancel"}
            </button>

            <button
              onClick={handleAccept}
              disabled={!allChecked}
              style={{
                flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                border: "none",
                background: allChecked
                  ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                  : "var(--surface-alt)",
                color: allChecked ? "#fff" : "var(--text-muted)",
                fontSize: 14, fontWeight: 700, cursor: allChecked ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: allChecked ? "0 4px 16px rgba(37,99,235,0.3)" : "none",
              }}
            >
              {allChecked
                ? <><CheckCircle2 size={16} /> {lang === "hi" ? "मैं सहमत हूं — आगे बढ़ें" : "I Agree — Continue"}</>
                : (lang === "hi" ? "सभी शर्तें स्वीकार करें" : "Accept all terms to continue")
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: check if terms have been accepted (for external use)
export function hasAcceptedTerms() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.version === TERMS_VERSION && parsed.accepted === true;
  } catch {
    return false;
  }
}

// Helper: show gate if needed, then run callback
export function requireTermsAcceptance(callback) {
  if (hasAcceptedTerms()) {
    callback?.();
  } else if (window.__showTermsGate) {
    // Store callback in window temporarily
    window.__termsGateCallback = callback;
    window.__showTermsGate(() => {
      window.__termsGateCallback?.();
      delete window.__termsGateCallback;
    });
  }
}
