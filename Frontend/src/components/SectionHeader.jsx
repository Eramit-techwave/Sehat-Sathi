import T from "../ui/tokens";

/**
 * SectionHeader — Consistent section heading with optional description and action button.
 *
 * Props:
 *   label       — Small uppercase pill label above the heading (e.g. "Today")
 *   title       — Main heading text
 *   description — Optional paragraph beneath the title
 *   labelColor  — Accent color for the label pill (defaults to T.primary)
 *   action      — Optional React element (button/link) displayed to the right
 *   compact     — Boolean — reduces bottom margin for dense layouts
 */
export default function SectionHeader({ label, title, description, labelColor = T.primary, action, compact = false }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      gap: 16, marginBottom: compact ? 16 : 24, flexWrap: "wrap",
    }}>
      <div>
        {label && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: labelColor + "12",
            border: `1px solid ${labelColor}28`,
            color: labelColor,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "3px 10px", borderRadius: T.radiusFull,
            marginBottom: 8,
          }}>
            {label}
          </div>
        )}
        {title && (
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, margin: 0, lineHeight: 1.3 }}>
            {title}
          </h3>
        )}
        {description && (
          <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 4, lineHeight: 1.6, margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
