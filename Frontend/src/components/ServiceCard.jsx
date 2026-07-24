/**
 * ServiceCard — Premium healthcare service card component.
 * Used in the Service Marketplace.
 */
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import DS from "../ui/design-system";
import T from "../ui/tokens";

const BADGE_COLOR_MAP = {
  green: T.green,
  blue: T.primary,
  amber: T.amber,
  red: T.red,
};

export default function ServiceCard({ service, onBook }) {
  const { name, icon, description, priceRange, availability, availabilityBadge, estimatedArrival, features, color, popular } = service;

  return (
    <div style={{
      ...DS.card(),
      position: "relative",
      transition: T.transition,
      overflow: "hidden",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${color}18`; e.currentTarget.style.borderColor = `${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = T.shadowSm; e.currentTarget.style.borderColor = T.border; }}
    >
      {/* Top color accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

      {/* Popular badge */}
      {popular && (
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <span style={{ ...DS.badge("amber"), fontSize: 9 }}>⭐ Popular</span>
        </div>
      )}

      {/* Icon + Title */}
      <div style={DS.row(14, { marginTop: 10, marginBottom: 14 })}>
        <div style={{
          width: 56, height: 56, borderRadius: T.radiusMd,
          background: `${color}12`, border: `1px solid ${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: BADGE_COLOR_MAP[availabilityBadge] || T.green, flexShrink: 0 }} />
            {availability}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6, marginBottom: 14,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {description}
      </p>

      {/* Features list */}
      <div style={{ marginBottom: 16 }}>
        {(features || []).slice(0, 3).map((f, i) => (
          <div key={i} style={DS.row(6, { marginBottom: 5 })}>
            <CheckCircle2 size={11} style={{ color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: T.textSecondary }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Price + ETA */}
      <div style={{ background: T.surfaceAlt, borderRadius: T.radiusMd, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>Starting from</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{priceRange}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
            <Clock size={9} /> Est. Arrival
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color }}>{estimatedArrival}</div>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook ? () => onBook(service) : undefined}
        style={{
          width: "100%",
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          color: "#fff",
          border: "none",
          borderRadius: T.radiusMd,
          padding: "11px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontFamily: T.fontFamily,
          transition: T.transition,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        Book Now <ArrowRight size={14} />
      </button>
    </div>
  );
}
