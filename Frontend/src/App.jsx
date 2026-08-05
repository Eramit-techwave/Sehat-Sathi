import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import { useLanguage } from "./context/LanguageContext.jsx";
import NotificationBell from "./components/NotificationBell.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import TermsGate from "./components/TermsGate.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import TranslateWidget from "./components/TranslateWidget.jsx";
import {
  Activity, LogOut, Sun, Moon, Monitor, Menu, X,
  LayoutDashboard, FileText
} from "lucide-react";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const LegalHub = lazy(() => import("./pages/LegalHub.jsx"));

function RouteLoading() {
  return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>Loading…</div>;
}

// ── Theme Toggle Button ──────────────────────────────────────────────────────
function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const OPTIONS = [
    { value: "light",  icon: <Sun size={14} />,     label: "Light" },
    { value: "dark",   icon: <Moon size={14} />,    label: "Dark" },
    { value: "system", icon: <Monitor size={14} />, label: "System" },
  ];

  const current = OPTIONS.find(o => o.value === theme) || OPTIONS[0];

  return (
    <div style={{ position: "relative" }}>
      <button
        className="theme-toggle"
        onClick={() => setOpen(o => !o)}
        title={`Theme: ${current.label}`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "6px",
            minWidth: 130,
            animation: "fadeScale 0.15s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTheme(opt.value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: theme === opt.value ? "var(--primary-light)" : "transparent",
                  color: theme === opt.value ? "var(--primary)" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: theme === opt.value ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (theme !== opt.value) e.currentTarget.style.background = "var(--surface-alt)"; }}
                onMouseLeave={e => { if (theme !== opt.value) e.currentTarget.style.background = "transparent"; }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({ user, logout, onLoginClick, onGetStartedClick, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t("nav_features"),     href: "#features" },
    { label: t("nav_how_it_works"), href: "#how-it-works" },
    { label: t("nav_doctors"),      href: "#doctors" },
    { label: t("nav_blood_donor"),  href: "#blood" },
  ];

  const handleNavLink = (href) => {
    onClose();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mobile-menu hide-desktop">
      <div style={{ display: "flex", justifyContent: "flex-end", position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={onClose}
          style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}
        >
          <X size={18} />
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {!user && NAV_LINKS.map(link => (
          <button
            key={link.href}
            onClick={() => handleNavLink(link.href)}
            style={{ background: "none", border: "none", textAlign: "left", padding: "12px 4px", fontSize: 15, fontWeight: 600, color: "var(--text)", cursor: "pointer", borderBottom: "1px solid var(--surface-alt)" }}
          >
            {link.label}
          </button>
        ))}

        {user ? (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn-ghost"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { navigate("/dashboard"); onClose(); }}
            >
              <LayoutDashboard size={14} /> {t("nav_dashboard")}
            </button>
            <button className="btn-danger" style={{ width: "100%", justifyContent: "center" }} onClick={() => { logout(); onClose(); }}>
              <LogOut size={14} /> {t("nav_sign_out")}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => { onLoginClick(); onClose(); }}>{t("nav_sign_in")}</button>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { onGetStartedClick(); onClose(); }}>{t("nav_get_started")}</button>
          </div>
        )}
      </nav>
    </div>
  );
}

