/**
 * ThemeContext — Light / Dark / System theme management
 *
 * Provides:
 *   - `theme`       : "light" | "dark" | "system"
 *   - `resolvedTheme` : "light" | "dark"  (what's actually rendered)
 *   - `setTheme(t)`  : switch theme
 *   - `toggleTheme()`: cycle light ↔ dark
 *
 * Behavior:
 *   - Persists to localStorage under key "sehat_theme"
 *   - "system" mode watches OS prefers-color-scheme
 *   - Injects CSS class "dark" on <html> for CSS-var overrides
 *   - Applies smooth transition on theme switch
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem("sehat_theme") || "light"; } catch { return "light"; }
  });

  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );

  // Track OS preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Apply dark class + CSS variables to <html>
  useEffect(() => {
    const root = document.documentElement;

    // Smooth transition between themes
    root.style.setProperty("transition", "background-color 0.2s ease, color 0.2s ease, border-color 0.15s ease");

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    // Remove transition after it completes to avoid interfering with animations
    const t = setTimeout(() => root.style.removeProperty("transition"), 250);
    return () => clearTimeout(t);
  }, [resolvedTheme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try { localStorage.setItem("sehat_theme", t); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
