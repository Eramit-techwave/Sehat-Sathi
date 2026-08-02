/**
 * DoctorDirectory — Full scalable doctor directory with filters.
 * Merges real backend doctors with mock data for demo.
 */
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, SlidersHorizontal, X, MapPin, Compass, Navigation, Loader2 } from "lucide-react";
import DoctorCard from "../../components/DoctorCard";
import DS from "../../ui/design-system";
import T from "../../ui/tokens";
import { MOCK_DOCTORS, SPECIALIZATIONS, CONSULTATION_TYPES, EXPERIENCE_RANGES, AVAILABILITY_OPTIONS, RATING_OPTIONS, filterDoctors } from "../../data/doctors";
import { apiAsset, apiGet } from "../../api/client";
import { getDistanceKm, MAJOR_CITIES_COORDS } from "../../utils/geoUtils";

export default function DoctorDirectory({ onBack, onBook }) {
  const [backendDoctors, setBackendDoctors] = useState([]);
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState("All"); // "All" | "5" | "10" | "25"
  const [filters, setFilters] = useState({
    specialization: "All",
    consultationType: "All",
    experience: "All",
    rating: "All",
    availability: "All",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Auto-detect geolocation on mount if available
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDetectingLoc(false);
      },
      err => {
        console.warn("Location detection fallback to Delhi:", err);
        setUserCoords(MAJOR_CITIES_COORDS["Delhi"]);
        setDetectingLoc(false);
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    handleDetectLocation();
  }, []);

  // Load real doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await apiGet("/doctors");
        if (data) {
          const normalized = (data || []).map(d => ({
            id: d.id || d._id,
            name: d.name,
            qualification: d.qualifications || "MBBS",
            specialization: d.specialty || "General Physician",
            hospital: d.hospital_name || "Independent Practice",
            city: d.clinic_city || "India",
            experience_years: d.experience_years || 0,
            languages: d.languages || ["Hindi", "English"],
            consultation_fee: d.consultation_fee || 500,
            availability: d.online_status === "online" ? "Available Today" : "This Week",
            rating: d.rating || 4.5,
            review_count: d.review_count || 0,
            verified: true,
            consultation_types: ["Online", "Offline"],
            about: d.bio || "",
            next_available: "Soon",
            profile_photo: apiAsset(d.profile_photo_url),
            clinic_address: d.clinic_address,
            clinic_lat: d.clinic_lat || 28.6139,
            clinic_lng: d.clinic_lng || 77.2090,
            medical_reg_number: d.medical_reg_number,
            online_status: d.online_status,
          }));
          setBackendDoctors(normalized);
        }
      } catch {}
    };
    fetchDoctors();
  }, []);

  // Merge real + mock, deduplicate by name, compute distances
  const allDoctors = useMemo(() => {
    const realNames = new Set(backendDoctors.map(d => d.name));
    const mockFiltered = MOCK_DOCTORS.map((d, idx) => ({
      ...d,
      clinic_lat: 28.6139 + (idx * 0.02 - 0.05),
      clinic_lng: 77.2090 + (idx * 0.02 - 0.05),
    })).filter(d => !realNames.has(d.name));

    const combined = [...backendDoctors, ...mockFiltered];

    if (!userCoords) return combined;

    return combined.map(d => {
      const dist = getDistanceKm(userCoords.lat, userCoords.lng, d.clinic_lat, d.clinic_lng);
      return { ...d, distance_km: dist !== null ? dist : (Math.floor(Math.random() * 12) + 1.2) };
    }).sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
  }, [backendDoctors, userCoords]);

  const filtered = useMemo(() => {
    let result = filterDoctors(allDoctors, filters);
    if (distanceFilter !== "All") {
      const maxKm = Number(distanceFilter);
      result = result.filter(d => d.distance_km !== undefined && d.distance_km <= maxKm);
    }
    return result;
  }, [allDoctors, filters, distanceFilter]);

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== "search" && v !== "All") || distanceFilter !== "All";

  const clearFilters = () => {
    setFilters({
      specialization: "All", consultationType: "All", experience: "All",
      rating: "All", availability: "All", search: "",
    });
    setDistanceFilter("All");
  };

  const selectStyle = DS.select({ fontSize: 13, padding: "9px 12px" });

  return (
    <div style={{ animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
      {/* ── BACK ──────────────────────────────────────────────────── */}
      {onBack && (
        <button onClick={onBack} style={{ ...DS.btnGhost(), marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      )}

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <div style={DS.between({ marginBottom: 20, flexWrap: "wrap", gap: 12 })}>
        <div>
          <h2 style={DS.sectionTitle({ fontSize: 22 })}>Find Nearby Doctors</h2>
          <p style={DS.sectionSub()}>
            {filtered.length} verified doctor{filtered.length !== 1 ? "s" : ""} available near you
          </p>
        </div>

        {/* Location detector button */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={handleDetectLocation}
            disabled={detectingLoc}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: userCoords ? "rgba(16,185,129,0.12)" : "var(--primary-light)",
              border: `1px solid ${userCoords ? "rgba(16,185,129,0.3)" : "var(--primary-border)"}`,
              color: userCoords ? "#059669" : "var(--primary)",
              padding: "8px 14px", borderRadius: "var(--radius-full, 99px)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            {detectingLoc ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
            {userCoords ? "Location Detected ✅" : "Detect Location"}
          </button>

          <button onClick={() => setShowFilters(!showFilters)} style={{
            ...DS.btnGhost(),
            ...(hasActiveFilters ? { borderColor: T.primary, color: T.primary, background: T.primaryLight } : {}),
          }}>
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && <span style={{ ...DS.badge("blue"), padding: "1px 6px", fontSize: 10 }}>Active</span>}
          </button>
        </div>
      </div>

      {/* ── DISTANCE FILTER PILLS ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Distance:</span>
        {[
          { label: "All Doctors", value: "All" },
          { label: "< 5 km", value: "5" },
          { label: "< 10 km", value: "10" },
          { label: "< 25 km", value: "25" },
        ].map(pill => (
          <button
            key={pill.value}
            onClick={() => setDistanceFilter(pill.value)}
            style={{
              padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
              border: distanceFilter === pill.value ? "1px solid var(--primary)" : "1px solid var(--border)",
              background: distanceFilter === pill.value ? "var(--primary)" : "var(--surface)",
              color: distanceFilter === pill.value ? "#fff" : "var(--text-secondary)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* ── SEARCH BAR ────────────────────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
        <input
          type="text"
          placeholder="Search by name, specialization, or hospital..."
          value={filters.search}
          onChange={e => setFilter("search", e.target.value)}
          style={{ ...DS.input(), paddingLeft: 40, fontSize: 14 }}
        />
        {filters.search && (
          <button onClick={() => setFilter("search", "")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── DROPDOWN FILTER PANEL ─────────────────────────────────── */}
      {showFilters && (
        <div style={{ ...DS.card({ border: `1px solid ${T.primaryBorder}` }), marginBottom: 20, animation: "fadeUp 0.2s ease" }}>
          <div style={DS.between({ marginBottom: 16 })}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Filter Doctors</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ ...DS.btnDanger({ padding: "5px 10px", fontSize: 11 }) }}>
                <X size={10} /> Clear All
              </button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: "block", marginBottom: 6 }}>SPECIALIZATION</label>
              <select value={filters.specialization} onChange={e => setFilter("specialization", e.target.value)} style={selectStyle}>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: "block", marginBottom: 6 }}>CONSULTATION TYPE</label>
              <select value={filters.consultationType} onChange={e => setFilter("consultationType", e.target.value)} style={selectStyle}>
                {CONSULTATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: "block", marginBottom: 6 }}>EXPERIENCE</label>
              <select value={filters.experience} onChange={e => setFilter("experience", e.target.value)} style={selectStyle}>
                {EXPERIENCE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: "block", marginBottom: 6 }}>AVAILABILITY</label>
              <select value={filters.availability} onChange={e => setFilter("availability", e.target.value)} style={selectStyle}>
                {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: "block", marginBottom: 6 }}>MINIMUM RATING</label>
              <select value={filters.rating} onChange={e => setFilter("rating", e.target.value)} style={selectStyle}>
                {RATING_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── SPECIALIZATION QUICK PILLS ────────────────────────────── */}
      {!showFilters && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["All", "Cardiologist", "Pediatrician", "Dermatologist", "Neurologist", "General Physician", "Gynecologist", "Orthopedic Surgeon"].map(spec => (
            <button
              key={spec}
              onClick={() => setFilter("specialization", spec)}
              style={DS.tab(filters.specialization === spec, { padding: "6px 14px", fontSize: 12 })}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {/* ── DOCTOR GRID ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={DS.emptyState()}>
          <Search size={36} style={{ margin: "0 auto 12px", display: "block", color: T.textMuted }} />
          <p style={{ color: T.textMuted, fontSize: 13 }}>No doctors found matching your filters. Try adjusting the search criteria.</p>
          <button onClick={clearFilters} style={{ ...DS.btnGhost(), marginTop: 12 }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map(doc => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={onBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
