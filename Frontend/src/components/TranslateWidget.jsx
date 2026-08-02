/**
 * TranslateWidget.jsx — Google Translate Floating Widget
 * Sehat-Sathi | v1.0 | 01 August 2026
 *
 * Provides instant page translation to 100+ languages via
 * Google Translate Element (free embed, no API key required).
 *
 * Features:
 * - Instant full-page translation (from top to bottom)
 * - Remembers selected language in localStorage + cookies
 * - Search filter for quick language finding
 * - Floating action button (bottom-right corner)
 * - Clean CSS overrides to suppress native Google toolbar
 */
import { useState, useEffect, useRef } from "react";
import { Globe, X, ChevronDown, Search } from "lucide-react";

// Google Translate initialization
function initGoogleTranslate() {
  if (typeof window === "undefined") return;

  // Avoid double-init
  if (window.__googleTranslateInited) return;
  window.__googleTranslateInited = true;

  // Ensure single container element for Google Translate
  if (!document.getElementById("google_translate_element")) {
    const el = document.createElement("div");
    el.id = "google_translate_element";
    el.style.position = "fixed";
    el.style.bottom = "-200px";
    el.style.right = "-200px";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.overflow = "hidden";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
  }

  // Define the callback
  window.googleTranslateElementInit = function () {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element"
    );
  };

  // Inject Google Translate script
  if (!document.getElementById("google-translate-script")) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

