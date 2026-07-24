import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function FloatingNotification({ show, type = "success", text = "", dark = false }) {
  if (!show) return null;
  const isSuccess = type === "success";
  const bg = dark ? (isSuccess ? "#064e3b" : "#7f1d1d") : (isSuccess ? "#F0FDF4" : "#FEF2F2");
  const border = dark ? (isSuccess ? "#10b981" : "#ef4444") : (isSuccess ? "#86EFAC" : "#FCA5A5");
  const color = dark ? "#fff" : (isSuccess ? "#166534" : "#991B1B");
  const padding = dark ? "16px 24px" : "14px 20px";
  const boxShadow = dark ? "0 20px 40px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.1)";
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12, padding,
      color, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10,
      boxShadow
    }}>
      {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{text}</span>
    </div>
  );
}
