import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2, Clock, Users, Calendar, Loader2, LogOut,
  Edit2, Save, X, Activity, AlertCircle, Building2, Stethoscope,
  IndianRupee, Plus, Trash2, Star, Wifi, WifiOff, MapPin, ShieldCheck
} from "lucide-react";
// V2 Module Imports
import PrescriptionPad from "./v2/PrescriptionPad";
import FollowUpManager from "./v2/FollowUpManager";
import FloatingNotification from "../components/FloatingNotification";
import { inputStyle } from "../ui/theme";
import Button from "../components/Button";


const API_BASE = "https://sehat-sathi-ce58.onrender.com";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM"];

// inputStyle imported from shared theme

const PRACTICE_TYPE_LABELS = {
  independent: { label: "Independent Practice", icon: "🏠", color: "#a855f7", desc: "Private clinic / own practice" },
  hospital_based: { label: "Hospital-Based", icon: "🏥", color: "#3b82f6", desc: "Works at one hospital" },
  multi_hospital: { label: "Multi-Hospital", icon: "🏨", color: "#f59e0b", desc: "Works at multiple hospitals" }
};

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("sehat_sathi_token");
  const authHeaders = { "Authorization": `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState("overview");
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  // ── STATS ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total_patients: 0, pending_count: 0, today_count: 0, upcoming_count: 0, total_appointments: 0 });

  // ── APPOINTMENTS ───────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [aptsLoading, setAptsLoading] = useState(false);

  // ── AVAILABILITY ───────────────────────────────────────────────
  const [availability, setAvailability] = useState({});
  const [savingAvailability, setSavingAvailability] = useState(false);

  // ── PATIENTS ───────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // ── PROFILE ────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    specialty: "", qualifications: "", experience_years: 0, bio: "",
    consultation_fee: "", practice_type: "independent",
    medical_reg_number: "",
    // Location fields (Phase 3 addition)
    clinic_address: "", clinic_city: "", clinic_state: "", clinic_pincode: "",
    languages: "", gender: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [savingOnlineStatus, setSavingOnlineStatus] = useState(false);

  // ── HOSPITAL ASSOCIATIONS ──────────────────────────────────────
  const [associations, setAssociations] = useState([]);
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [savingAssociations, setSavingAssociations] = useState(false);
  const [newAssocHospitalId, setNewAssocHospitalId] = useState("");
  const [newAssocRole, setNewAssocRole] = useState("Consultant");

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  useEffect(() => { loadStats(); loadAppointments(); loadAvailability(); loadProfile(); }, []);
  useEffect(() => { if (activeTab === "patients") loadPatients(); }, [activeTab]);
  useEffect(() => { if (activeTab === "hospitals") loadHospitals(); }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors/${user.id}/stats`, { headers: authHeaders });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadAppointments = async () => {
    setAptsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/my`, { headers: authHeaders });
      if (res.ok) setAppointments(await res.json());
    } catch (e) { console.error(e); }
    finally { setAptsLoading(false); }
  };

  const loadAvailability = async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors/availability`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.availability || {});
      }
    } catch (e) { console.error(e); }
  };

  const loadPatients = async () => {
    setPatientsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/doctors/${user.id}/patients`, { headers: authHeaders });
      if (res.ok) setPatients(await res.json());
    } catch (e) { console.error(e); }
    finally { setPatientsLoading(false); }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors/me`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          specialty: data.specialty || "",
          qualifications: data.qualifications || "",
          experience_years: data.experience_years || 0,
          bio: data.bio || "",
          consultation_fee: data.consultation_fee || "",
          practice_type: data.practice_type || "independent",
          medical_reg_number: data.medical_reg_number || "",
          // Location fields
          clinic_address: data.clinic_address || "",
          clinic_city: data.clinic_city || "",
          clinic_state: data.clinic_state || "",
          clinic_pincode: data.clinic_pincode || "",
          // GPS fields
          lat: data.lat || "",
          lng: data.lng || "",
          languages: Array.isArray(data.languages) ? data.languages.join(", ") : (data.languages || ""),
          gender: data.gender || "",
        });
        setAssociations(data.hospital_associations || []);
        setIsOnline(data.is_online || false);
      }
    } catch (e) { console.error(e); }
  };

  const toggleOnlineStatus = async () => {
    setSavingOnlineStatus(true);
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await fetch(`${API_BASE}/doctors/status`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ is_online: newStatus })
      });
      showNotif(newStatus ? "You are now Online — patients can see you!" : "You are now Offline.", newStatus ? "success" : "info");
    } catch (e) { setIsOnline(!newStatus); showNotif("Status update failed.", "error"); }
    setSavingOnlineStatus(false);
  };

  const loadHospitals = async () => {
    try {
      const res = await fetch(`${API_BASE}/hospitals/`);
      if (res.ok) setAvailableHospitals(await res.json());
    } catch (e) { console.error(e); }
  };

  const toggleSlot = (day, slot) => {
    const daySlots = availability[day] || [];
    const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
    setAvailability({ ...availability, [day]: updated });
  };

  const saveAvailability = async () => {
    setSavingAvailability(true);
    try {
      const res = await fetch(`${API_BASE}/doctors/availability`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ availability })
      });
      if (!res.ok) throw new Error("Save failed");
      showNotif("Availability saved successfully!");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingAvailability(false);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/doctors/profile`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          consultation_fee: profile.consultation_fee ? parseInt(profile.consultation_fee) : null,
          // Languages: convert comma-separated string to array
          languages: profile.languages
            ? profile.languages.split(",").map(l => l.trim()).filter(Boolean)
            : [],
        })
      });
      if (!res.ok) throw new Error("Save failed");
      setIsEditing(false);
      showNotif("Profile updated successfully!");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingProfile(false);
  };

  const updateAptStatus = async (aptId, status) => {
    try {
      const res = await fetch(`${API_BASE}/appointments/${aptId}/status?status=${status}`, {
        method: "PUT", headers: authHeaders
      });
      if (!res.ok) throw new Error("Update failed");
      showNotif(`Appointment ${status.toLowerCase()}!`);
      loadAppointments(); loadStats();
    } catch (e) { showNotif(e.message, "error"); }
  };

  // ── HOSPITAL ASSOCIATION MANAGEMENT ───────────────────────────

  const addAssociation = () => {
    if (!newAssocHospitalId) return showNotif("Please select a hospital first.", "error");
    if (associations.find(a => a.hospital_id === newAssocHospitalId)) {
      return showNotif("This hospital is already added.", "error");
    }
    const hosp = availableHospitals.find(h => h.id === newAssocHospitalId);
    setAssociations(prev => [
      ...prev,
      {
        hospital_id: newAssocHospitalId,
        hospital_name: hosp?.name || "Hospital",
        role: newAssocRole,
        is_primary: prev.length === 0  // First one is primary by default
      }
    ]);
    setNewAssocHospitalId("");
    setNewAssocRole("Consultant");
  };

  const removeAssociation = (hospitalId) => {
    setAssociations(prev => {
      const updated = prev.filter(a => a.hospital_id !== hospitalId);
      // If removed was primary and there's another, make first primary
      if (prev.find(a => a.hospital_id === hospitalId)?.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimary = (hospitalId) => {
    setAssociations(prev => prev.map(a => ({ ...a, is_primary: a.hospital_id === hospitalId })));
  };

  const saveAssociations = async () => {
    setSavingAssociations(true);
    try {
      const res = await fetch(`${API_BASE}/doctors/hospital-associations`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ associations })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Save failed");
      showNotif(`Hospital affiliations saved. Practice type: ${data.practice_type}`);
      setProfile(prev => ({ ...prev, practice_type: data.practice_type }));
    } catch (e) { showNotif(e.message, "error"); }
    setSavingAssociations(false);
  };

  const setIndependent = async () => {
    setSavingAssociations(true);
    try {
      const res = await fetch(`${API_BASE}/doctors/hospital-associations`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ associations: [] })
      });
      if (!res.ok) throw new Error("Save failed");
      setAssociations([]);
      setProfile(prev => ({ ...prev, practice_type: "independent" }));
      showNotif("Set as Independent Practice.");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingAssociations(false);
  };

  // ── DERIVED STATE ──────────────────────────────────────────────
  const TABS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "availability", label: "Availability", icon: "🗓️" },
    { id: "hospitals", label: "My Hospitals", icon: "🏥" },
    { id: "patients", label: "Patients", icon: "👥" },
    { id: "profile", label: "Profile", icon: "👨‍⚕️" },
    // ── V2 TABS ──────────────────────────────────────────────────
    { id: "prescriptions", label: "Prescription Pad", icon: "💊" },
    { id: "followups", label: "Follow-ups", icon: "🔔" },
  ];


  const pendingApts = appointments.filter(a => a.status === "Pending");
  const todayDate = new Date().toISOString().split("T")[0];
  const todayApts = appointments.filter(a => a.date === todayDate && a.status !== "Cancelled");
  const practiceInfo = PRACTICE_TYPE_LABELS[profile.practice_type] || PRACTICE_TYPE_LABELS.independent;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 4%", position: "relative" }}>

      <FloatingNotification show={notification.show} type={notification.type} text={notification.text} />

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28, textAlign: "left" }}>
        <div>
          <h2 className="serif" style={{ fontSize: "30px", color: "#1E293B", margin: 0 }}>🩺 Doctor Portal</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <p style={{ color: "#64748B", fontSize: "14px", margin: 0 }}>
              Welcome, <strong style={{ color: "#1A73E8" }}>Dr. {user?.name}</strong>
              {profile.specialty && <span style={{ color: "#94A3B8" }}> • {profile.specialty}</span>}
            </p>
            {/* Practice type badge */}
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
              background: `${practiceInfo.color}15`, border: `1px solid ${practiceInfo.color}30`,
              color: practiceInfo.color, borderRadius: 6, padding: "2px 8px"
            }}>
              {practiceInfo.icon} {practiceInfo.label}
            </span>
            {profile.consultation_fee && (
              <span style={{ fontSize: 10, color: "#00A651", background: "rgba(0,166,81,0.08)", border: "1px solid rgba(0,166,81,0.2)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>
                ₹{profile.consultation_fee} / visit
              </span>
            )}
          </div>
        </div>
        <Button variant="danger" onClick={logout}><LogOut size={14} /> Logout</Button>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 12, padding: 5, overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? "#FFFFFF" : "transparent",
            border: activeTab === tab.id ? "1px solid #E2E8F0" : "1px solid transparent",
            color: activeTab === tab.id ? "#1A73E8" : "#64748B",
            padding: "9px 14px", borderRadius: 8, fontSize: "13px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
            boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            fontFamily: "inherit"
          }}>
            {tab.icon} {tab.label}
            {tab.id === "appointments" && pendingApts.length > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{pendingApts.length}</span>
            )}
            {tab.id === "hospitals" && associations.length > 0 && (
              <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{associations.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="fade-up">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Total Patients",       value: stats.total_patients,      color: "#2563EB", bg: "rgba(37,99,235,0.08)",   icon: "👥" },
              { label: "Pending Approval",      value: stats.pending_count,       color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  icon: "⏳" },
              { label: "Today's Appointments",  value: stats.today_count,         color: "#10B981", bg: "rgba(16,185,129,0.08)",  icon: "📅" },
              { label: "Upcoming",              value: stats.upcoming_count,      color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",  icon: "🔮" },
              { label: "Total Appointments",    value: stats.total_appointments,  color: "#0EA5E9", bg: "rgba(14,165,233,0.08)",  icon: "📊" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{stat.icon}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A" }}>{stat.value ?? "—"}</div>
              </div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div className="v2-section" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h4 style={{ color: "#0F172A", fontSize: 15, fontWeight: 700, margin: 0 }}>Today's Schedule</h4>
              <span className="badge badge-blue">{todayApts.length} appointments</span>
            </div>
            {todayApts.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: 13, padding: "12px 0" }}>No appointments scheduled for today.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {todayApts.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(apt => {
                  const sc = apt.status === "Confirmed" ? "#10B981" : apt.status === "Pending" ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={apt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div>
                        <span style={{ color: "#0F172A", fontWeight: 600, fontSize: 13 }}>{apt.patient_name || "Patient"}</span>
                        <span style={{ color: "#94A3B8", fontSize: 12, marginLeft: 10 }}>{apt.time_slot}</span>
                      </div>
                      <span style={{ color: sc, background: sc + "14", border: `1px solid ${sc}30`, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>{apt.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hospital Affiliations Quick View */}
          {associations.length > 0 && (
            <div className="v2-section">
              <h4 style={{ color: "#0F172A", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🏥 Hospital Affiliations</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {associations.map((assoc, i) => (
                  <div key={i} style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)", borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={14} style={{ color: "#2563EB" }} />
                    <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 600 }}>{assoc.hospital_name}</span>
                    <span style={{ color: "#64748B", fontSize: 11 }}>{assoc.role}</span>
                    {assoc.is_primary && <span className="badge badge-green" style={{ fontSize: 9, padding: "1px 6px" }}>PRIMARY</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS ─────────────────────────────────────────── */}
      {activeTab === "appointments" && (
        <div className="fade-up">
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            {pendingApts.length > 0 && <span className="badge badge-amber">{pendingApts.length} pending approval</span>}
            <span style={{ fontSize: 13, color: "#94A3B8" }}>{appointments.length} total appointments</span>
          </div>

          {aptsLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "#2563EB" }} />
            </div>
          ) : appointments.length === 0 ? (
            <div className="v2-section" style={{ textAlign: "center", padding: "56px 20px" }}>
              <Calendar size={40} style={{ margin: "0 auto 14px", display: "block", color: "#CBD5E1" }} />
              <p style={{ color: "#64748B", fontSize: 14 }}>No appointments yet. Patients can book once you configure your availability.</p>
            </div>
          ) : (
            <div className="v2-section" style={{ padding: 0, overflow: "hidden" }}>
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {[...appointments].sort((a, b) => new Date(b.date) - new Date(a.date)).map(apt => {
                    const sc = apt.status === "Confirmed" ? "#10B981" : apt.status === "Pending" ? "#F59E0B" : apt.status === "Cancelled" ? "#EF4444" : "#94A3B8";
                    return (
                      <tr key={apt.id}>
                        <td style={{ fontWeight: 600, color: "#0F172A" }}>{apt.patient_name || "Patient"}</td>
                        <td style={{ color: "#64748B" }}>{apt.date}</td>
                        <td style={{ color: "#2563EB", fontFamily: "monospace", fontWeight: 600 }}>{apt.time_slot}</td>
                        <td>
                          <span style={{ color: sc, background: sc + "14", border: `1px solid ${sc}30`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{apt.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {apt.status === "Pending" && (
                              <>
                                <button onClick={() => updateAptStatus(apt.id, "Confirmed")} style={{ padding: "4px 10px", fontSize: 11, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>✓ Confirm</button>
                                <button onClick={() => updateAptStatus(apt.id, "Cancelled")} style={{ padding: "4px 10px", fontSize: 11, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>✕ Reject</button>
                              </>
                            )}
                            {apt.status === "Confirmed" && (
                              <button onClick={() => updateAptStatus(apt.id, "Completed")} style={{ padding: "4px 10px", fontSize: 11, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#7C3AED", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Complete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── AVAILABILITY ──────────────────────────────────────────── */}
      {activeTab === "availability" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h4 style={{ color: "#0F172A", fontSize: 17, fontWeight: 700, margin: 0 }}>Configure Weekly Availability</h4>
              <p style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>Toggle slots to set when you're available. Patients can only book open slots.</p>
            </div>
            <button onClick={saveAvailability} disabled={savingAvailability} className="btn-primary" style={{ background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 3px 12px rgba(16,185,129,0.22)" }}>
              {savingAvailability ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Availability
            </button>
          </div>

          {DAYS.map(day => (
            <div key={day} className="v2-section" style={{ marginBottom: 10, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h5 style={{ color: "#0F172A", fontSize: 13, fontWeight: 700, margin: 0 }}>{day}</h5>
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{(availability[day] || []).length} slots open</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALL_SLOTS.map(slot => {
                  const isOpen = (availability[day] || []).includes(slot);
                  return (
                    <button key={slot} onClick={() => toggleSlot(day, slot)} style={{
                      padding: "5px 11px", fontSize: 12,
                      background: isOpen ? "rgba(16,185,129,0.10)" : "#F8FAFC",
                      border: `1px solid ${isOpen ? "rgba(16,185,129,0.30)" : "#E2E8F0"}`,
                      color: isOpen ? "#059669" : "#64748B",
                      borderRadius: 7, cursor: "pointer",
                      fontWeight: isOpen ? 700 : 500, transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HOSPITAL AFFILIATIONS ─────────────────────────────────── */}
      {activeTab === "hospitals" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h4 style={{ color: "#0F172A", fontSize: 17, fontWeight: 700, margin: 0 }}>Hospital Affiliations</h4>
              <p style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
                Manage which hospitals you work at. Patients see this information when booking.
              </p>
            </div>
            {/* Practice type indicator */}
            <div style={{ background: `${practiceInfo.color}10`, border: `1px solid ${practiceInfo.color}25`, borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{practiceInfo.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: practiceInfo.color }}>{practiceInfo.label}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{practiceInfo.desc}</div>
              </div>
            </div>
          </div>

          {/* Current Associations */}
          {associations.length === 0 ? (
            <div className="v2-section" style={{ textAlign: "center", padding: "28px", marginBottom: 16, background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏠</div>
              <p style={{ color: "#64748B", fontSize: 13 }}>You are currently set as an <strong style={{ color: "#8B5CF6" }}>Independent Practitioner</strong>.<br />Add hospitals below if you work at one or more facilities.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {associations.map((assoc, i) => (
                <div key={i} className="v2-section" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderColor: assoc.is_primary ? "rgba(37,99,235,0.3)" : "#E2E8F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(37,99,235,0.18)" }}>
                      <Building2 size={18} style={{ color: "#2563EB" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{assoc.hospital_name}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{assoc.role}</div>
                    </div>
                    {assoc.is_primary && <span className="badge badge-green">⭐ Primary</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!assoc.is_primary && (
                      <button onClick={() => setPrimary(assoc.hospital_id)} style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)", color: "#059669", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                        <Star size={11} /> Set Primary
                      </button>
                    )}
                    <button onClick={() => removeAssociation(assoc.hospital_id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#EF4444", padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Hospital Form */}
          <div className="v2-section" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Add Hospital Affiliation</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 200px auto", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={newAssocHospitalId}
                onChange={e => setNewAssocHospitalId(e.target.value)}
                style={{ ...inputStyle, color: newAssocHospitalId ? "#fff" : "#64748b" }}
              >
                <option value="">Select a verified hospital...</option>
                {availableHospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} {h.address ? `— ${h.address}` : ""}</option>
                ))}
              </select>
              <select value={newAssocRole} onChange={e => setNewAssocRole(e.target.value)} style={inputStyle}>
                {["Consultant", "Resident", "Senior Consultant", "HOD", "Visiting Doctor", "Surgeon"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button onClick={addAssociation} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <Plus size={14} /> Add
              </button>
            </div>
            {availableHospitals.length === 0 && (
              <p style={{ color: "#475569", fontSize: 12, marginTop: 8 }}>No verified hospitals available yet. They appear here once approved by admin.</p>
            )}
          </div>

          {/* Save + Independent buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={saveAssociations} disabled={savingAssociations} className="btn-primary" style={{ background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 3px 12px rgba(16,185,129,0.22)" }}>
              {savingAssociations ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Affiliations
            </button>
            <button onClick={setIndependent} disabled={savingAssociations || associations.length === 0} style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#7C3AED", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: associations.length === 0 ? 0.5 : 1, fontFamily: "inherit" }}>
              Set as Independent Practice
            </button>
          </div>
        </div>
      )}

      {/* ── PATIENTS ──────────────────────────────────────────────── */}
      {activeTab === "patients" && (
        <div className="fade-up">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h4 style={{ color: "#0F172A", fontSize: 17, fontWeight: 700, margin: 0 }}>Your Patients</h4>
            <span className="badge badge-blue">{patients.length} patients</span>
          </div>
          {patientsLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "#2563EB" }} />
            </div>
          ) : patients.length === 0 ? (
            <div className="v2-section" style={{ textAlign: "center", padding: "56px 20px" }}>
              <Users size={40} style={{ margin: "0 auto 14px", display: "block", color: "#CBD5E1" }} />
              <p style={{ color: "#64748B", fontSize: 14 }}>No patients yet. Patients who book appointments with you will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {patients.map(patient => (
                <div key={patient.id} className="v2-section" style={{ padding: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{patient.name}</div>
                      <div style={{ fontSize: 12, color: "#2563EB" }}>{patient.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                    <span>📊 {patient.appointment_count} visits</span>
                    <span>📅 Last: {patient.last_visit || "—"}</span>
                  </div>
                  {patient.phone && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>📞 {patient.phone}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE ───────────────────────────────────────────────── */}
      {activeTab === "profile" && (() => {
        // Profile completeness calculation
        const completenessFields = [
          profile.specialty, profile.qualifications, profile.experience_years,
          profile.consultation_fee, profile.medical_reg_number, profile.bio,
          profile.clinic_address, profile.clinic_city, profile.languages, profile.gender
        ];
        const filled = completenessFields.filter(v => v && String(v).trim() !== "" && String(v) !== "0").length;
        const pct = Math.round((filled / completenessFields.length) * 100);
        const pctColor = pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)";

        return (
        <div className="fade-up">

          {/* Online / Offline Toggle */}
          <div className="v2-section" style={{ marginBottom: 16, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: isOnline ? "var(--green-light)" : "var(--surface-alt)", border: `1px solid ${isOnline ? "var(--green-border)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isOnline ? <Wifi size={18} style={{ color: "var(--green)" }} /> : <WifiOff size={18} style={{ color: "var(--text-muted)" }} />}
                  </div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: isOnline ? "var(--green)" : "var(--text-muted)", border: "2px solid var(--surface)", boxShadow: isOnline ? "0 0 6px rgba(16,185,129,0.7)" : "none" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {isOnline ? "You are Online" : "You are Offline"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {isOnline ? "Patients can see & contact you right now" : "Toggle on to appear available to patients"}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleOnlineStatus}
                disabled={savingOnlineStatus}
                style={{
                  background: isOnline ? "var(--green)" : "var(--surface-alt)",
                  border: `1px solid ${isOnline ? "var(--green)" : "var(--border-strong)"}`,
                  color: isOnline ? "#fff" : "var(--text-muted)",
                  padding: "9px 18px", borderRadius: "var(--radius-md)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                  transition: "all 0.2s"
                }}
              >
                {savingOnlineStatus ? <Loader2 size={13} className="animate-spin" /> : isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                {savingOnlineStatus ? "Updating..." : isOnline ? "Go Offline" : "Go Online"}
              </button>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="v2-section" style={{ marginBottom: 16, padding: "14px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Profile Completeness</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: pctColor }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: "var(--surface-alt)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pctColor, borderRadius: 100, transition: "width 0.4s" }} />
            </div>
            {pct < 80 && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "8px 0 0" }}>
                Complete your profile so patients can find and trust you.
              </p>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: 0 }}>Professional Details</h4>
            <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} disabled={savingProfile}
              className="btn-primary" style={isEditing ? { background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 3px 12px rgba(16,185,129,0.22)" } : {}}>
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {savingProfile ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>

          <div className="v2-section" style={{ padding: "24px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {[
                { label: "Full Name", value: user?.name },
                { label: "Email", value: user?.email },
              ].map(f => (
                <div key={f.label}>
                  <label className="profile-field-label">{f.label}</label>
                  <input type="text" value={f.value || ""} disabled className="input-field" style={{ background: "var(--surface-alt)", color: "var(--text-muted)", cursor: "default", opacity: 0.8 }} />
                </div>
              ))}

              {[
                { label: "Specialization",          key: "specialty",         placeholder: "e.g. Cardiologist",    type: "text" },
                { label: "Qualifications",           key: "qualifications",    placeholder: "e.g. MBBS, MD",        type: "text" },
                { label: "Years of Experience",      key: "experience_years",  placeholder: "0",                    type: "number" },
                { label: "Consultation Fee (₹)",     key: "consultation_fee",  placeholder: "e.g. 500",             type: "number" },
                { label: "Medical Registration No.", key: "medical_reg_number",placeholder: "MCI-XXXXX",            type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label className="profile-field-label">{f.label}</label>
                  <input
                    type={f.type}
                    value={profile[f.key] || ""}
                    disabled={!isEditing}
                    placeholder={f.placeholder}
                    onChange={e => setProfile({ ...profile, [f.key]: f.type === "number" ? (parseInt(e.target.value) || e.target.value) : e.target.value })}
                    className="input-field"
                    style={!isEditing ? { background: "var(--surface-alt)", color: "var(--text-muted)" } : {}}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="profile-field-label">Professional Bio</label>
              <textarea
                value={profile.bio || ""}
                disabled={!isEditing}
                placeholder="Brief professional biography..."
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="input-field"
                style={{ minHeight: 90, resize: "vertical", ...(!isEditing ? { background: "var(--surface-alt)", color: "var(--text-muted)" } : {}) }}
              />
            </div>

            {/* Clinic Location Section */}
            <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={14} style={{ color: "var(--red)" }} /> Clinic / Practice Location
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
                {[
                  { label: "Clinic Address",  key: "clinic_address",  placeholder: "Street address of clinic",   type: "text" },
                  { label: "City",             key: "clinic_city",     placeholder: "e.g. New Delhi",             type: "text" },
                  { label: "State",            key: "clinic_state",    placeholder: "e.g. Delhi",                 type: "text" },
                  { label: "PIN Code",         key: "clinic_pincode",  placeholder: "e.g. 110001",                type: "text" },
                  { label: "Languages Spoken", key: "languages",       placeholder: "Hindi, English, Tamil",      type: "text" },
                  { label: "Gender",           key: "gender",          placeholder: "Male / Female / Other",      type: "text" },
                  { label: "GPS Latitude",     key: "lat",             placeholder: "e.g. 28.6139 (for Maps)",   type: "text" },
                  { label: "GPS Longitude",    key: "lng",             placeholder: "e.g. 77.2090 (for Maps)",   type: "text" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="profile-field-label">{f.label}</label>
                    <input
                      type={f.type}
                      value={profile[f.key] || ""}
                      disabled={!isEditing}
                      placeholder={f.placeholder}
                      onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                      className="input-field"
                      style={!isEditing ? { background: "var(--surface-alt)", color: "var(--text-muted)" } : {}}
                    />
                  </div>
                ))}
              </div>

              {/* Maps Links */}
              {profile.clinic_city && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([profile.clinic_address, profile.clinic_city, profile.clinic_state, "India"].filter(Boolean).join(", "))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="doctor-map-btn-ghost"
                  >
                    <MapPin size={12} /> View on Map
                  </a>
                  {profile.lat && profile.lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${profile.lat},${profile.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="doctor-map-btn"
                    >
                      Navigate
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── V2: PRESCRIPTION PAD ─────────────────────────────────── */}
      {activeTab === "prescriptions" && (
        <div className="fade-up">
          <PrescriptionPad user={user} />
        </div>
      )}

      {/* ── V2: FOLLOW-UP ENGINE ──────────────────────────────────── */}
      {activeTab === "followups" && (
        <div className="fade-up">
          <FollowUpManager user={user} />
        </div>
      )}

    </div>
  );
}
