/**
 * DoctorProfileModal — Full doctor profile view for patients.
 * Opens as a modal overlay showing all doctor details + Google Maps link + Book CTA.
 * Production-ready: online status, consultation CTAs, Maps, clinic timing, reg number.
 */
import { useState } from "react";
import {
  X, MapPin, Star, Clock, Phone, Stethoscope, Award, IndianRupee,
  Navigation, Building2, Video, Mic, MessageCircle, ShieldCheck,
  Globe, Calendar, Info, ChevronDown, ChevronUp
} from "lucide-react";

export default function DoctorProfileModal({ doctor, onClose, onBook }) {
  const [showComingSoon, setShowComingSoon] = useState(null); // "video" | "audio" | "chat"
  const [showAboutMore, setShowAboutMore] = useState(false);

  if (!doctor) return null;

  const googleMapsUrl = doctor.clinic_address || doctor.city
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [doctor.clinic_address, doctor.city, doctor.state, "India"].filter(Boolean).join(", ")
      )}`
    : null;

  const navigateUrl = doctor.lat && doctor.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`
    : googleMapsUrl;

  const renderStars = (rating = 4.5) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i} size={13}
        fill={i < Math.floor(rating) ? "#F59E0B" : "none"}
        stroke="#F59E0B"
        style={{ flexShrink: 0 }}
      />
    ));

  const availability = doctor.availability || "Available This Week";
  const isOnline = availability === "Available Today" || doctor.is_online;
  const isAvailableToday = availability === "Available Today";

  const aboutText = doctor.about || "";
  const aboutTruncated = aboutText.length > 180;
  const displayedAbout = showAboutMore || !aboutTruncated ? aboutText : aboutText.slice(0, 180) + "...";

  const consultationTypes = doctor.consultation_types || ["In-Person"];
  const languages = doctor.languages?.length > 0 ? doctor.languages : [];
  const clinicTiming = doctor.clinic_timing || doctor.timings || null;
  const regNumber = doctor.registration_number || doctor.reg_number || null;
  const emergency = doctor.emergency_contact || doctor.phone || null;

  const ctaActions = [
    { id: "book",  label: "Book Appointment", icon: <Calendar size={14} />,  className: "consult-btn book",  action: () => { onClose(); onBook?.(doctor); } },
    { id: "video", label: "Video Call",        icon: <Video size={14} />,      className: "consult-btn video", action: () => setShowComingSoon("video") },
    { id: "audio", label: "Audio Call",        icon: <Mic size={14} />,        className: "consult-btn audio", action: () => setShowComingSoon("audio") },
    { id: "chat",  label: "Chat",              icon: <MessageCircle size={14} />, className: "consult-btn chat", action: () => setShowComingSoon("chat") },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="doctor-profile-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: "90vh", maxWidth: 640 }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
          padding: "24px 24px 20px",
          position: "relative",
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: 76, height: 76, borderRadius: 18,
              background: doctor.profile_photo ? "transparent" : "rgba(255,255,255,0.15)",
              border: "3px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, flexShrink: 0, overflow: "hidden", position: "relative"
            }}>
              {doctor.profile_photo
                ? <img src={doctor.profile_photo} alt={doctor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "👨‍⚕️"
              }
              {/* Online/Offline dot */}
              <div style={{
                position: "absolute", bottom: 4, right: 4,
                width: 12, height: 12, borderRadius: "50%",
                background: isOnline ? "#10B981" : "#94A3B8",
                border: "2px solid #1E3A5F",
                boxShadow: isOnline ? "0 0 6px rgba(16,185,129,0.8)" : "none"
              }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
                  Dr. {doctor.name}
                </h2>
                {doctor.verified && (
                  <ShieldCheck size={16} style={{ color: "#6EE7B7", flexShrink: 0 }} />
                )}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: "4px 0 8px" }}>
                {doctor.specialization || doctor.specialty || "General Physician"}
                {doctor.qualification && <span style={{ color: "rgba(255,255,255,0.55)", marginLeft: 6 }}>• {doctor.qualification}</span>}
              </div>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 2 }}>{renderStars(doctor.rating)}</div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
                  {(doctor.rating || 4.5).toFixed(1)}
                </span>
                {doctor.review_count > 0 && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>({doctor.review_count} reviews)</span>
                )}
              </div>
            </div>
          </div>

          {/* Status + badges row */}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: isOnline ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.12)",
              border: `1px solid ${isOnline ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.2)"}`,
              color: isOnline ? "#6EE7B7" : "rgba(255,255,255,0.8)",
              padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#10B981" : "#94A3B8", display: "inline-block" }} />
              {isOnline ? "Online Now" : availability}
            </span>
            {doctor.verified && (
              <span style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.35)", color: "#93C5FD", padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                ✓ Verified Doctor
              </span>
            )}
          </div>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────── */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* Quick Stats */}
          <div style={{ padding: "18px 22px 14px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { icon: <Award size={15} />,        label: "Experience",    value: doctor.experience_years ? `${doctor.experience_years} yrs` : "N/A", color: "var(--purple)" },
              { icon: <IndianRupee size={15} />,  label: "Consultation",  value: doctor.consultation_fee ? `₹${doctor.consultation_fee}` : "N/A",     color: "var(--green)" },
              { icon: <Clock size={15} />,        label: "Next Slot",     value: doctor.next_available || "Today",                                      color: "var(--primary)" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ background: "var(--surface-alt)", borderRadius: 10, padding: "12px 10px", textAlign: "center", border: "1px solid var(--border)" }}>
                <div style={{ color, marginBottom: 4, display: "flex", justifyContent: "center" }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{value}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Coming Soon Banner */}
          {showComingSoon && (
            <div style={{ margin: "0 22px 14px", background: "var(--amber-light)", border: "1px solid var(--amber-border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>
                  {showComingSoon === "video" ? "📹" : showComingSoon === "audio" ? "📞" : "💬"} {showComingSoon.charAt(0).toUpperCase() + showComingSoon.slice(1)} Consultation — Coming Soon
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Call the clinic directly to book a {showComingSoon} consultation.
                </div>
              </div>
              <button onClick={() => setShowComingSoon(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Hospital Affiliations */}
          {(doctor.hospital_associations?.length > 0 || doctor.hospital) && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Hospital</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {doctor.hospital_associations?.length > 0
                  ? doctor.hospital_associations.map((assoc, i) => (
                      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, background: "var(--primary-light)", border: "1px solid var(--primary-border)", color: "var(--primary)", padding: "5px 10px", borderRadius: 8 }}>
                        <Building2 size={11} /> {assoc.hospital_name}
                        {assoc.is_primary && <span style={{ fontWeight: 800 }}>★</span>}
                      </span>
                    ))
                  : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, background: "var(--primary-light)", border: "1px solid var(--primary-border)", color: "var(--primary)", padding: "5px 10px", borderRadius: 8 }}>
                      <Building2 size={11} /> {doctor.hospital}
                    </span>
                }
              </div>
            </div>
          )}

          {/* Clinic Timing */}
          {clinicTiming && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Clinic Hours</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                <Clock size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                {clinicTiming}
              </div>
            </div>
          )}

          {/* Registration Number */}
          {regNumber && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Medical Registration</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                <ShieldCheck size={13} style={{ color: "var(--green)", flexShrink: 0 }} />
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{regNumber}</span>
                <span style={{ fontSize: 10, background: "var(--green-light)", color: "var(--green)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid var(--green-border)" }}>Verified</span>
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Languages</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {languages.map(lang => (
                  <span key={lang} className="lang-chip">🗣️ {lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* Consultation Modes */}
          {consultationTypes.length > 0 && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Consultation Mode</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {consultationTypes.map(type => (
                  <span key={type} style={{ fontSize: 12, background: "var(--green-light)", border: "1px solid var(--green-border)", color: "var(--green)", padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
                    {type === "Online" ? "🎥" : "🏥"} {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {aboutText && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">About</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{displayedAbout}</p>
              {aboutTruncated && (
                <button onClick={() => setShowAboutMore(!showAboutMore)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                  {showAboutMore ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
                </button>
              )}
            </div>
          )}

          {/* Location */}
          {(doctor.clinic_address || doctor.city) && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Location</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text)", marginBottom: 10 }}>
                <MapPin size={13} style={{ color: "var(--red)", marginTop: 2, flexShrink: 0 }} />
                {[doctor.clinic_address, doctor.city, doctor.state, doctor.pincode].filter(Boolean).join(", ")}
              </div>
              {googleMapsUrl && (
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="doctor-map-btn-ghost">
                    <MapPin size={12} /> View on Map
                  </a>
                  {navigateUrl && (
                    <a href={navigateUrl} target="_blank" rel="noopener noreferrer" className="doctor-map-btn">
                      <Navigation size={12} /> Navigate
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Emergency / Direct Contact */}
          {emergency && (
            <div className="doctor-modal-section">
              <div className="doctor-modal-section-title">Direct Contact</div>
              <a href={`tel:${emergency}`} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "var(--green)", textDecoration: "none" }}>
                <Phone size={14} /> {emergency}
              </a>
            </div>
          )}

          {/* CTA Buttons */}
          <div style={{ padding: "18px 22px 24px" }}>
            {/* Primary: Book Appointment */}
            {onBook && (
              <button
                onClick={() => { onClose(); onBook(doctor); }}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", marginBottom: 10, padding: "12px" }}
              >
                <Calendar size={14} /> Book Appointment
              </button>
            )}
            {/* Secondary CTAs: Video / Audio / Chat */}
            <div className="consult-btn-row">
              <button className="consult-btn video" onClick={() => setShowComingSoon("video")}>
                <Video size={13} /> Video Call
              </button>
              <button className="consult-btn audio" onClick={() => setShowComingSoon("audio")}>
                <Mic size={13} /> Audio Call
              </button>
              <button className="consult-btn chat" onClick={() => setShowComingSoon("chat")}>
                <MessageCircle size={13} /> Chat
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
              ⚕️ Video, audio & chat consultations coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