// Restore original language (English)
function restoreOriginalLanguage() {
  try {
    const iframe = document.querySelector(".goog-te-banner-frame");
    if (iframe) {
      const innerDoc = iframe.contentWindow.document;
      const closeBtn = innerDoc.querySelector(".goog-close-link");
      if (closeBtn) closeBtn.click();
    }
    const domain = window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    
    const select = document.querySelector("select.goog-te-combo");
    if (select) {
      select.value = "en";
      select.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
}

// Shortlist of popular Indian & International languages
const LANGUAGES_LIST = [
  { code: "hi",    flag: "🇮🇳", label: "हिन्दी",    en: "Hindi" },
  { code: "gu",    flag: "🇮🇳", label: "ગુજરાતી",  en: "Gujarati" },
  { code: "mr",    flag: "🇮🇳", label: "मराठी",    en: "Marathi" },
  { code: "pa",    flag: "🇮🇳", label: "ਪੰਜਾਬੀ",  en: "Punjabi" },
  { code: "bn",    flag: "🇧🇩", label: "বাংলা",    en: "Bengali" },
  { code: "ta",    flag: "🇮🇳", label: "தமிழ்",   en: "Tamil" },
  { code: "te",    flag: "🇮🇳", label: "తెలుగు",  en: "Telugu" },
  { code: "kn",    flag: "🇮🇳", label: "ಕನ್ನಡ",   en: "Kannada" },
  { code: "ml",    flag: "🇮🇳", label: "മലയാളം", en: "Malayalam" },
  { code: "ur",    flag: "🇵🇰", label: "اردو",     en: "Urdu" },
  { code: "ar",    flag: "🇸🇦", label: "العربية",  en: "Arabic" },
  { code: "en",    flag: "🇬🇧", label: "English",  en: "English (Original)" },
  { code: "fr",    flag: "🇫🇷", label: "Français", en: "French" },
  { code: "de",    flag: "🇩🇪", label: "Deutsch",  en: "German" },
  { code: "es",    flag: "🇪🇸", label: "Español",  en: "Spanish" },
  { code: "ru",    flag: "🇷🇺", label: "Русский",  en: "Russian" },
  { code: "zh-CN", flag: "🇨🇳", label: "中文",     en: "Chinese" },
  { code: "ja",    flag: "🇯🇵", label: "日本語",   en: "Japanese" },
  { code: "ko",    flag: "🇰🇷", label: "한국어",   en: "Korean" },
  { code: "tr",    flag: "🇹🇷", label: "Türkçe",   en: "Turkish" },
];

export default function TranslateWidget() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const widgetRef = useRef(null);

  // Init Google Translate & restore saved preference on mount
  useEffect(() => {
    initGoogleTranslate();

    const savedCode = localStorage.getItem("sehat_selected_lang");
    if (savedCode && savedCode !== "en") {
      const found = LANGUAGES_LIST.find(l => l.code === savedCode) || { code: savedCode, flag: "🌐", label: savedCode, en: savedCode };
      setSelectedLang(found);
      setIsTranslated(true);

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const select = document.querySelector("select.goog-te-combo");
        if (select) {
          select.value = savedCode;
          select.dispatchEvent(new Event("change"));
          clearInterval(interval);
        } else if (attempts > 25) {
          clearInterval(interval);
        }
      }, 200);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function selectLanguage(lang) {
    const code = typeof lang === "string" ? lang : lang.code;

    if (code === "en") {
      restoreOriginalLanguage();
      setIsTranslated(false);
      setSelectedLang(null);
      setOpen(false);
      localStorage.removeItem("sehat_selected_lang");
      return;
    }

    // Set Google Translate cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; path=/;`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${domain};`;
    localStorage.setItem("sehat_selected_lang", code);

    const applyTranslate = () => {
      const select = document.querySelector("select.goog-te-combo");
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };

    if (!applyTranslate()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (applyTranslate() || attempts > 15) {
          clearInterval(interval);
        }
      }, 200);
    }

    const langObj = LANGUAGES_LIST.find(l => l.code === code) || { code, flag: "🌐", label: code, en: code };
    setSelectedLang(langObj);
    setIsTranslated(true);
    setOpen(false);
  }

  const filteredLangs = LANGUAGES_LIST.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.en.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={widgetRef}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {/* Expanded Panel */}
      {open && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl, 18px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1)",
          padding: "0 0 8px",
          width: 260,
          animation: "fadeScale 0.2s cubic-bezier(0.16,1,0.3,1) both",
          overflow: "hidden",
        }}>
          {/* Panel Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 14px 10px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Globe size={15} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                Translate Website
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ padding: "8px 10px 4px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--surface-alt)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "6px 10px",
            }}>
              <Search size={12} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search language…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: "none", border: "none", outline: "none",
                  color: "var(--text)", fontSize: 12, width: "100%",
                }}
              />
            </div>
          </div>

          {/* Language list */}
          <div style={{ maxHeight: 260, overflowY: "auto", padding: "4px 6px" }}>
            {filteredLangs.map(lang => {
              const isActive = selectedLang?.code === lang.code || (!isTranslated && lang.code === "en");
              return (
                <button
                  key={lang.code}
                  onClick={() => selectLanguage(lang)}
                  style={{
                    width: "100%", border: "none",
                    background: isActive ? "var(--primary-light)" : "transparent",
                    cursor: "pointer", textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface-alt)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{lang.flag}</span>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--primary)" : "var(--text)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {lang.label}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                      {lang.en}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Powered by note */}
          <div style={{
            padding: "8px 12px 2px",
            borderTop: "1px solid var(--border)",
            fontSize: 10, color: "var(--text-muted)", textAlign: "center",
          }}>
            Instant full-page translation
          </div>
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Translate website language"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: isTranslated
            ? "linear-gradient(135deg, #059669, #047857)"
            : "linear-gradient(135deg, #2563EB, #1D4ED8)",
          border: "none",
          borderRadius: 50,
          padding: "12px 20px",
          cursor: "pointer",
          color: "#fff",
          fontSize: 13, fontWeight: 700,
          boxShadow: isTranslated
            ? "0 4px 22px rgba(5,150,105,0.45)"
            : "0 4px 22px rgba(37,99,235,0.45)",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <Globe size={16} />
        {isTranslated && selectedLang
          ? `${selectedLang.flag} ${selectedLang.label}`
          : "Translate Language"
        }
        <ChevronDown
          size={14}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        />
      </button>

      {/* Restore button when translated */}
      {isTranslated && (
        <button
          onClick={() => selectLanguage({ code: "en" })}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            padding: "6px 14px",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: 11, fontWeight: 600,
            boxShadow: "var(--shadow-md)",
            transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <X size={11} /> Restore Original
        </button>
      )}
    </div>
  );
}
