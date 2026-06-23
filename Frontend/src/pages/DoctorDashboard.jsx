import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2, Clock, Users, Calendar, Loader2, LogOut,
  Edit2, Save, X, Activity, AlertCircle, Building2, Stethoscope,
  IndianRupee, Plus, Trash2, Star
} from "lucide-react";

const API_BASE = "http://https://sehat-sathi-ce58.onrender.com";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM"];

const inputStyle = {
  width: "100%", background: "#060b16", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 13,
  outline: "none", boxSizing: "border-box"
};

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
    medical_reg_number: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

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
          medical_reg_number: data.medical_reg_number || ""
        });
        setAssociations(data.hospital_associations || []);
      }
    } catch (e) { console.error(e); }
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
          consultation_fee: profile.consultation_fee ? parseInt(profile.consultation_fee) : null
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
    { id: "profile", label: "Profile", icon: "👨‍⚕️" }
  ];

  const pendingApts = appointments.filter(a => a.status === "Pending");
  const todayDate = new Date().toISOString().split("T")[0];
  const todayApts = appointments.filter(a => a.date === todayDate && a.status !== "Cancelled");
  const practiceInfo = PRACTICE_TYPE_LABELS[profile.practice_type] || PRACTICE_TYPE_LABELS.independent;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%", position: "relative" }}>

      {/* NOTIFICATION */}
      {notification.show && (
        <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: notification.type === "success" ? "#064e3b" : "#7f1d1d", border: `1px solid ${notification.type === "success" ? "#10b981" : "#ef4444"}`, borderRadius: "12px", padding: "16px 24px", color: "#fff", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32, textAlign: "left" }}>
        <div>
          <h2 className="serif" style={{ fontSize: "36px", color: "#fff", margin: 0 }}>🩺 Doctor Portal</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Welcome, <strong style={{ color: "#60a5fa" }}>Dr. {user?.name}</strong>
              {profile.specialty && <span style={{ color: "#94a3b8" }}> • {profile.specialty}</span>}
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
              <span style={{ fontSize: 10, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>
                ₹{profile.consultation_fee} / visit
              </span>
            )}
          </div>
        </div>
        <button onClick={logout} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: 6, overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? "rgba(37,99,235,0.15)" : "transparent",
            border: `1px solid ${activeTab === tab.id ? "rgba(37,99,235,0.3)" : "transparent"}`,
            color: activeTab === tab.id ? "#60a5fa" : "#64748b",
            padding: "10px 16px", borderRadius: 8, fontSize: "13px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6
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
              { label: "Total Patients", value: stats.total_patients, color: "#3b82f6", icon: "👥" },
              { label: "Pending Approval", value: stats.pending_count, color: "#f59e0b", icon: "⏳" },
              { label: "Today's Appointments", value: stats.today_count, color: "#22c55e", icon: "📅" },
              { label: "Upcoming", value: stats.upcoming_count, color: "#a855f7", icon: "🔮" },
              { label: "Total Appointments", value: stats.total_appointments, color: "#60a5fa", icon: "📊" }
            ].map((stat, i) => (
              <div key={i} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: stat.color }}>{stat.icon} {stat.value}</div>
              </div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 20, padding: "24px", marginBottom: 20 }}>
            <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 16 }}>Today's Schedule ({todayApts.length} appointments)</h4>
            {todayApts.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No appointments scheduled for today.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {todayApts.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(apt => (
                  <div key={apt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#030912", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div>
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{apt.patient_name || "Patient"}</span>
                      <span style={{ color: "#475569", fontSize: "12px", marginLeft: 10 }}>{apt.time_slot}</span>
                    </div>
                    <span style={{ color: apt.status === "Confirmed" ? "#22c55e" : apt.status === "Pending" ? "#f59e0b" : "#ef4444", fontSize: "12px", fontWeight: 600 }}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hospital Affiliations Quick View */}
          {associations.length > 0 && (
            <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 20, padding: "24px" }}>
              <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 16 }}>🏥 Hospital Affiliations</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {associations.map((assoc, i) => (
                  <div key={i} style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={14} style={{ color: "#60a5fa" }} />
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{assoc.hospital_name}</span>
                    <span style={{ color: "#64748b", fontSize: 11 }}>{assoc.role}</span>
                    {assoc.is_primary && <span style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>PRIMARY</span>}
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
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>
              {pendingApts.length > 0 && <span style={{ color: "#f59e0b", fontWeight: 700 }}>{pendingApts.length} pending approval </span>}
              | {appointments.length} total
            </span>
          </div>

          {aptsLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6" }} />
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Calendar size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>No appointments yet. Patients can book once you configure your availability.</p>
            </div>
          ) : (
            <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "14px 20px", background: "rgba(255,255,255,0.02)", fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                <span>PATIENT</span><span>DATE</span><span>TIME</span><span>STATUS</span><span>ACTIONS</span>
              </div>
              {[...appointments].sort((a, b) => new Date(b.date) - new Date(a.date)).map(apt => (
                <div key={apt.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.02)", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{apt.patient_name || "Patient"}</span>
                  <span style={{ color: "#94a3b8" }}>{apt.date}</span>
                  <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>{apt.time_slot}</span>
                  <span style={{ color: apt.status === "Confirmed" ? "#22c55e" : apt.status === "Pending" ? "#f59e0b" : apt.status === "Cancelled" ? "#ef4444" : "#9ca3af", fontWeight: 700, fontSize: "12px" }}>
                    {apt.status === "Pending" ? "⏳" : apt.status === "Confirmed" ? "✅" : apt.status === "Cancelled" ? "❌" : "✔️"} {apt.status}
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {apt.status === "Pending" && (
                      <>
                        <button onClick={() => updateAptStatus(apt.id, "Confirmed")} style={{ padding: "4px 10px", fontSize: "11px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✓ Confirm</button>
                        <button onClick={() => updateAptStatus(apt.id, "Cancelled")} style={{ padding: "4px 10px", fontSize: "11px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕ Reject</button>
                      </>
                    )}
                    {apt.status === "Confirmed" && (
                      <button onClick={() => updateAptStatus(apt.id, "Completed")} style={{ padding: "4px 10px", fontSize: "11px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Complete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AVAILABILITY ──────────────────────────────────────────── */}
      {activeTab === "availability" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Configure Weekly Availability</h4>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: 4 }}>Toggle slots to set when you're available. Patients can only book open slots.</p>
            </div>
            <button onClick={saveAvailability} disabled={savingAvailability} style={{ background: "#22c55e", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {savingAvailability ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Availability
            </button>
          </div>

          {DAYS.map(day => (
            <div key={day} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: "20px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h5 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, margin: 0 }}>{day}</h5>
                <span style={{ color: "#64748b", fontSize: "12px" }}>{(availability[day] || []).length} slots open</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_SLOTS.map(slot => {
                  const isOpen = (availability[day] || []).includes(slot);
                  return (
                    <button key={slot} onClick={() => toggleSlot(day, slot)} style={{
                      padding: "6px 12px", fontSize: "12px",
                      background: isOpen ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isOpen ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                      color: isOpen ? "#22c55e" : "#475569", borderRadius: 8, cursor: "pointer",
                      fontWeight: isOpen ? 700 : 400, transition: "all 0.2s"
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
              <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Hospital Affiliations</h4>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: 4 }}>
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
            <div style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)", borderRadius: 16, padding: "32px", textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>You are currently set as an <strong style={{ color: "#a855f7" }}>Independent Practitioner</strong>.<br />Add hospitals below if you work at one or more facilities.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {associations.map((assoc, i) => (
                <div key={i} style={{ background: "#070c19", border: `1px solid ${assoc.is_primary ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.05)"}`, borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building2 size={18} style={{ color: "#60a5fa" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{assoc.hospital_name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{assoc.role}</div>
                    </div>
                    {assoc.is_primary && (
                      <span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                        ⭐ Primary
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!assoc.is_primary && (
                      <button onClick={() => setPrimary(assoc.hospital_id)} style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={11} /> Set Primary
                      </button>
                    )}
                    <button onClick={() => removeAssociation(assoc.hospital_id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Hospital Form */}
          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Add Hospital Affiliation</div>
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
            <button onClick={saveAssociations} disabled={savingAssociations} style={{ background: "#22c55e", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {savingAssociations ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Affiliations
            </button>
            <button onClick={setIndependent} disabled={savingAssociations || associations.length === 0} style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7", padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: associations.length === 0 ? 0.5 : 1 }}>
              Set as Independent Practice
            </button>
          </div>
        </div>
      )}

      {/* ── PATIENTS ──────────────────────────────────────────────── */}
      {activeTab === "patients" && (
        <div className="fade-up">
          <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: 20 }}>Your Patients ({patients.length})</h4>
          {patientsLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6" }} />
            </div>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Users size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>No patients yet. Patients who book appointments with you will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {patients.map(patient => (
                <div key={patient.id} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{patient.name}</div>
                      <div style={{ fontSize: "12px", color: "#60a5fa" }}>{patient.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: 10 }}>
                    <span>📊 {patient.appointment_count} visits</span>
                    <span>📅 Last: {patient.last_visit || "—"}</span>
                  </div>
                  {patient.phone && <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: 8 }}>📞 {patient.phone}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE ───────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Professional Profile</h4>
            <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} disabled={savingProfile}
              style={{ background: isEditing ? "#10b981" : "#2563eb", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {savingProfile ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>

          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {[
                { label: "Full Name", value: user?.name, readOnly: true },
                { label: "Email", value: user?.email, readOnly: true },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>{f.label}</label>
                  <input type="text" value={f.value || ""} disabled style={{ ...inputStyle, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", cursor: "default" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Specialization</label>
                <input type="text" value={profile.specialty} disabled={!isEditing} placeholder="e.g. Cardiologist" onChange={e => setProfile({ ...profile, specialty: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Qualifications</label>
                <input type="text" value={profile.qualifications} disabled={!isEditing} placeholder="e.g. MBBS, MD Cardiology" onChange={e => setProfile({ ...profile, qualifications: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Years of Experience</label>
                <input type="number" value={profile.experience_years} disabled={!isEditing} placeholder="0" onChange={e => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Consultation Fee (₹)</label>
                <input type="number" value={profile.consultation_fee} disabled={!isEditing} placeholder="e.g. 500" onChange={e => setProfile({ ...profile, consultation_fee: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Medical Registration No.</label>
                <input type="text" value={profile.medical_reg_number} disabled={!isEditing} placeholder="MCI-XXXXX" onChange={e => setProfile({ ...profile, medical_reg_number: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Professional Bio</label>
              <textarea value={profile.bio} disabled={!isEditing} placeholder="Brief professional biography..." onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ ...inputStyle, minHeight: "100px", resize: "vertical", background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
