import T from "../ui/tokens";

/**
 * SkeletonCard — Animated loading placeholder.
 * Renders a shimmer-pulsing card to replace content while data loads.
 *
 * Props:
 *   lines   — Number of text skeleton lines to show (default 3)
 *   height  — Fixed height if you need a fixed-size skeleton (e.g. "120px")
 *   style   — Extra styles on the outer wrapper
 */
export default function SkeletonCard({ lines = 3, height, style = {} }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: "20px 22px",
      boxShadow: T.shadowSm,
      height: height || "auto",
      overflow: "hidden",
      ...style,
    }}>
      <style>{`
        @keyframes _skeleton_pulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
        ._skel { animation: _skeleton_pulse 1.5s ease-in-out infinite; background: #E2E8F0; border-radius: 6px; }
      `}</style>

      {/* Header row: icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div className="_skel" style={{ width: 40, height: 40, borderRadius: T.radiusMd, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="_skel" style={{ height: 10, width: "45%", marginBottom: 8 }} />
          <div className="_skel" style={{ height: 14, width: "70%" }} />
        </div>
      </div>

      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="_skel" style={{
          height: 10,
          width: i === lines - 1 ? "60%" : "100%",
          marginBottom: i < lines - 1 ? 10 : 0,
        }} />
      ))}
    </div>
  );
}

/**
 * SkeletonRow — Single table row skeleton (for lists/tables)
 */
export function SkeletonRow({ cols = 4 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
      <style>{`
        @keyframes _skeleton_pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ._skel { animation:_skeleton_pulse 1.5s ease-in-out infinite; background:#E2E8F0; border-radius:6px; }
      `}</style>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="_skel" style={{ height: 10, flex: i === 0 ? "0 0 120px" : 1 }} />
      ))}
    </div>
  );
}
