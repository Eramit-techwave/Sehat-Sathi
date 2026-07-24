import React from "react";
import { COLORS } from "../ui/theme";

export default function Button({ children, variant = "primary", size = "md", onClick, disabled, style, className, type = "button" }) {
  const base = {
    padding: size === "sm" ? "6px 10px" : "10px 16px",
    borderRadius: 10,
    fontSize: size === "sm" ? 12 : 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const variants = {
    primary: { background: COLORS.primary, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.muted, border: "1px solid rgba(255,255,255,0.04)" },
    success: { background: COLORS.success, color: "#fff" },
    danger: { background: COLORS.danger, color: "#fff" }
  };

  const applied = { ...base, ...(variants[variant] || variants.primary), ...(style || {}) };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className} style={applied}>
      {children}
    </button>
  );
}
