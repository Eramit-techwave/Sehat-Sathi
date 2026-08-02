/**
 * DoctorCard — Premium doctor profile card component.
 * Used in both the Doctor Directory and quick-access lists.
 */
import { Star, MapPin, Clock, Video, User, CheckCircle2, IndianRupee, Languages } from "lucide-react";
import DS from "../ui/design-system";
import T from "../ui/tokens";

export default function DoctorCard({ doctor, onBook, compact = false }) {
  const {
    name, qualification, specialization, hospital, city,
    experience_years, languages, consultation_fee, availability,
    rating, review_count, verified, consultation_types,
    about, next_available, profile_photo,
  } = doctor;

  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isAvailableToday = availability === "Available Today";

  const stars = Array.from({ length: 5 }, (_, i) => {
    const full = i < Math.floor(rating);
    const half = !full && i < rating;
    return { full, half };
  });

  return (
    <div style={{
      ...DS.card(),
      transition: T.transition,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.primaryBorder; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = T.shadowSm; e.currentTarget.style.borderColor = T.border; }}
    >
      {/* Availability indicator strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: isAvailableToday ? `linear-gradient(90deg, ${T.green}, ${T.green}88)` : `linear-gradient(90deg, ${T.amber}, ${T.amber}88)`,
      }} />

      {/* Header */}
      <div style={DS.row(14, { marginBottom: 14, marginTop: 8 })}>
        {/* Avatar */}
        {profile_photo ? (
          <img src={profile_photo} alt={name} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${T.primaryBorder}` }} />
        ) : (
          <div style={{ ...DS.avatar(64, T.primary), fontSize: 20, border: `2px solid ${T.primaryBorder}`, flexShrink: 0 }}>
            {initials}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + Verified */}
          <div style={DS.row(6, { marginBottom: 2 })}>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{name}</span>
            {verified && (
              <CheckCircle2 size={14} style={{ color: T.primary, flexShrink: 0 }} title="Verified Doctor" />
            )}
          </div>
          {/* Qualification */}
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{qualification}</div>
          {/* Specialization badge */}
          <span style={DS.badge("blue")}>{specialization}</span>
          {doctor.distance_km !== undefined && doctor.distance_km !== null && (
            <span style={{
              background: "rgba(16,185,129,0.12)", color: "#059669",
              border: "1px solid rgba(16,185,129,0.25)",
              padding: "2px 8px", borderRadius: 100, fontSize: 10.5, fontWeight: 700,
              marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 3
            }}>
              <MapPin size={10} /> {doctor.distance_km} km away
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: T.textSecondary, display: "flex", alignItems: "center", gap: 5 }}>
          <MapPin size={11} style={{ color: T.textMuted, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hospital} {city ? `(${city})` : ""}</span>
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary, display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={11} style={{ color: T.textMuted }} />
          {experience_years} yrs experience
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary, display: "flex", alignItems: "center", gap: 5 }}>
          <IndianRupee size={11} style={{ color: T.textMuted }} />
          ₹{consultation_fee} / consult
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary, display: "flex", alignItems: "center", gap: 5 }}>
          <Languages size={11} style={{ color: T.textMuted }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(languages || []).join(", ")}</span>
        </div>
      </div>

      {/* Rating */}
      <div style={DS.row(8, { marginBottom: 12 })}>
        <div style={DS.row(2)}>
          {stars.map((s, i) => (
            <span key={i} style={{ color: s.full ? "#F59E0B" : s.half ? "#F59E0B" : T.border, fontSize: 13 }}>
              {s.full ? "★" : s.half ? "⯨" : "☆"}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{rating}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>({review_count} reviews)</span>
      </div>

      {/* Consultation types */}
      <div style={DS.row(6, { marginBottom: 14 })}>
        {(consultation_types || []).map(type => (
          <span key={type} style={{ ...DS.badge(type === "Online" ? "blue" : "green"), display: "flex", alignItems: "center", gap: 4 }}>
            {type === "Online" ? <Video size={9} /> : <User size={9} />}
            {type}
          </span>
        ))}
        <span style={{ ...DS.badge(isAvailableToday ? "green" : "amber"), marginLeft: "auto" }}>
          {isAvailableToday ? "🟢 Available Today" : `⏰ ${next_available || availability}`}
        </span>
      </div>

      {/* About (if not compact) */}
      {!compact && about && (
        <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6, marginBottom: 14,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {about}
        </p>
      )}

      {/* Action Buttons */}
      <div style={DS.row(8)}>
        <button
          onClick={onBook ? () => onBook(doctor) : undefined}
          style={DS.btnPrimary({ flex: 1, justifyContent: "center", padding: "10px 16px", fontSize: 13 })}
        >
          Book Consultation
        </button>
        <button style={DS.btnGhost({ padding: "10px 14px", fontSize: 12 })}>
          View Profile
        </button>
      </div>
    </div>
  );
}
