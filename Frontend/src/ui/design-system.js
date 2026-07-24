/**
 * Sehat-Sathi Unified Design System
 * ───────────────────────────────────────────────────────────────
 * Factory functions that produce consistent inline style objects.
 * Every dashboard, component, and page should use these instead of
 * declaring local style constants.
 *
 * Usage:
 *   import DS from "../ui/design-system";
 *   <div style={DS.card()}>...</div>
 *   <button style={DS.btnPrimary()}>Submit</button>
 */

import T from "./tokens";

const DS = {
  // ── Page wrapper ──────────────────────────────────────────────
  page: (overrides = {}) => ({
    minHeight: "100vh",
    background: T.bg,
    color: T.textPrimary,
    fontFamily: T.fontFamily,
    ...overrides,
  }),

  // ── Content container ──────────────────────────────────────────
  container: (overrides = {}) => ({
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 4%",
    ...overrides,
  }),

  // ── Cards ──────────────────────────────────────────────────────
  card: (overrides = {}) => ({
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusLg,
    padding: T.sp6,
    boxShadow: T.shadowSm,
    ...overrides,
  }),

  cardHover: (overrides = {}) => ({
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusLg,
    padding: T.sp6,
    boxShadow: T.shadowSm,
    cursor: "pointer",
    transition: T.transition,
    ...overrides,
  }),

  insetCard: (overrides = {}) => ({
    background: T.surfaceAlt,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusMd,
    padding: T.sp4,
    ...overrides,
  }),

  // ── Buttons ────────────────────────────────────────────────────
  btnPrimary: (overrides = {}) => ({
    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
    color: "#FFFFFF",
    border: "none",
    padding: "11px 22px",
    borderRadius: T.radiusMd,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: T.shadowBlue,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontFamily: T.fontFamily,
    transition: T.transition,
    ...overrides,
  }),

  btnGhost: (overrides = {}) => ({
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.textSecondary,
    padding: "9px 16px",
    borderRadius: T.radiusMd,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: T.fontFamily,
    transition: T.transition,
    ...overrides,
  }),

  btnDanger: (overrides = {}) => ({
    background: T.redLight,
    border: `1px solid ${T.redBorder}`,
    color: T.red,
    padding: "9px 16px",
    borderRadius: T.radiusMd,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: T.fontFamily,
    transition: T.transition,
    ...overrides,
  }),

  btnSuccess: (overrides = {}) => ({
    background: T.greenLight,
    border: `1px solid ${T.greenBorder}`,
    color: T.green,
    padding: "9px 16px",
    borderRadius: T.radiusMd,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: T.fontFamily,
    transition: T.transition,
    ...overrides,
  }),

  // ── Form Inputs ────────────────────────────────────────────────
  input: (overrides = {}) => ({
    width: "100%",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusMd,
    padding: "11px 14px",
    color: T.textPrimary,
    fontSize: 14,
    outline: "none",
    fontFamily: T.fontFamily,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    ...overrides,
  }),

  select: (overrides = {}) => ({
    width: "100%",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusMd,
    padding: "11px 14px",
    color: T.textPrimary,
    fontSize: 14,
    outline: "none",
    fontFamily: T.fontFamily,
    cursor: "pointer",
    boxSizing: "border-box",
    ...overrides,
  }),

  // ── Badges ────────────────────────────────────────────────────
  badge: (color = "blue", overrides = {}) => {
    const map = {
      blue:   { bg: T.primaryLight, c: T.primary,  b: T.primaryBorder },
      green:  { bg: T.greenLight,   c: T.green,    b: T.greenBorder   },
      amber:  { bg: T.amberLight,   c: T.amber,    b: T.amberBorder   },
      red:    { bg: T.redLight,     c: T.red,      b: T.redBorder     },
      purple: { bg: T.purpleLight,  c: T.purple,   b: T.purpleBorder  },
      gray:   { bg: T.surfaceAlt,   c: T.textMuted, b: T.border       },
    };
    const s = map[color] || map.gray;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: T.radiusFull,
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
      background: s.bg,
      color: s.c,
      border: `1px solid ${s.b}`,
      ...overrides,
    };
  },

  // ── Stat Card ─────────────────────────────────────────────────
  statCard: (color = T.primary, overrides = {}) => ({
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusLg,
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: T.shadowSm,
    transition: T.transition,
    ...overrides,
  }),

  statIcon: (color = T.primary, overrides = {}) => ({
    width: 48,
    height: 48,
    borderRadius: T.radiusMd,
    background: `${color}14`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    ...overrides,
  }),

  // ── Tab bar ────────────────────────────────────────────────────
  tabBar: (overrides = {}) => ({
    display: "flex",
    gap: 4,
    background: T.surfaceAlt,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusMd,
    padding: 5,
    marginBottom: 28,
    width: "fit-content",
    overflowX: "auto",
    ...overrides,
  }),

  tab: (active, overrides = {}) => ({
    background: active ? T.surface : "transparent",
    border: `1px solid ${active ? T.border : "transparent"}`,
    color: active ? T.primary : T.textMuted,
    padding: "9px 16px",
    borderRadius: T.radiusSm,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: T.transition,
    whiteSpace: "nowrap",
    boxShadow: active ? T.shadowSm : "none",
    ...overrides,
  }),

  // ── Section Header ────────────────────────────────────────────
  sectionTitle: (overrides = {}) => ({
    fontSize: 16,
    fontWeight: 700,
    color: T.textPrimary,
    margin: 0,
    ...overrides,
  }),

  sectionSub: (overrides = {}) => ({
    fontSize: 13,
    color: T.textMuted,
    margin: "4px 0 0",
    ...overrides,
  }),

  // ── Data Table ────────────────────────────────────────────────
  tableWrapper: (overrides = {}) => ({
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusLg,
    overflow: "hidden",
    boxShadow: T.shadowSm,
    ...overrides,
  }),

  tableHeader: (overrides = {}) => ({
    background: T.surfaceAlt,
    color: T.textMuted,
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "10px 16px",
    textAlign: "left",
    borderBottom: `1px solid ${T.border}`,
    whiteSpace: "nowrap",
    ...overrides,
  }),

  tableCell: (overrides = {}) => ({
    padding: "13px 16px",
    borderBottom: `1px solid ${T.surfaceAlt}`,
    color: T.textPrimary,
    verticalAlign: "middle",
    fontSize: 13,
    ...overrides,
  }),

  // ── Modal Overlay ─────────────────────────────────────────────
  modalOverlay: (overrides = {}) => ({
    position: "fixed",
    inset: 0,
    zIndex: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    ...overrides,
  }),

  modal: (overrides = {}) => ({
    width: "100%",
    maxWidth: 480,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusXl,
    padding: "32px",
    boxShadow: T.shadowLg,
    animation: "fadeUp 0.2s ease",
    ...overrides,
  }),

  // ── Avatar ────────────────────────────────────────────────────
  avatar: (size = 40, color = T.primary, overrides = {}) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    background: `${color}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Math.round(size * 0.35),
    color: color,
    fontWeight: 700,
    flexShrink: 0,
    ...overrides,
  }),

  // ── Divider ───────────────────────────────────────────────────
  divider: (overrides = {}) => ({
    height: 1,
    background: T.border,
    border: "none",
    margin: `${T.sp6} 0`,
    ...overrides,
  }),

  // ── Empty state ───────────────────────────────────────────────
  emptyState: (overrides = {}) => ({
    background: T.surfaceAlt,
    border: `1px dashed ${T.border}`,
    borderRadius: T.radiusLg,
    padding: "48px 24px",
    textAlign: "center",
    ...overrides,
  }),

  // ── Toast / notification ──────────────────────────────────────
  toast: (type = "success", overrides = {}) => ({
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 999,
    background: type === "success" ? T.greenLight : T.redLight,
    border: `1px solid ${type === "success" ? T.greenBorder : T.redBorder}`,
    borderRadius: T.radiusMd,
    padding: "12px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: type === "success" ? T.green : T.red,
    backdropFilter: "blur(10px)",
    animation: "fadeUp 0.3s ease",
    boxShadow: T.shadowMd,
    ...overrides,
  }),

  // ── Gradient accent line ───────────────────────────────────────
  accentLine: (color = T.primary, overrides = {}) => ({
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${color}, ${color}88)`,
    ...overrides,
  }),

  // ── Icon circle ───────────────────────────────────────────────
  iconCircle: (color = T.primary, size = 44, overrides = {}) => ({
    width: size,
    height: size,
    borderRadius: T.radiusMd,
    background: `${color}12`,
    border: `1px solid ${color}22`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    ...overrides,
  }),

  // ── Progress bar ──────────────────────────────────────────────
  progressTrack: (overrides = {}) => ({
    height: 6,
    borderRadius: 3,
    background: T.surfaceAlt,
    overflow: "hidden",
    ...overrides,
  }),

  progressFill: (pct = 0, color = T.primary, overrides = {}) => ({
    height: "100%",
    borderRadius: 3,
    background: color,
    width: `${Math.min(pct, 100)}%`,
    transition: "width 0.8s ease",
    ...overrides,
  }),

  // ── Grid helpers ──────────────────────────────────────────────
  grid2: (overrides = {}) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    ...overrides,
  }),

  grid3: (overrides = {}) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    ...overrides,
  }),

  grid4: (overrides = {}) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    ...overrides,
  }),

  // ── Flex helpers ──────────────────────────────────────────────
  row: (gap = 12, overrides = {}) => ({
    display: "flex",
    alignItems: "center",
    gap,
    ...overrides,
  }),

  between: (overrides = {}) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...overrides,
  }),
};

export default DS;
