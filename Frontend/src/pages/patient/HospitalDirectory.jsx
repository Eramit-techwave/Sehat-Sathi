/**
 * HospitalDirectory — Patient-facing hospital browsing.
 * Shows all verified hospitals with search, filter, location & doctor listing.
 */
import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Phone, Building2, Users, Navigation, X, ChevronDown, ChevronUp, Stethoscope } from "lucide-react";

const API_BASE = "https://sehat-sathi-ce58.onrender.com";

// ── Demo hospitals to always show content ────────────────────────────
const DEMO_HOSPITALS = [
  { id: "demo-1", name: "Apollo Hospital", city: "Delhi", address: "Sarita Vihar, Delhi Mathura Road, New Delhi", phone: "1860-500-1066", departments: ["Cardiology","Neurology","Orthopedic","Oncology","Pediatrics"], facilities: ["ICU","Pharmacy","Laboratory","Blood Bank","Operation Theatre","Ambulance","Parking"], emergency_available: true, total_doctors: 120, rating: 4.7 },
  { id: "demo-2", name: "AIIMS Delhi", city: "Delhi", address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi", phone: "011-26588500", departments: ["General Medicine","Surgery","Radiology","Psychiatry","Dental"], facilities: ["ICU","Pharmacy","Laboratory","Blood Bank","Ambulance"], emergency_available: true, total_doctors: 200, rating: 4.9 },
  { id: "demo-3", name: "Max Super Speciality Hospital", city: "Gurugram", address: "Block B, Sushant Lok I, Sector 43, Gurugram", phone: "0124-4141414", departments: ["Cardiology","Oncology","Transplant","Neurosciences","Orthopedic"], facilities: ["ICU","Pharmacy","Laboratory","Blood Bank","Parking","Ambulance"], emergency_available: true, total_doctors: 85, rating: 4.6 },
  { id: "demo-4", name: "Fortis Hospital", city: "Mumbai", address: "Mulund Goregaon Link Road, Mulund West, Mumbai", phone: "022-6767-1000", departments: ["Cardiac Sciences","Neurosciences","Renal Sciences","Gastro Sciences"], facilities: ["ICU","Pharmacy","Laboratory","Parking"], emergency_available: false, total_doctors: 65, rating: 4.5 },
];

function HospitalCard({ hospital, onView }) {
  const deptCount = hospital.departments?.length || 0;
  const facilityIcons = {
    "ICU": "🏥", "Pharmacy": "💊", "Laboratory": "🔬", "Blood Bank": "🩸",
    "Operation Theatre": "⚕️", "Ambulance": "🚑", "Parking": "🅿️"
  };

  return (
    <div
      className="v2-section"
      style={{ cursor: "pointer", transition: "all 0.2s", padding: "20px" }}
      onClick={() => onView(hospital)}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.10)"; e.currentTarget.style.borderColor = "var(--primary-border)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            🏥
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, marginBottom: 4 }}>{hospital.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <MapPin size={11} /> {hospital.city || hospital.address?.split(",").slice(-2).join(",").trim()}
            </div>
          </div>
        </div>
        {hospital.emergency_available && (
          <span style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--red)", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
            🚨 24/7 Emergency
          </span>
        )}
      </div>

      {/* Departments */}
      {deptCount > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          {hospital.departments.slice(0, 3).map(dept => (
            <span key={dept} style={{ fontSize: 11, background: "var(--surface-alt)", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "3px 8px", borderRadius: 6 }}>{dept}</span>
          ))}
          {deptCount > 3 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{deptCount - 3} more</span>}
        </div>
      )}

      {/* Facilities quick icons */}
      {hospital.facilities?.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {hospital.facilities.slice(0, 5).map(f => (
            <span key={f} title={f} style={{ fontSize: 16 }}>{facilityIcons[f] || "✓"}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {hospital.total_doctors > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={11} /> {hospital.total_doctors} Doctors
            </span>
          )}
          {hospital.rating && (
            <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
              ★ {hospital.rating}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>View Details →</span>
      </div>
    </div>
  );
}

function HospitalDetailPanel({ hospital, onClose, onBookDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (activeTab !== "doctors" || hospital.id?.startsWith("demo")) return;
    setLoadingDocs(true);
    fetch(`${API_BASE}/hospitals/${hospital.id}/doctors`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setDoctors(data))
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDocs(false));
  }, [activeTab, hospital.id]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [hospital.name, hospital.address, hospital.city, "India"].filter(Boolean).join(", ")
  )}`;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "doctors", label: "Doctors" },
    { id: "facilities", label: "Facilities" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 680,
          background: "var(--surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)", overflow: "hidden",
          maxHeight: "90vh", display: "flex", flexDirection: "column",
          animation: "fadeScale 0.25s cubic-bezier(0.16,1,0.3,1) both"
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0F2040 0%,#1D4ED8 100%)", padding: "24px 28px 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "2px solid rgba(255,255,255,0.3)" }}>🏥</div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>{hospital.name}</h2>
                {hospital.city && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{hospital.city}</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} />
            </button>
          </div>

          {hospital.emergency_available && (
            <span style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)", color: "#FCA5A5", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
              🚨 24/7 Emergency Available
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "12px 20px", border: "none", background: "none", color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, cursor: "pointer", borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent", transition: "all 0.15s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {hospital.address && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Address</div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text)" }}>
                    <MapPin size={14} style={{ color: "var(--red)", marginTop: 2, flexShrink: 0 }} />
                    {hospital.address}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--primary-light)", border: "1px solid var(--primary-border)", color: "var(--primary)", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      <MapPin size={12} /> View on Map
                    </a>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      <Navigation size={12} /> Navigate
                    </a>
                  </div>
                </div>
              )}

              {hospital.phone && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Contact</div>
                  <a href={`tel:${hospital.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                    <Phone size={14} /> {hospital.phone}
                  </a>
                </div>
              )}

              {hospital.departments?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Departments ({hospital.departments.length})</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {hospital.departments.map(dept => (
                      <span key={dept} style={{ fontSize: 12, background: "var(--primary-light)", border: "1px solid var(--primary-border)", color: "var(--primary)", padding: "4px 10px", borderRadius: 8 }}>{dept}</span>
                    ))}
                  </div>
                </div>
              )}

              {hospital.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B" }}>{hospital.rating}</span>
                  <div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < Math.floor(hospital.rating) ? "#F59E0B" : "#E5E7EB", fontSize: 14 }}>★</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Hospital Rating</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "doctors" && (
            <div>
              {hospital.id?.startsWith("demo") ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <Stethoscope size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>Demo Hospital</p>
                  <p style={{ margin: 0, fontSize: 13 }}>Doctor listing is available for registered hospitals only.</p>
                </div>
              ) : loadingDocs ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ width: 28, height: 28, border: "3px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "auto" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 10 }}>Loading doctors…</p>
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <Stethoscope size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No doctors listed for this hospital yet.</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                    {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} affiliated with this hospital
                  </div>
                  <div className="hosp-doctor-grid">
                    {doctors.map(doc => {
                      const isAvailToday = doc.availability === "Available Today" || doc.is_online;
                      return (
                        <div key={doc.id} className="hosp-doctor-card">
                          {/* Top: Avatar + Name */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 12,
                              background: doc.profile_photo ? "transparent" : "var(--primary-light)",
                              border: "2px solid var(--border)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 20, flexShrink: 0, overflow: "hidden", position: "relative"
                            }}>
                              {doc.profile_photo
                                ? <img src={doc.profile_photo} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : "👨‍⚕️"
                              }
                              <div style={{
                                position: "absolute", bottom: 2, right: 2,
                                width: 8, height: 8, borderRadius: "50%",
                                background: isAvailToday ? "var(--green)" : "var(--text-muted)",
                                border: "1.5px solid var(--surface-alt)"
                              }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                Dr. {doc.name}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{doc.specialty || doc.specialization}</div>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {doc.experience_years && (
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                🏆 {doc.experience_years} yrs exp.
                              </span>
                            )}
                            {doc.consultation_fee && (
                              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                                ₹{doc.consultation_fee}
                              </span>
                            )}
                            {doc.rating && (
                              <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>
                                ★ {Number(doc.rating).toFixed(1)}
                              </span>
                            )}
                          </div>

                          {/* Availability */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: isAvailToday ? "var(--green)" : "var(--text-muted)", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: isAvailToday ? "var(--green)" : "var(--text-muted)", fontWeight: 600 }}>
                              {doc.availability || (isAvailToday ? "Available Today" : "Available This Week")}
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: "flex", gap: 8 }}>
                            {onBookDoctor && (
                              <button
                                onClick={() => { onClose(); onBookDoctor(doc); }}
                                className="btn-primary"
                                style={{ flex: 1, justifyContent: "center", padding: "8px 12px", fontSize: 12 }}
                              >
                                <Stethoscope size={12} /> Book
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}


          {activeTab === "facilities" && (
            <div>
              {hospital.facilities?.length > 0 ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    Available Facilities ({hospital.facilities.length})
                  </div>
                  <div className="hospital-facility-grid">
                    {hospital.facilities.map(facility => {
                      const facilityData = {
                        "ICU": { icon: "🏥", color: "var(--red)" },
                        "Pharmacy": { icon: "💊", color: "var(--green)" },
                        "Laboratory": { icon: "🔬", color: "var(--primary)" },
                        "Blood Bank": { icon: "🩸", color: "var(--red)" },
                        "Operation Theatre": { icon: "⚕️", color: "var(--amber)" },
                        "Ambulance": { icon: "🚑", color: "var(--red)" },
                        "Parking": { icon: "🅿️", color: "var(--text-muted)" },
                      };
                      const fd = facilityData[facility] || { icon: "✓", color: "var(--primary)" };
                      return (
                        <div key={facility} className="hospital-facility-chip" style={{ border: `1px solid ${fd.color}25` }}>
                          <span>{fd.icon}</span>
                          <span style={{ color: "var(--text)" }}>{facility}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bed Counts if available */}
                  {hospital.bed_counts && Object.keys(hospital.bed_counts).length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Bed Availability</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {Object.entries(hospital.bed_counts).map(([type, count]) => (
                          <div key={type} style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>{count}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {hospital.emergency_available && (
                    <div style={{ marginTop: 20, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", marginBottom: 8 }}>🚨 Emergency Services Available 24/7</div>
                      {hospital.emergency_phone && (
                        <a href={`tel:${hospital.emergency_phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--red)", textDecoration: "none", fontWeight: 600 }}>
                          <Phone size={13} /> {hospital.emergency_phone}
                        </a>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No facility information available.</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function HospitalDirectory({ onBack, onBookDoctor }) {
  const [backendHospitals, setBackendHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`${API_BASE}/hospitals/`);
        if (res.ok) {
          const data = await res.json();
          setBackendHospitals(data.map(h => ({
            id: h.id || h._id,
            name: h.name,
            city: h.city || h.address?.split(",").pop()?.trim() || "India",
            address: h.address || "",
            phone: h.phone || "",
            departments: h.departments || [],
            facilities: h.facilities || [],
            emergency_available: h.emergency_available || false,
            total_doctors: h.total_doctors || 0,
            rating: h.rating || 4.2,
          })));
        }
      } catch (e) { /* silently fallback to demo */ }
      finally { setLoading(false); }
    };
    fetchHospitals();
  }, []);

  const allHospitals = useMemo(() => {
    const realNames = new Set(backendHospitals.map(h => h.name.toLowerCase()));
    const mockFiltered = DEMO_HOSPITALS.filter(h => !realNames.has(h.name.toLowerCase()));
    return [...backendHospitals, ...mockFiltered];
  }, [backendHospitals]);

  const cities = useMemo(() => {
    const c = new Set(allHospitals.map(h => h.city).filter(Boolean));
    return ["All", ...Array.from(c)];
  }, [allHospitals]);

  const filtered = useMemo(() => allHospitals.filter(h => {
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.city?.toLowerCase().includes(search.toLowerCase()) || h.departments?.some(d => d.toLowerCase().includes(search.toLowerCase()));
    const matchCity = cityFilter === "All" || h.city === cityFilter;
    const matchEmerg = !emergencyOnly || h.emergency_available;
    return matchSearch && matchCity && matchEmerg;
  }), [allHospitals, search, cityFilter, emergencyOnly]);

  return (
    <div style={{ animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>

      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="section-title">🏥 Hospital Directory</h2>
          <p className="section-sub">{filtered.length} hospital{filtered.length !== 1 ? "s" : ""} available</p>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="search-bar-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} className="search-icon" />
          <input type="text" placeholder="Search hospitals, departments, cities…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="input-field"
          style={{ maxWidth: 150, width: "auto" }}
        >
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setEmergencyOnly(!emergencyOnly)}
          className={emergencyOnly ? "btn-primary" : "btn-ghost"}
          style={{ padding: "10px 16px", fontSize: 12, whiteSpace: "nowrap" }}
        >
          🚨 Emergency Only
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading hospitals…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Building2 size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
          <p>No hospitals match your search. Try different criteria.</p>
          <button onClick={() => { setSearch(""); setCityFilter("All"); setEmergencyOnly(false); }} className="btn-ghost" style={{ marginTop: 12 }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(h => <HospitalCard key={h.id} hospital={h} onView={setSelectedHospital} />)}
        </div>
      )}

      {/* Detail modal */}
      {selectedHospital && (
        <HospitalDetailPanel
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
          onBookDoctor={onBookDoctor}
        />
      )}
    </div>
  );
}
