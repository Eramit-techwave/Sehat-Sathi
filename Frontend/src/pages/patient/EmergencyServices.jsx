/**
 * EmergencyServices — Redesigned Phase 5 emergency platform.
 * Features: SOS button, categorized emergency services, quick contacts,
 * blood donor quick-search, nearby emergency hospitals.
 */
import { useState, useEffect } from "react";
import { Phone, MapPin, Droplet, AlertTriangle, Search, Shield } from "lucide-react";

import { API_BASE, apiGet } from "../../api/client";

const EMERGENCY_NUMBERS = [
  { service: "National Emergency", number: "112", icon: "🚨", color: "#EF4444", description: "Police · Fire · Ambulance" },
  { service: "Ambulance (CATS)",   number: "108", icon: "🚑", color: "#EF4444", description: "Free ambulance service" },
  { service: "Police Control",     number: "100", icon: "🚔", color: "#2563EB", description: "Law enforcement" },
  { service: "Fire Brigade",       number: "101", icon: "🔥", color: "#F97316", description: "Fire emergency" },
  { service: "Disaster Mgmt",     number: "1078", icon: "⚠️", color: "#F59E0B", description: "NDMA helpline" },
  { service: "Child Helpline",    number: "1098", icon: "👶", color: "#8B5CF6", description: "Child safety 24/7" },
  { service: "Women Helpline",    number: "1091", icon: "🛡️", color: "#EC4899", description: "Women in distress" },
  { service: "Senior Citizen",    number: "14567", icon: "🧓", color: "#6366F1", description: "Elderly emergency" },
];

