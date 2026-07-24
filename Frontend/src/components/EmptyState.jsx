import T from "../ui/tokens";

/**
 * EmptyState — Consistent empty/zero-data placeholder.
 *
 * Props:
 *   icon     — Large emoji string or React element
 *   title    — Primary message (e.g. "No appointments yet")
 *   subtitle — Secondary hint (e.g. "Book your first appointment to get started")
 *   action   — Optional React element (usually a button)
 *   compact  — Boolean — smaller vertical padding for inline use
 */
export default function EmptyState({ icon = "📭", title = "Nothing here yet", subtitle, action, compact = false }) {
  return (
    <div style={{
      textAlign: "center",
      padding: compact ? "32px 16px" : "56px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <div style={{ fontSize: compact ? 36 : 48, lineHeight: 1, marginBottom: 4 }}>
        {icon}
      </div>
      <h4 style={{ fontSize: compact ? 14 : 16, fontWeight: 700, color: T.textPrimary, margin: 0 }}>
        {title}
      </h4>
      {subtitle && (
        <p style={{ fontSize: 13, color: T.textMuted, maxWidth: 340, lineHeight: 1.65, margin: 0 }}>
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
