/**
 * LanguageSelector — Globe icon dropdown to switch language.
 * Matches the visual style of the existing ThemeToggle.
 * Props:
 *   compact (bool) — if true, show only flag (for mobile / sidebar footer)
 */
import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ compact = false }) {
  const { lang, setLang, LANGUAGES } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        className="theme-toggle"
        onClick={() => setOpen(o => !o)}
        title={`Language: ${current.label}`}
        aria-label="Select language"
        style={{ display: "flex", alignItems: "center", gap: 5, minWidth: compact ? undefined : 80, padding: "0 10px" }}
      >
        <Globe size={15} />
        {!compact && (
          <span style={{ fontSize: 12, fontWeight: 600, maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {current.flag} {current.nativeLabel}
          </span>
        )}
        {compact && <span style={{ fontSize: 14 }}>{current.flag}</span>}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 100,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.18))",
              padding: "6px",
              minWidth: 190,
              animation: "fadeScale 0.15s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            {/* Header */}
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: "var(--text-muted)", textTransform: "uppercase",
              padding: "6px 12px 8px", borderBottom: "1px solid var(--border)",
              marginBottom: 4, display: "flex", alignItems: "center", gap: 6,
            }}>
              <Globe size={11} /> Select Language
            </div>

            {/* Language options */}
            {LANGUAGES.map(option => {
              const isActive = option.code === lang;
              return (
                <button
                  key={option.code}
                  onClick={() => { setLang(option.code); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: isActive ? "var(--primary-light)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = "var(--surface-alt)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Flag */}
                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{option.flag}</span>

                  {/* Labels */}
                  <div style={{ overflow: "hidden" }}>
                    <div style={{
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--primary)" : "var(--text)",
                      whiteSpace: "nowrap",
                    }}>
                      {option.nativeLabel}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                      {option.label}
                    </div>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div style={{
                      marginLeft: "auto", width: 18, height: 18,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