// ── Role color helpers ───────────────────────────────────────────────────────
const ROLE_COLORS = {
  Admin:    { bg: "rgba(139,92,246,0.1)",   color: "#7C3AED",  border: "rgba(139,92,246,0.25)" },
  Doctor:   { bg: "rgba(16,185,129,0.1)",   color: "#059669",  border: "rgba(16,185,129,0.25)" },
  Hospital: { bg: "rgba(245,158,11,0.1)",   color: "#D97706",  border: "rgba(245,158,11,0.25)" },
  Patient:  { bg: "rgba(37,99,235,0.1)",    color: "#2563EB",  border: "rgba(37,99,235,0.25)"  },
};

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [termsGateCallback, setTermsGateCallback] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loading && user && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [user, loading, location.pathname, navigate]);

  // Intercept login/signup events — show T&C gate first
  const showTermsGate = useCallback((originalEvent) => {
    setTermsGateCallback(() => () => {
      window.dispatchEvent(new Event(originalEvent));
    });
  }, []);

  useEffect(() => {
    const handleLoginTrigger = () => showTermsGate("__direct-login-modal");
    const handleSignupTrigger = () => showTermsGate("__direct-signup-modal");
    const handleDirectLogin = () => window.dispatchEvent(new CustomEvent("trigger-login-modal-direct"));
    const handleDirectSignup = () => window.dispatchEvent(new CustomEvent("trigger-signup-modal-direct"));

    window.addEventListener("trigger-login-modal", handleLoginTrigger);
    window.addEventListener("trigger-signup-modal", handleSignupTrigger);
    window.addEventListener("__direct-login-modal", handleDirectLogin);
    window.addEventListener("__direct-signup-modal", handleDirectSignup);
    return () => {
      window.removeEventListener("trigger-login-modal", handleLoginTrigger);
      window.removeEventListener("trigger-signup-modal", handleSignupTrigger);
      window.removeEventListener("__direct-login-modal", handleDirectLogin);
      window.removeEventListener("__direct-signup-modal", handleDirectSignup);
    };
  }, [showTermsGate]);

  const NAV_LINKS = [
    { label: t("nav_features"),     href: "#features" },
    { label: t("nav_how_it_works"), href: "#how-it-works" },
    { label: t("nav_doctors"),      href: "#doctors" },
    { label: t("nav_blood_donor"),  href: "#blood" },
    { label: t("nav_about"),        href: "#about" },
    { label: "Legal",               href: "/legal", isRoute: true },
  ];

  const handleNavLink = (link) => {
    if (link.isRoute) { navigate(link.href); return; }
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" }), 150);
    } else {
      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.Patient;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
          }}>
            <Activity size={22} color="#fff" />
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Loading Sehat-Sathi…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>

      {/* ── GLOBAL NAVBAR ─────────────────────────────────────────────── */}
      <nav
        className={`glass-nav${scrolled ? " scrolled" : ""}`}
        style={{ position: "sticky", top: 0, zIndex: 50, padding: "0 6%" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

          {/* Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}
            onClick={() => navigate("/")}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.30)",
            }}>
              <Activity size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Sehat<span style={{ color: "var(--primary)", fontWeight: 400 }}>Sathi</span>
            </span>
          </div>

          {/* Center Nav Links (desktop) */}
          {!user && (
            <nav className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {NAV_LINKS.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleNavLink(link)}
                  style={{
                    background: location.pathname === link.href ? "var(--primary-light)" : "none",
                    border: "none",
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: location.pathname === link.href ? 700 : 500,
                    color: location.pathname === link.href ? "var(--primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    borderRadius: "var(--radius-md)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-alt)"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = location.pathname === link.href ? "var(--primary-light)" : "none"; e.currentTarget.style.color = location.pathname === link.href ? "var(--primary)" : "var(--text-secondary)"; }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LanguageSelector />
            <ThemeToggle />

            {user ? (
              <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Role badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                  background: roleStyle.bg, color: roleStyle.color,
                  border: `1px solid ${roleStyle.border}`,
                  borderRadius: 6, padding: "3px 10px",
                }}>
                  {user.role?.toUpperCase()}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("nav_hi")}, {user.name?.split(" ")[0]}
                </span>
                <NotificationBell />
                <button
                  className="btn-danger"
                  style={{ padding: "8px 14px", fontSize: 12 }}
                  onClick={logout}
                >
                  <LogOut size={13} /> {t("nav_sign_out")}
                </button>
              </div>
            ) : location.pathname === "/" && (
              <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="btn-ghost" onClick={() => window.dispatchEvent(new Event("trigger-login-modal"))}>
                  {t("nav_sign_in")}
                </button>
                <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => window.dispatchEvent(new Event("trigger-signup-modal"))}>
                  {t("nav_get_started")}
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="theme-toggle show-mobile"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <MobileMenu
          user={user}
          logout={logout}
          onClose={() => setMobileOpen(false)}
          onLoginClick={() => window.dispatchEvent(new Event("trigger-login-modal"))}
          onGetStartedClick={() => window.dispatchEvent(new Event("trigger-signup-modal"))}
        />
      )}

      {/* ── ROUTES ────────────────────────────────────────────────────── */}
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/legal" element={<LegalHub />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      {/* ── GLOBAL: Terms Gate ─────────────────────────────────────────── */}
      {termsGateCallback && (
        <TermsGate
          onAccept={() => {
            termsGateCallback?.();
            setTermsGateCallback(null);
          }}
        />
      )}

      {/* ── GLOBAL: Cookie Consent Banner ─────────────────────────────────── */}
      <CookieConsent />

      {/* ── GLOBAL: Screen Translate Widget ───────────────────────────── */}
      <TranslateWidget />
    </div>
  );
}
