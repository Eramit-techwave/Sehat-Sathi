/**
 * HospitalDirectory.jsx — Location-Based Nearby Hospitals Directory with Map & Filters
 * Sehat-Sathi Healthcare Platform
 *
 * Requirements:
 * - Hospital Card: Name, Logo, Distance (km away), Google Maps navigation, Contact, Website
 * - Hospital Type: Government / Private / Clinic
 * - Bed Availability Status (Available Beds / Full)
 * - OPD Timing & Emergency 24/7 badge
 * - Facilities list: ICU, OT, Blood Bank, Ambulance, Pharmacy, Parking, Wheelchair, Canteen, Online Booking
 * - Insurance Accepted (Star Health, HDFC ERGO, Ayushman Bharat, etc.)
 * - Browser Geolocation API ("Detect Location" button)
 * - OpenStreetMap / Interactive visual map mode with pins
 * - Filter by Distance (<1km, <5km, <10km, <25km), Type, Specialty, Facilities, Rating
 * - Sort by Distance / Rating / Name
 * - Search bar
 */
import { useState, useEffect, useMemo } from "react";
import {
  Search, MapPin, Phone, Building2, Users, Navigation, X, Stethoscope,
  Compass, Loader2, Star, ShieldCheck, Bed, Clock, Globe, Filter, SlidersHorizontal, Map, List
} from "lucide-react";

import { apiGet } from "../../api/client";
import { getDistanceKm, MAJOR_CITIES_COORDS } from "../../utils/geoUtils";
import HospitalRoomBookingModal from "../../components/HospitalRoomBookingModal";
import PaymentInvoiceModal from "../../components/PaymentInvoiceModal";

