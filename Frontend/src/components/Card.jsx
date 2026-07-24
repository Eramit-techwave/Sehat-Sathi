import React from "react";
import { COLORS } from "../ui/theme";

export default function Card({ children, onClick, style, className }) {
  const base = {
    background: COLORS.surface || "#FFFFFF",
    border: `1px solid #E2E8F0`,
    borderRadius: 14,
    padding: 20,
    boxSizing: "border-box",
  };
  return (
    <div onClick={onClick} className={className} style={{ ...base, ...(style || {}) }}>
      {children}
    </div>
  );
}
