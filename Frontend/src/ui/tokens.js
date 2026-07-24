/**
 * Sehat-Sathi Design System Tokens
 * ─────────────────────────────────────────────────────────────────
 * IMPORTANT: All color/surface/text/border values reference CSS custom
 * properties so they respond to light/dark theme changes automatically.
 * Only spacing, radii, shadows, transitions are static.
 *
 * Usage:
 *   import T from "../ui/tokens";
 *   style={{ color: T.textPrimary, padding: T.sp4 }}
 */

const T = {
  // ── Colors — All use CSS variables (auto light/dark) ─────────────
  // Primary — Medical Blue
  primary:       "var(--primary)",
  primaryDark:   "var(--primary-dark)",
  primaryLight:  "var(--primary-light)",
  primaryBorder: "var(--primary-border)",

  // Secondary — Medical Green
  green:         "var(--green)",
  greenDark:     "var(--green)",
  greenLight:    "var(--green-light)",
  greenBorder:   "var(--green-border)",

  // Accent — Amber / Warning
  amber:         "var(--amber)",
  amberLight:    "var(--amber-light)",
  amberBorder:   "var(--amber-border)",

  // Danger — Red
  red:           "var(--red)",
  redLight:      "var(--red-light)",
  redBorder:     "var(--red-border)",

  // Purple
  purple:        "var(--purple)",
  purpleLight:   "var(--purple-light)",
  purpleBorder:  "var(--purple-border)",

  // Cyan
  cyan:          "var(--cyan)",
  cyanLight:     "var(--cyan-light)",
  cyanBorder:    "var(--cyan-border)",

  // ── Surfaces — CSS variables (auto-themes) ──────────────────────
  bg:            "var(--bg)",
  surface:       "var(--surface)",
  surfaceAlt:    "var(--surface-alt)",
  surfaceHover:  "var(--surface-hover)",

  // ── Text — CSS variables ────────────────────────────────────────
  textPrimary:   "var(--text)",
  textSecondary: "var(--text-secondary)",
  textMuted:     "var(--text-muted)",
  textDisabled:  "var(--text-disabled)",

  // ── Borders — CSS variables ─────────────────────────────────────
  border:        "var(--border)",
  borderStrong:  "var(--border-strong)",

  // ── Shadows — Static (look fine in both themes) ─────────────────
  shadowSm:   "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:   "0 4px 16px rgba(0,0,0,0.07)",
  shadowLg:   "0 12px 40px rgba(0,0,0,0.10)",
  shadowBlue: "0 4px 14px rgba(37,99,235,0.20)",

  // ── Border Radii — Static ───────────────────────────────────────
  radiusSm:   "8px",
  radiusMd:   "12px",
  radiusLg:   "16px",
  radiusXl:   "20px",
  radiusFull: "9999px",

  // ── Spacing scale (multiples of 4px) ───────────────────────────
  sp1:  "4px",
  sp2:  "8px",
  sp3:  "12px",
  sp4:  "16px",
  sp5:  "20px",
  sp6:  "24px",
  sp8:  "32px",
  sp10: "40px",
  sp12: "48px",
  sp16: "64px",

  // ── Typography ─────────────────────────────────────────────────
  fontFamily: "var(--font)",
  fontSerif:  "var(--font-serif)",

  // ── Transition ─────────────────────────────────────────────────
  transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
};

export default T;

// ── Named color helpers ──────────────────────────────────────────
export const roleColor = (role) => {
  if (role === "Admin")    return "var(--purple)";
  if (role === "Doctor")   return "var(--green)";
  if (role === "Hospital") return "var(--amber)";
  return "var(--primary)"; // Patient
};

export const roleColorLight = (role) => {
  if (role === "Admin")    return "var(--purple-light)";
  if (role === "Doctor")   return "var(--green-light)";
  if (role === "Hospital") return "var(--amber-light)";
  return "var(--primary-light)";
};

export const statusColor = (status) => {
  if (!status) return "var(--text-muted)";
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "active" || s === "normal" || s === "completed") return "var(--green)";
  if (s === "pending")  return "var(--amber)";
  if (s === "cancelled" || s === "error" || s === "high" || s === "critical")     return "var(--red)";
  return "var(--text-muted)";
};

export const statusColorLight = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "confirmed" || s === "active" || s === "normal" || s === "completed") return "var(--green-light)";
  if (s === "pending")  return "var(--amber-light)";
  if (s === "cancelled" || s === "error" || s === "high" || s === "critical")     return "var(--red-light)";
  return "var(--surface-alt)";
};
