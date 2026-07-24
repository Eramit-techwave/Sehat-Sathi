/**
 * Sehat-Sathi shared style helpers.
 * All colors use CSS custom properties so they respond to light/dark mode.
 */

export const inputStyle = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  padding: "11px 14px",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

export const COLORS = {
  primary: "var(--primary)",
  success: "var(--green)",
  danger:  "var(--red)",
  muted:   "var(--text-muted)",
  surface: "var(--surface)",
};

export default { inputStyle, selectStyle, COLORS };
