/**
 * LanguageContext — Multi-language support for Sehat-Sathi
 *
 * Provides:
 *   - `lang`      : current language code (e.g. "hi", "gu")
 *   - `setLang(l)`: switch language + persist to localStorage
 *   - `t(key)`    : translate a key, falls back to English
 *   - `LANGUAGES` : list of supported languages for the selector
 */
import { createContext, useContext, useState, useCallback } from "react";
import translations from "../i18n/translations";

export const LANGUAGES = [
  { code: "en", label: "English",    nativeLabel: "English",    flag: "🇬🇧" },
  { code: "hi", label: "Hindi",      nativeLabel: "हिन्दी",      flag: "🇮🇳" },
  { code: "gu", label: "Gujarati",   nativeLabel: "ગુજરાતી",    flag: "🇮🇳" },
  { code: "mr", label: "Marathi",    nativeLabel: "मराठी",      flag: "🇮🇳" },
  { code: "pa", label: "Punjabi",    nativeLabel: "ਪੰਜਾਬੀ",    flag: "🇮🇳" },
  { code: "bn", label: "Bengali",    nativeLabel: "বাংলা",      flag: "🇧🇩" },
  { code: "ta", label: "Tamil",      nativeLabel: "தமிழ்",     flag: "🇮🇳" },
  { code: "te", label: "Telugu",     nativeLabel: "తెలుగు",    flag: "🇮🇳" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem("sehat_lang");
      return translations[stored] ? stored : "en";
    } catch {
      return "en";
    }
  });

  const setLang = useCallback((code) => {
    if (!translations[code]) return;
    setLangState(code);
    try { localStorage.setItem("sehat_lang", code); } catch {}
  }, []);

  /**
   * t(key) — returns translated string.
   * Falls back to English if key not found in target language.
   */
  const t = useCallback((key) => {
    return (
      translations[lang]?.[key] ??
      translations["en"]?.[key] ??
      key
    );
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
