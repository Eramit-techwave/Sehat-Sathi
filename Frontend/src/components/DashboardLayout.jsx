/**
 * DashboardLayout — Shared sidebar + topbar layout for all role dashboards.
 * Provides: collapsible sidebar, mobile hamburger, breadcrumbs, notifications, theme toggle.
 * Usage:
 *   <DashboardLayout navItems={[...]} role="Doctor" breadcrumb={["Home","Profile"]}>
 *     <YourContent />
 *   </DashboardLayout>
 */
import { useState, useEffect } from "react";
import { Activity, LogOut, Menu, X, Bell, Sun, Moon, Monitor, ChevronRight, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

// ── Role badge colors ────────────────────────────────────────────────
const ROLE_COLORS = {
  Admin:    { bg: "rgba(139,92,246,0.1)",  color: "#7C3AED", border: "rgba(139,92,246,0.25)" },
  Doctor:   { bg: "rgba(16,185,129,0.1)",  color: "#059669", border: "rgba(16,185,129,0.25)" },
  Hospital: { bg: "rgba(245,158,11,0.1)",  color: "#D97706", border: "rgba(245,158,11,0.25)" },
  Patient:  { bg: "rgba(37,99,235,0.1)",   color: "#2563EB", border: "rgba(37,99,235,0.25)"  },
};

// ── Tiny theme toggle ────────────────────────────────────────────────
function TopbarThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const OPTIONS = [
    { value: "light",  icon: <Sun size={13} />,     label: "Light" },
    { value: "dark",   icon: <Moon size={13} />,    label: "Dark"  },
    { value: "system", icon: <Monitor size={13} />, label: "System" },
  ];
  const current = OPTIONS.find(o => o.value === theme) || OPTIONS[0];
  return (
    <div style={{ position: "relative" }}>
      <button className="theme-toggle" onClick={() => setOpen(o => !o)} title={`Theme: ${current.label}`} aria-label="Toggle theme">
        {resolvedTheme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)",
            padding: 6, minWidth: 130, animation: "fadeScale 0.15s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { setTheme(opt.value); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "none",
                  background: theme === opt.value ? "var(--primary-light)" : "transparent",
                  color: theme === opt.value ? "var(--primary)" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: theme === opt.value ? 700 : 500, cursor: "pointer",
                  textAlign: "left", transition: "all 0.15s",
                }}
              >{opt.icon} {opt.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export default function DashboardLayout({
  navItems = [],           // [{ id, label, icon, badge, badgeVariant }]
  activeTab,               // current active tab id
  onTabChange,             // (id) => void
  role = "Patient",
  breadcrumb = [],         // ["Section", "Sub-section"]
  children,
  topbarRight,             // extra right-side topbar content
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roleStyle = ROLE_COLORS[role] || ROLE_COLORS.Patient;

  // Close sidebar on wide screen resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 900) setSidebarOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="dash-root">

      {/* ── Sidebar overlay (mobile) ─────────────────────────────── */}
      <div
        className={`dash-sidebar-overlay${sidebarOpen ? " active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`dash-sidebar${sidebarOpen ? " mobile-open" : ""}`}>

        {/* Logo */}
        <div className="dash-sidebar-logo">
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(37,99,235,0.30)", flexShrink: 0
          }}>
            <Activity size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Sehat<span style={{ color: "var(--primary)", fontWeight: 400 }}>Sathi</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              background: roleStyle.bg, color: roleStyle.color,
              border: `1px solid ${roleStyle.border}`,
              borderRadius: 4, padding: "1px 6px", display: "inline-block", marginTop: 1 }}>
              {role.toUpperCase()}
            </div>
          </div>
          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", display: "none" }}
            className="show-mobile">
            <X size={16} />
          </button>
        </div>

        {/* User quick info */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: roleStyle.bg, border: `2px solid ${roleStyle.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <User size={16} style={{ color: roleStyle.color }} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name?.split(" ")[0] || "User"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="dash-nav-section" style={{ flex: 1 }}>
          {(() => {
            // Group nav items by their `group` property for visual section dividers
            const rendered = [];
            let lastGroup = undefined;
            navItems.forEach((item, idx) => {
              const grp = item.group;
              if (grp !== undefined && grp !== lastGroup) {
                if (idx > 0) rendered.push(<div key={`div-${grp}`} className="dash-nav-divider" />);
                rendered.push(
                  <span key={`lbl-${grp}`} className="dash-nav-group-label">{grp}</span>
                );
                lastGroup = grp;
              }
              rendered.push(
                <button
                  key={item.id}
                  className={`dash-nav-item${activeTab === item.id ? " active" : ""}`}
                  onClick={() => { onTabChange?.(item.id); setSidebarOpen(false); }}
                >
                  <span className="dash-nav-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={item.badgeVariant === "blue" ? "dash-nav-badge-blue" : "dash-nav-badge"}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            });
            return rendered;
          })()}
        </nav>

        {/* Footer */}
        <div className="dash-sidebar-footer">
          <button
            className="dash-nav-item"
            onClick={logout}
            style={{ color: "var(--red)" }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="dash-content">

        {/* Top bar */}
        <header className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile hamburger */}
            <button
              className="theme-toggle show-mobile"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              style={{ display: "none" }}
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            {breadcrumb.length > 0 && (
              <nav className="dash-breadcrumb hide-mobile">
                <span className="dash-breadcrumb-item" onClick={() => onTabChange?.(navItems[0]?.id)}>
                  Dashboard
                </span>
                {breadcrumb.map((crumb, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ChevronRight size={12} className="dash-breadcrumb-sep" />
                    <span className={`dash-breadcrumb-item${i === breadcrumb.length - 1 ? " current" : ""}`}>
                      {crumb}
                    </span>
                  </span>
                ))}
              </nav>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {topbarRight}
            <NotificationBell />
            <TopbarThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