// Comprehensive mock data for nearby hospitals
const NEARBY_HOSPITALS = [
  {
    id: "hosp-1",
    name: "Apollo Multispecialty Hospital",
    type: "Private",
    city: "Delhi",
    lat: 28.5355,
    lng: 77.2682,
    address: "Sarita Vihar, Delhi Mathura Road, New Delhi",
    phone: "+91 1860-500-1066",
    email: "emergency@apollo-delhi.com",
    website: "https://www.apollohospitals.com",
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics", "Emergency Care"],
    facilities: ["24/7 Emergency", "ICU / ICCU", "Operation Theatre", "Blood Bank", "Ambulance Service", "Pharmacy", "Parking", "Wheelchair Accessible", "Canteen / Cafeteria", "Online Appointment"],
    bed_status: "Available (18 ICU Beds)",
    opd_timing: "08:00 AM - 08:00 PM",
    rating: 4.8,
    reviews_count: 342,
    insurance_accepted: ["Star Health", "HDFC ERGO", "Ayushman Bharat", "ICICI Lombard", "SBI General"],
    total_doctors: 140,
    emergency_available: true
  },
  {
    id: "hosp-2",
    name: "AIIMS Apex Care Hospital",
    type: "Government",
    city: "Delhi",
    lat: 28.5672,
    lng: 77.2100,
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
    phone: "+91 011-26588500",
    email: "info@aiims.edu",
    website: "https://www.aiims.edu",
    specialties: ["General Medicine", "Cardiac Surgery", "Radiology", "Psychiatry", "Neurology", "Pulmonology"],
    facilities: ["24/7 Emergency", "ICU / ICCU", "Blood Bank", "Ambulance Service", "Pharmacy", "Wheelchair Accessible", "Canteen / Cafeteria"],
    bed_status: "Available (6 Beds)",
    opd_timing: "07:30 AM - 04:00 PM",
    rating: 4.9,
    reviews_count: 890,
    insurance_accepted: ["Ayushman Bharat", "CGHS", "EHS", "All Govt Schemes"],
    total_doctors: 250,
    emergency_available: true
  },
  {
    id: "hosp-3",
    name: "Max Super Speciality Hospital",
    type: "Private",
    city: "Gurugram",
    lat: 28.4595,
    lng: 77.0266,
    address: "Block B, Sushant Lok I, Sector 43, Gurugram",
    phone: "+91 0124-4141414",
    email: "contact@maxhealthcare.com",
    website: "https://www.maxhealthcare.in",
    specialties: ["Cardiology", "Oncology", "Transplant", "Neurosciences", "Orthopedics", "Gastroenterology"],
    facilities: ["24/7 Emergency", "ICU / ICCU", "Operation Theatre", "Blood Bank", "Parking", "Ambulance Service", "Pharmacy", "Online Appointment"],
    bed_status: "Full (Waitlist Active)",
    opd_timing: "09:00 AM - 07:00 PM",
    rating: 4.7,
    reviews_count: 215,
    insurance_accepted: ["Star Health", "Max Bupa", "HDFC ERGO", "Niva Bupa", "Care Health"],
    total_doctors: 95,
    emergency_available: true
  },
  {
    id: "hosp-4",
    name: "Fortis Escorts Heart Institute",
    type: "Private",
    city: "Delhi",
    lat: 28.5601,
    lng: 77.2750,
    address: "Okhla Road, Opp Holy Family Hospital, New Delhi",
    phone: "+91 011-47135000",
    email: "care@fortishealthcare.com",
    website: "https://www.fortishealthcare.com",
    specialties: ["Cardiac Surgery", "Cardiology", "Vascular Surgery", "Pediatric Cardiology"],
    facilities: ["24/7 Emergency", "ICU / ICCU", "Operation Theatre", "Ambulance Service", "Pharmacy", "Parking", "Wheelchair Accessible"],
    bed_status: "Available (12 Beds)",
    opd_timing: "08:30 AM - 06:30 PM",
    rating: 4.6,
    reviews_count: 180,
    insurance_accepted: ["Star Health", "ICICI Lombard", "Bajaj Allianz", "Aditya Birla Health"],
    total_doctors: 80,
    emergency_available: true
  },
  {
    id: "hosp-5",
    name: "Sehat-Sathi Community Health Clinic",
    type: "Clinic",
    city: "Noida",
    lat: 28.5355,
    lng: 77.3910,
    address: "Sector 62, Near Electronic City Metro, Noida",
    phone: "+91 0120-892410",
    email: "clinic@sehatsathi.com",
    website: "https://www.sehatsathi.com",
    specialties: ["General Physician", "Pediatrics", "Dermatology", "Gynecology"],
    facilities: ["Pharmacy", "Laboratory", "Parking", "Wheelchair Accessible", "Online Appointment"],
    bed_status: "OPD Consultation Only",
    opd_timing: "09:00 AM - 09:00 PM",
    rating: 4.9,
    reviews_count: 140,
    insurance_accepted: ["Ayushman Bharat", "Star Health", "Digit Insurance"],
    total_doctors: 25,
    emergency_available: false
  }
];

