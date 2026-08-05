/**
 * CookieConsent.jsx — Redesigned Cookie & Privacy Consent Banner
 * Sehat-Sathi | Enterprise SaaS Design
 *
 * Features:
 * - Compact, modern, glassmorphism SaaS interface (Vercel, Stripe, Linear inspired)
 * - Concise 5-bullet summary of privacy & data handling practices
 * - 3 clear actions: "Accept All", "Essential Only", "Customize Preferences"
 * - Granular cookie preference toggles (Essential, Functional, Analytics)
 * - Direct inline links opening full, un-modified legal documents in a modal overlay
 * - Reopenable via footer link or global trigger `window.__openCookiePreferences()`
 * - Dual-language support (English & Hindi)
 * - Storage in localStorage with full backwards compatibility for TermsGate
 */

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Cookie, Settings, Check, X, ExternalLink, ChevronRight, Lock, EyeOff, Sliders, FileText } from "lucide-react";
import FULL_DOCUMENT_REGISTRY from "../legal/legalDocuments";

export const CONSENT_STORAGE_KEY = "sehat_cookie_consent_v1";
export const TERMS_STORAGE_KEY = "sehat_terms_accepted_v1.0";

export function getStoredConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasAcceptedCookieConsent() {
  const consent = getStoredConsent();
  return consent && consent.accepted === true;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [viewMode, setViewMode] = useState("summary"); // "summary" | "customize"
  const [lang, setLang] = useState("en");

  // Custom preference toggles
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    functional: true,
    analytics: true,
  });

  // Modal state for reading full legal document inline
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);

  // Check if consent has already been given on mount
  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setPreferences({
        essential: true,
        functional: stored.functional !== false,
        analytics: stored.analytics !== false,
      });
    } else {
      // First visit — show popup after brief entrance delay
      const timer = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimateIn(true));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expose global open handler for footer & settings
  const openPreferences = useCallback((mode = "summary") => {
    setViewMode(mode);
    setVisible(true);
    requestAnimationFrame(() => setAnimateIn(true));
  }, []);

  useEffect(() => {
    window.__openCookiePreferences = openPreferences;
    window.__hasAcceptedCookieConsent = hasAcceptedCookieConsent;
    return () => {
      delete window.__openCookiePreferences;
      delete window.__hasAcceptedCookieConsent;
    };
  }, [openPreferences]);

  // Save consent to localStorage
  const saveConsent = (level, customPrefs = preferences) => {
    const record = {
      version: "1.0",
      accepted: true,
      level,
      functional: level === "essential" ? false : customPrefs.functional,
      analytics: level === "essential" ? false : customPrefs.analytics,
      timestamp: new Date().toISOString(),
      lang,
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
      // Maintain backwards compatibility with TermsGate
      localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify({
        version: "1.0",
        accepted: true,
        timestamp: record.timestamp,
        lang,
      }));
    } catch {}

    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      setViewMode("summary");
    }, 250);
  };

  const handleAcceptAll = () => saveConsent("all", { essential: true, functional: true, analytics: true });
  const handleEssentialOnly = () => saveConsent("essential", { essential: true, functional: false, analytics: false });
  const handleSaveCustom = () => saveConsent("custom", preferences);

  // Helper to find document in legal registry
  const openLegalDocModal = (docId) => {
    const found = FULL_DOCUMENT_REGISTRY.find(d => d.id === docId);
    if (found) {
      setActiveLegalDoc(found);
    } else {
      window.open(`/legal?doc=${docId}`, "_blank");
    }
  };

  if (!visible && !activeLegalDoc) return null;

  return (
    <>
      {/* ── MAIN COOKIE CONSENT POPUP ───────────────────────────────── */}
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            left: "auto",
            zIndex: 9990,
            maxWidth: 520,
            width: "calc(100vw - 32px)",
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              background: "var(--surface, rgba(15, 23, 42, 0.92))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 20,
              border: "1px solid var(--border, rgba(255, 255, 255, 0.12))",
              boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              color: "var(--text, #f8fafc)",
              overflow: "hidden",
              fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
            }}
          >
            {/* Top Accent Line */}
            <div style={{ height: 3, background: "linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)" }} />

            {/* Header Bar */}
            <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "rgba(37, 99, 235, 0.15)",
                    border: "1px solid rgba(37, 99, 235, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#3b82f6",
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--primary, #3b82f6)", textTransform: "uppercase" }}>
                    Sehat-Sathi Privacy
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", color: "var(--text, #f8fafc)" }}>
                    {viewMode === "summary"
                      ? (lang === "hi" ? "कुकी और गोपनीयता प्राथमिकताएं" : "Cookie & Privacy Preferences")
                      : (lang === "hi" ? "प्राथमिकताएं कस्टमाइज़ करें" : "Customize Preferences")
                    }
                  </h3>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Language Toggle */}
                <div style={{ display: "flex", borderRadius: 8, border: "1px solid var(--border, rgba(255,255,255,0.15))", overflow: "hidden" }}>
                  {[{ code: "en", label: "EN" }, { code: "hi", label: "HI" }].map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      style={{
                        border: "none",
                        padding: "4px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: lang === l.code ? "rgba(37,99,235,0.3)" : "transparent",
                        color: lang === l.code ? "#60a5fa" : "var(--text-muted, #94a3b8)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Dismiss button (if re-opening) */}
                {getStoredConsent() && (
                  <button
                    onClick={() => { setAnimateIn(false); setTimeout(() => setVisible(false), 200); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted, #94a3b8)",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 6,
                      display: "flex",
                    }}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ── VIEW 1: SUMMARY (4-6 Concise Bullets) ───────────────── */}
            {viewMode === "summary" ? (
              <div style={{ padding: "0 22px 18px" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary, #cbd5e1)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                  {lang === "hi"
                    ? "सुरक्षित और व्यक्तिगत अनुभव प्रदान करने के लिए हम कुकीज़ का उपयोग करते हैं:"
                    : "We use cookies to protect your session, remember preferences, and enhance your healthcare experience:"
                  }
                </p>

                {/* 5 Bullet Points */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    {
                      icon: "🍪",
                      en: "Essential cookies maintain secure login & healthcare portal functions.",
                      hi: "आवश्यक कुकीज़ आपके सुरक्षित लॉगिन और पोर्टल कार्यों को बनाए रखती हैं।",
                    },
                    {
                      icon: "🔒",
                      en: "Your medical data is AES-256 encrypted and handled confidentially.",
                      hi: "आपका मेडिकल डेटा AES-256 एन्क्रिप्टेड और गोपनीय रखा जाता है।",
                    },
                    {
                      icon: "🛡️",
                      en: "We NEVER sell or monetize your personal health information.",
                      hi: "हम आपकी व्यक्तिगत स्वास्थ्य जानकारी कभी नहीं बेचते या व्यावसायिक लाभ नहीं उठाते।",
                    },
                    {
                      icon: "📋",
                      en: "By continuing, you agree to our Terms & Conditions and Privacy Policy.",
                      hi: "जारी रखकर, आप हमारे नियमों और गोपनीयता नीति से सहमत होते हैं।",
                    },
                    {
                      icon: "⚙️",
                      en: "You can update or manage your cookie preferences anytime.",
                      hi: "आप किसी भी समय अपनी कुकी प्राथमिकताओं को प्रबंधित कर सकते हैं।",
                    },
                  ].map((bullet, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: "var(--text, #e2e8f0)",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        padding: "8px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{bullet.icon}</span>
                      <span>{lang === "hi" ? bullet.hi : bullet.en}</span>
                    </li>
                  ))}
                </ul>

                {/* 3 Buttons Action Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <button
                    onClick={handleAcceptAll}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                      transition: "transform 0.15s ease, boxShadow 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <Check size={15} />
                    {lang === "hi" ? "सभी स्वीकार करें" : "Accept All"}
                  </button>

                  <button
                    onClick={handleEssentialOnly}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border, rgba(255,255,255,0.15))",
                      background: "rgba(255, 255, 255, 0.06)",
                      color: "var(--text, #f1f5f9)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"}
                  >
                    <Lock size={14} />
                    {lang === "hi" ? "केवल आवश्यक" : "Essential Only"}
                  </button>
                </div>

                {/* 3rd Button: Customize */}
                <button
                  onClick={() => setViewMode("customize")}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: "transparent",
                    color: "var(--primary, #60a5fa)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >
                  <Sliders size={14} />
                  {lang === "hi" ? "प्राथमिकताएं कस्टमाइज़ करें →" : "Customize Preferences →"}
                </button>
              </div>
            ) : (
              /* ── VIEW 2: CUSTOMIZE PREFERENCES TOGGLES ───────────────── */
              <div style={{ padding: "0 22px 18px" }}>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary, #cbd5e1)", margin: "0 0 14px 0" }}>
                  {lang === "hi"
                    ? "चुनें कि कौन से गैर-आवश्यक कुकीज़ की अनुमति देना चाहते हैं:"
                    : "Select which non-essential cookies you allow us to use:"
                  }
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  {/* Essential Cookies (Mandatory) */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text, #f8fafc)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>🔒</span> {lang === "hi" ? "आवश्यक कुकीज़" : "Essential Cookies"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted, #94a3b8)", marginTop: 2 }}>
                        {lang === "hi" ? "सुरक्षा, लॉगिन और सत्र स्थिरता के लिए आवश्यक" : "Required for security, login & platform stability"}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                      {lang === "hi" ? "हमेशा सक्रिय" : "Always Active"}
                    </span>
                  </div>

                  {/* Functional Cookies (Toggleable) */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: preferences.functional ? "rgba(37, 99, 235, 0.06)" : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${preferences.functional ? "rgba(37, 99, 235, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text, #f8fafc)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>🎨</span> {lang === "hi" ? "कार्यात्मक कुकीज़" : "Functional Cookies"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted, #94a3b8)", marginTop: 2 }}>
                        {lang === "hi" ? "भाषा, थीम और व्यक्तिगत सेटिंग्स याद रखता है" : "Remembers language, theme & portal display settings"}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => {}}
                      style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </div>

                  {/* Analytics Cookies (Toggleable) */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: preferences.analytics ? "rgba(37, 99, 235, 0.06)" : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${preferences.analytics ? "rgba(37, 99, 235, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text, #f8fafc)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>📈</span> {lang === "hi" ? "एनालिटिक्स कुकीज़" : "Analytics & Performance"}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted, #94a3b8)", marginTop: 2 }}>
                        {lang === "hi" ? "गुमनाम गति माप और सिस्टम सुधार हेतु" : "Anonymized speed diagnostics to improve service performance"}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => {}}
                      style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    onClick={() => setViewMode("summary")}
                    style={{
                      padding: "10px",
                      borderRadius: 12,
                      border: "1px solid var(--border, rgba(255,255,255,0.15))",
                      background: "transparent",
                      color: "var(--text-muted, #94a3b8)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {lang === "hi" ? "← वापस जाएं" : "← Back"}
                  </button>

                  <button
                    onClick={handleSaveCustom}
                    style={{
                      padding: "10px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                    }}
                  >
                    {lang === "hi" ? "सहेजे" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* ── BOTTOM INLINE LEGAL LINKS ────────────────────────────── */}
            <div
              style={{
                padding: "12px 22px",
                background: "rgba(0, 0, 0, 0.25)",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                fontSize: 11.5,
                flexWrap: "wrap",
              }}
            >
              {[
                { id: "terms", label: "Terms & Conditions", labelHi: "नियम एवं शर्तें" },
                { id: "privacy", label: "Privacy Policy", labelHi: "गोपनीयता नीति" },
                { id: "cookie", label: "Cookie Policy", labelHi: "कुकी नीति" },
              ].map((doc, idx) => (
                <span key={doc.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {idx > 0 && <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>}
                  <button
                    onClick={() => openLegalDocModal(doc.id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--text-muted, #94a3b8)",
                      fontSize: 11.5,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "color 0.15s ease",
                      textDecoration: "underline",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#60a5fa"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted, #94a3b8)"}
                  >
                    {lang === "hi" ? doc.labelHi : doc.label}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LEGAL DOCUMENT MODAL OVERLAY ─────────────────────────────── */}
      {activeLegalDoc && (
        <LegalDocumentModal
          doc={activeLegalDoc}
          lang={lang}
          onClose={() => setActiveLegalDoc(null)}
        />
      )}
    </>
  );
}

// ── SUB-COMPONENT: INLINE LEGAL DOCUMENT VIEWER MODAL ────────────────
function LegalDocumentModal({ doc, lang, onClose }) {
  const docData = doc.data;
  const sections = Array.isArray(docData?.sections)
    ? docData.sections
    : Array.isArray(docData?.content)
    ? docData.content
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--surface, #0f172a)",
          color: "var(--text, #f8fafc)",
          borderRadius: 20,
          border: "1px solid var(--border, rgba(255,255,255,0.15))",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          maxWidth: 680,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{doc.icon || "📋"}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Legal Document
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#fff" }}>
                {lang === "hi" ? (doc.labelHi || doc.label) : doc.label}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              padding: 6,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", lineHeight: 1.7, fontSize: 13.5, color: "var(--text-secondary, #cbd5e1)" }}>
          {docData?.subtitle && (
            <p style={{ fontWeight: 600, color: "#94a3b8", marginTop: 0, marginBottom: 20, fontStyle: "italic" }}>
              {docData.subtitle}
            </p>
          )}

          {sections.length > 0 ? (
            sections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: 22 }}>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text, #f8fafc)", marginBottom: 8, marginTop: 0 }}>
                  {sec.heading || sec.title}
                </h4>
                <p style={{ margin: 0, whiteSpace: "pre-line", color: "var(--text-secondary, #cbd5e1)" }}>
                  {sec.body || sec.content || sec.text}
                </p>
              </div>
            ))
          ) : (
            <div style={{ whiteSpace: "pre-line" }}>
              {typeof docData === "string" ? docData : JSON.stringify(docData, null, 2)}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border, rgba(255,255,255,0.1))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <a
            href={`/legal?doc=${doc.id}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
          >
            Open in Legal Hub <ExternalLink size={12} />
          </a>

          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              background: "#2563eb",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
}
