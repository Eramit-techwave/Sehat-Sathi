import T from "../ui/tokens";

/**
 * StatCard — Reusable KPI / statistics card for dashboards.
 *
 * Props:
 *   icon      — React element (Lucide icon recommended, size 20)
 *   label     — Short label string  e.g. "Total Patients"
 *   value     — Displayed value    e.g. "142" or "₹4,500"
 *   color     — Accent color        e.g. T.primary  (defaults to T.primary)
 *   subtext   — Optional small line below value e.g. "+12 this week"
 *   onClick   — Optional click handler
 */
export default function StatCard({ icon, label, value, color = T.primary, subtext, onClick }) {
  const bg = color + "14"; // ~8% opacity tint
  const border = color + "28";

  return (
    <div
      onClick={onClick}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusLg,
        padding: "20px 22px",
        boxShadow: T.shadowSm,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        cursor: onClick ? "pointer" : "default",
        transition: T.transition,
      }}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.boxShadow = T.shadowMd;
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.transform = "translateY(-2px)";
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.boxShadow = T.shadowSm;
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      } : undefined}
    >
      {/* Icon badge */}
      <div style={{
        width: 44, height: 44, borderRadius: T.radiusMd,
        background: bg, border: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        color,
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, lineHeight: 1.1 }}>
          {value ?? "—"}
        </div>
        {subtext && (
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