const EMERGENCY_CATEGORIES = [
  { id: "ambulance",  icon: "🚑", title: "Ambulance",    desc: "Call 108 free",     color: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   tel: "108" },
  { id: "icu",        icon: "❤️‍🔥", title: "ICU/Critical", desc: "Hospital beds",   color: "#DC2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.2)",   tel: "112" },
  { id: "trauma",     icon: "🩹", title: "Trauma",        desc: "Injury & fracture", color: "#F97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)",  tel: "108" },
  { id: "blood",      icon: "🩸", title: "Blood Bank",    desc: "Emergency supply",  color: "#BE123C", bg: "rgba(190,18,60,0.08)",   border: "rgba(190,18,60,0.2)",   tel: "1910" },
  { id: "poison",     icon: "☠️", title: "Poison Control",desc: "Toxicology help",   color: "#7C3AED", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)",  tel: "1800116117" },
  { id: "mental",     icon: "🧠", title: "Mental Health", desc: "Crisis support",    color: "#0891B2", bg: "rgba(8,145,178,0.08)",   border: "rgba(8,145,178,0.2)",   tel: "iCall: 9152987821" },
];

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EmergencyServices({ onBack }) {
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [bgFilter, setBgFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("");
  const [searchDonors, setSearchDonors] = useState(false);
  const [donorLoading, setDonorLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const token = localStorage.getItem("sehat_sathi_token");

  useEffect(() => {
    apiGet("/hospitals/")
      .then(data => setNearbyHospitals(
        data.filter(h => h.emergency_available).slice(0, 6).map(h => ({
          id: h.id || h._id,
          name: h.name,
          address: h.address || h.city || "India",
          phone: h.phone,
          city: h.city,
        }))
      ))
      .catch(() => {});
  }, []);

  const handleDonorSearch = async () => {
    setDonorLoading(true);
    try {
      const params = new URLSearchParams();
      if (bgFilter !== "All") params.append("blood_group", bgFilter);
      if (cityFilter) params.append("city", cityFilter);
      const res = await fetch(`${API_BASE}/donors/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDonors(Array.isArray(data) ? data : []);
      setSearchDonors(true);
    } catch { setDonors([]); setSearchDonors(true); }
    setDonorLoading(false);
  };

  const handleSOS = () => {
    setSosActive(true);
    window.location.href = "tel:112";
    setTimeout(() => setSosActive(false), 4000);
  };

  return (
    <div style={{ animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
      {onBack && <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>}

      {/* ── Hero SOS Banner ──────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)",
        borderRadius: "var(--radius-xl)",
        padding: "36px 32px",
        marginBottom: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow orbs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(239,68,68,0.18)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(239,68,68,0.10)", pointerEvents: "none" }} />

        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px", position: "relative" }}>
          🚨 Emergency Services
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "0 0 32px", maxWidth: 380, position: "relative" }}>
          Immediate access to emergency contacts, blood donors, ambulance, and nearby hospitals
        </p>

        {/* SOS Button with double pulse rings */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.3)", animation: "sos-ring 2.2s ease-out infinite" }} />
          <div style={{ position: "absolute", width: 168, height: 168, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.2)", animation: "sos-ring 2.2s 0.4s ease-out infinite" }} />
          <button
            className="sos-btn sos-pulse-ring"
            onClick={handleSOS}
            aria-label="SOS Emergency call 112"
            style={{ position: "relative", zIndex: 1 }}
          >
            <AlertTriangle size={34} />
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.1em" }}>SOS</span>
            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>Tap to call 112</span>
          </button>
        </div>

        {sosActive && (
          <p style={{ color: "#FCA5A5", fontSize: 13, fontWeight: 600, marginTop: 24, position: "relative" }}>
            📞 Connecting to Emergency Services (112)…
          </p>
        )}
      </div>

      {/* ── Emergency Category Grid ───────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
          Emergency Categories
        </h3>
        <div className="emergency-grid">
          {EMERGENCY_CATEGORIES.map(cat => (
            <a
              key={cat.id}
              href={`tel:${cat.tel}`}
              className="emergency-category-card"
              style={{ textDecoration: "none", borderColor: cat.border }}
              onMouseEnter={e => { e.currentTarget.style.background = cat.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; }}
            >
              <div className="ec-icon" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                {cat.icon}
              </div>
              <h4 style={{ color: cat.color }}>{cat.title}</h4>
              <p>{cat.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* ── Emergency Numbers Quick Dial ──────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
          Quick Dial Directory
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
          {EMERGENCY_NUMBERS.map(({ service, number, icon, color, description }) => (
            <a
              key={service}
              href={`tel:${number}`}
              className="emergency-contact-card"
              style={{ textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{service}</div>
                  <div style={{ fontSize: 19, fontWeight: 900, color, lineHeight: 1.1 }}>{number}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{description}</div>
                </div>
              </div>
              <a
                href={`tel:${number}`}
                className="ec-call-btn"
                style={{ background: color, textDecoration: "none" }}
                onClick={e => e.stopPropagation()}
              >
                <Phone size={11} /> Call
              </a>
            </a>
          ))}
        </div>
      </div>

      {/* ── Blood Donor Quick Search ──────────────────────── */}
      <div className="v2-section" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Droplet size={18} style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>Emergency Blood Search</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Find registered donors by blood group and city</p>
          </div>
        </div>

        <div className="pill-strip" style={{ marginBottom: 12 }}>
          {BLOOD_GROUPS.map(bg => (
            <button key={bg} className={`pill${bgFilter === bg ? " active" : ""}`} onClick={() => setBgFilter(bg)} style={{ minWidth: 44, textAlign: "center" }}>
              {bg}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div className="search-bar-wrap" style={{ flex: 1 }}>
            <MapPin size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Enter city (e.g. Delhi, Mumbai)…"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleDonorSearch()}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleDonorSearch}
            disabled={donorLoading}
            style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }}
          >
            {donorLoading ? "…" : <><Search size={14} /> Search</>}
          </button>
        </div>

        {searchDonors && (
          donors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", background: "var(--surface-alt)", borderRadius: "var(--radius-md)" }}>
              <Droplet size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No donors found. Try a different blood group or city.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {donors.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface-alt)", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.city || "—"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#EF4444" }}>{d.bloodGroup}</span>
                    <a href={`tel:${d.phone}`} className="btn-primary" style={{ padding: "7px 14px", fontSize: 12, textDecoration: "none", background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "none" }}>
                      <Phone size={12} /> Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Nearby Emergency Hospitals ────────────────────── */}
      {nearbyHospitals.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            Nearby Emergency Hospitals
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nearbyHospitals.map(h => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid #EF4444", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} />{h.address}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {h.phone && (
                    <a href={`tel:${h.phone}`} className="btn-primary" style={{ padding: "6px 12px", fontSize: 11, textDecoration: "none" }}>
                      <Phone size={11} /> Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((h.name || "") + " " + (h.address || "") + " hospital")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 11, textDecoration: "none" }}
                  >
                    <MapPin size={11} /> Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Safety Tips ───────────────────────────────────── */}
      <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "var(--radius-lg)", padding: "18px 20px", marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Shield size={14} /> Quick Safety Tips
        </div>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {["Stay calm and clearly state your location when calling 112.", "Do not move a severely injured person unless in immediate danger.", "Keep a list of your doctor's phone number and blood group accessible.", "Share your live location with emergency contacts when possible."].map((tip, i) => (
            <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