export default function HospitalDirectory({ onBack, onBookDoctor }) {
  const [hospitalsList, setHospitalsList] = useState(NEARBY_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All"); // "All" | "Government" | "Private" | "Clinic"
  const [distanceFilter, setDistanceFilter] = useState("All"); // "All" | "1" | "5" | "10" | "25"
  const [facilityFilter, setFacilityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("distance"); // "distance" | "rating" | "name"
  const [userCoords, setUserCoords] = useState(null);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [bookingRoomHospital, setBookingRoomHospital] = useState(null);
  const [roomInvoice, setRoomInvoice] = useState(null);

  // Auto-detect location on initial load
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = () => {
    setDetectingLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setDetectingLoc(false);
        },
        () => {
          // Fallback to Delhi coordinates
          setUserCoords(MAJOR_CITIES_COORDS["Delhi"] || { lat: 28.6139, lng: 77.2090 });
          setDetectingLoc(false);
        },
        { timeout: 8000 }
      );
    } else {
      setUserCoords(MAJOR_CITIES_COORDS["Delhi"]);
      setDetectingLoc(false);
    }
  };

  // Compute processed hospital list with distance, filters & sorting
  const processedHospitals = useMemo(() => {
    let result = hospitalsList.map(h => {
      let dist = null;
      if (userCoords && h.lat && h.lng) {
        dist = getDistanceKm(userCoords.lat, userCoords.lng, h.lat, h.lng);
      }
      return { ...h, distance_km: dist };
    });

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.specialties.some(s => s.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (typeFilter !== "All") {
      result = result.filter(h => h.type === typeFilter);
    }

    // Facility filter
    if (facilityFilter !== "All") {
      result = result.filter(h => h.facilities.includes(facilityFilter));
    }

    // Distance filter
    if (distanceFilter !== "All" && userCoords) {
      const maxKm = parseFloat(distanceFilter);
      result = result.filter(h => h.distance_km !== null && h.distance_km <= maxKm);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "distance") {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      }
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [hospitalsList, searchQuery, typeFilter, facilityFilter, distanceFilter, sortBy, userCoords]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 40px" }}>

      {/* Top Header & Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text, #0F172A)", margin: 0 }}>🏥 Nearby Hospitals & Healthcare Centers</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted, #64748B)", margin: "4px 0 0" }}>Find emergency services, bed availability, and specialized facilities near you</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={handleDetectLocation}
              disabled={detectingLoc}
              style={{
                background: userCoords ? "rgba(16,185,129,0.12)" : "rgba(37,99,235,0.1)",
                border: `1px solid ${userCoords ? "#10B981" : "#2563EB"}`,
                color: userCoords ? "#047857" : "#2563EB",
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}
            >
              {detectingLoc ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {userCoords ? "Location Detected ✓" : "Detect Location"}
            </button>

            {/* Toggle View Mode */}
            <div style={{ display: "flex", background: "#E2E8F0", borderRadius: 10, padding: 3 }}>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  background: viewMode === "list" ? "#FFF" : "transparent",
                  border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  color: viewMode === "list" ? "#2563EB" : "#64748B", cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
              >
                <List size={14} /> List
              </button>
              <button
                onClick={() => setViewMode("map")}
                style={{
                  background: viewMode === "map" ? "#FFF" : "transparent",
                  border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  color: viewMode === "map" ? "#2563EB" : "#64748B", cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
              >
                <Map size={14} /> Map View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: 12, color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search hospital name, specialty, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 13 }}
            />
          </div>

          {/* Type Filter */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 13, background: "#FFF" }}>
            <option value="All">All Types (Govt / Private / Clinic)</option>
            <option value="Private">Private Hospitals</option>
            <option value="Government">Government Hospitals</option>
            <option value="Clinic">Specialty Clinics</option>
          </select>

          {/* Distance Filter */}
          <select value={distanceFilter} onChange={e => setDistanceFilter(e.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 13, background: "#FFF" }}>
            <option value="All">Distance: Any</option>
            <option value="1">Within 1 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
          </select>

          {/* Sort By */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 13, background: "#FFF" }}>
            <option value="distance">Sort by Closest Proximity</option>
            <option value="rating">Sort by Rating (High to Low)</option>
            <option value="name">Sort by Hospital Name</option>
          </select>
        </div>
      </div>

      {/* MAP VIEW */}
      {viewMode === "map" && (
        <div style={{ height: 420, borderRadius: 20, overflow: "hidden", border: "2px solid #CBD5E1", marginBottom: 24, position: "relative", background: "#E2E8F0" }}>
          <iframe
            title="Hospital OpenStreetMap Location Pins"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=77.10,28.40,77.45,28.70&layer=mapnik`}
            style={{ border: 0 }}
          />
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(15,23,42,0.85)", color: "#FFF", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
            📍 Showing {processedHospitals.length} Nearby Hospitals Pins
          </div>
        </div>
      )}

      {/* HOSPITAL CARDS LIST */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
        {processedHospitals.map(h => (
          <div
            key={h.id}
            onClick={() => setSelectedHospital(h)}
            style={{
              background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 20,
              boxShadow: "0 4px 15px rgba(0,0,0,0.04)", cursor: "pointer", transition: "transform 0.2s, boxShadow 0.2s",
              display: "flex", flexDirection: "column", justifyContent: "space-between"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <div>
              {/* Card Top: Type & Distance */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: h.type === "Government" ? "rgba(37,99,235,0.1)" : "rgba(168,85,247,0.1)", color: h.type === "Government" ? "#2563EB" : "#9333EA" }}>
                  {h.type}
                </span>

                {h.distance_km !== null && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                    📍 {h.distance_km.toFixed(1)} km away
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{h.name}</h3>
              <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} /> {h.address}
              </p>

              {/* Bed Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: h.bed_status.includes("Available") ? "#047857" : "#DC2626", marginBottom: 12 }}>
                <Bed size={14} /> Bed Status: {h.bed_status}
              </div>

              {/* Specialties Pill Badges */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
                {h.specialties.slice(0, 3).map((spec, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, background: "#F1F5F9", color: "#475569", padding: "2px 8px", borderRadius: 6 }}>
                    {spec}
                  </span>
                ))}
                {h.specialties.length > 3 && <span style={{ fontSize: 10, color: "#94A3B8" }}>+{h.specialties.length - 3} more</span>}
              </div>
            </div>

            {/* Bottom Actions & Rating */}
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>
                ★ {h.rating} <span style={{ fontSize: 10, color: "#94A3B8" }}>({h.reviews_count} reviews)</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>View Details & Facilities →</span>
            </div>
          </div>
        ))}
      </div>

      {/* HOSPITAL DETAIL MODAL */}
      {selectedHospital && (
        <div className="modal-overlay" onClick={() => setSelectedHospital(null)} style={{ zIndex: 99999, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 650, background: "#FFF", borderRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>{selectedHospital.type}</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "6px 0 2px" }}>{selectedHospital.name}</h2>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>📍 {selectedHospital.address}</p>
              </div>
              <button onClick={() => setSelectedHospital(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* Quick Contact & Google Navigation Link */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <a href={`tel:${selectedHospital.phone}`} style={{ background: "#F1F5F9", color: "#0F172A", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={14} /> {selectedHospital.phone}
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.address)}`} target="_blank" rel="noreferrer" style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#FFF", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <Navigation size={14} /> Open Navigation in Google Maps ↗
              </a>
            </div>

            {/* Facilities Checkboxes List */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>Facilities & Infrastructure Available</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {selectedHospital.facilities.map((f, i) => (
                  <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} style={{ color: "#10B981" }} /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance Providers Accepted */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Insurances Accepted</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selectedHospital.insurance_accepted.map((ins, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#047857", padding: "4px 10px", borderRadius: 100 }}>
                    💳 {ins}
                  </span>
                ))}
              </div>
            </div>

            {/* Room Tariff & Booking CTA */}
            <div style={{
              background: "linear-gradient(135deg, #0F172A, #1E3A8A)", color: "#FFF",
              padding: 16, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Hospital Room & Bed Availability</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#FFF", marginTop: 2 }}>General Ward to VIP Suites (₹800 - ₹9,500/day)</div>
              </div>
              <button
                onClick={() => {
                  setBookingRoomHospital(selectedHospital);
                  setSelectedHospital(null);
                }}
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "#FFF",
                  border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)"
                }}
              >
                🛏️ Reserve Room & Bed Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSPITAL ROOM BOOKING MODAL */}
      {bookingRoomHospital && (
        <HospitalRoomBookingModal
          hospital={bookingRoomHospital}
          onClose={() => setBookingRoomHospital(null)}
          onBookingSuccess={(inv) => {
            setBookingRoomHospital(null);
            setRoomInvoice(inv);
          }}
        />
      )}

      {/* PAYMENT INVOICE RECEIPT MODAL */}
      {roomInvoice && (
        <PaymentInvoiceModal
          invoice={roomInvoice}
          onClose={() => setRoomInvoice(null)}
        />
      )}

    </div>
  );
}
