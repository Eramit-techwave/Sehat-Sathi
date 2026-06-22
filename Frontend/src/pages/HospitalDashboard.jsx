import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2, Loader2, LogOut, Edit2, Save, AlertCircle,
  TrendingUp, BedDouble, Megaphone, Plus, X, Trash2,
  Activity, Users, Calendar, Building2
} from "lucide-react";

const API_BASE = "http://localhost:8000";
const inputStyle = {
  width: "100%", background: "#060b16", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 13,
  outline: "none", boxSizing: "border-box"
};

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("sehat_sathi_token");
  const authHeaders = { "Authorization": `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState("overview");
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  // ── APPOINTMENTS ────────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // ── AFFILIATED DOCTORS ──────────────────────────────────────────
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // ── PROFILE ─────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({
    address: "", phone: "", website: "", departments: [], facilities: [],
    registration_number: "", bed_counts: { general: 0, icu: 0, emergency: 0 }
  });
  const [departmentInput, setDepartmentInput] = useState("");
  const [facilityInput, setFacilityInput] = useState("");

  // ── BED AVAILABILITY ────────────────────────────────────────────
  const [bedAvailability, setBedAvailability] = useState({ general: true, icu: true, emergency: true });
  const [savingBeds, setSavingBeds] = useState(false);

  // ── ANALYTICS ──────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── ANNOUNCEMENTS ───────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [postingAnn, setPostingAnn] = useState(false);

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  useEffect(() => {
    loadAppointments();
    loadProfile();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "doctors") loadAffiliatedDoctors();
  }, [activeTab]);

  // ── LOADERS ─────────────────────────────────────────────────────

  const loadAppointments = async () => {
    setAptsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/my`, { headers: authHeaders });
      if (res.ok) setAppointments(await res.json());
    } catch (e) { console.error(e); }
    finally { setAptsLoading(false); }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/profile`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
          departments: data.departments || [],
          facilities: data.facilities || [],
          registration_number: data.registration_number || "",
          bed_counts: data.bed_counts || { general: 0, icu: 0, emergency: 0 }
        });
        setBedAvailability(data.bed_availability || { general: true, icu: true, emergency: true });
        setAnnouncements(data.announcements || []);
      } else {
        // Fallback to users/profile for older data
        const res2 = await fetch(`${API_BASE}/users/profile`, { headers: authHeaders });
        if (res2.ok) {
          const d = await res2.json();
          setProfile(prev => ({
            ...prev,
            address: d.location || "",
            phone: d.phone || "",
            departments: d.departments || [],
            facilities: d.facilities || []
          }));
        }
      }
    } catch (e) { console.error(e); }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/stats`, { headers: authHeaders });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  const loadAffiliatedDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/doctors`, { headers: authHeaders });
      if (res.ok) setDoctors(await res.json());
      else {
        // Fallback: public doctor listing filtered by hospital
        const res2 = await fetch(`${API_BASE}/appointments/doctors`);
        if (res2.ok) setDoctors(await res2.json());
      }
    } catch (e) { console.error(e); }
    finally { setDoctorsLoading(false); }
  };

  // ── ACTIONS ─────────────────────────────────────────────────────

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/profile`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          address: profile.address,
          phone: profile.phone,
          website: profile.website,
          departments: profile.departments,
          facilities: profile.facilities,
          registration_number: profile.registration_number,
          bed_counts: profile.bed_counts
        })
      });
      if (!res.ok) {
        // Fallback to users/profile
        const res2 = await fetch(`${API_BASE}/users/profile`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ phone: profile.phone, location: profile.address, departments: profile.departments, facilities: profile.facilities })
        });
        if (!res2.ok) throw new Error("Save failed");
      }
      setIsEditing(false);
      showNotif("Hospital profile updated!");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingProfile(false);
  };

  const saveBedAvailability = async () => {
    setSavingBeds(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/bed-availability`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(bedAvailability)
      });
      if (!res.ok) throw new Error("Update failed");
      showNotif("Bed availability updated! Patients can now see real-time status.");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingBeds(false);
  };

  const toggleBed = (type) => {
    setBedAvailability(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      return showNotif("Please fill in both title and content.", "error");
    }
    setPostingAnn(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/announcements`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Post failed");
      setAnnouncements(prev => [data.announcement, ...prev].slice(0, 20));
      setNewAnnouncement({ title: "", content: "" });
      showNotif("Announcement published! Visible to patients.");
    } catch (e) { showNotif(e.message, "error"); }
    setPostingAnn(false);
  };

  const deleteAnnouncement = async (id) => {
    try {
      await fetch(`${API_BASE}/hospitals/me/announcements/${id}`, {
        method: "DELETE", headers: authHeaders
      });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showNotif("Announcement removed.");
    } catch (e) { showNotif("Remove failed.", "error"); }
  };

  // ── DERIVED STATE ────────────────────────────────────────────────

  const TABS = [
    { id: "overview", label: "Overview", icon: "🏥" },
    { id: "beds", label: "Bed Availability", icon: "🛏️" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "doctors", label: "Doctors", icon: "👨‍⚕️" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "profile", label: "Profile", icon: "🏢" }
  ];

  const todayDate = new Date().toISOString().split("T")[0];
  const todayCount = appointments.filter(a => a.date === todayDate && a.status !== "Cancelled").length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const cancelledCount = appointments.filter(a => a.status === "Cancelled").length;
  const filteredApts = statusFilter === "All" ? appointments : appointments.filter(a => a.status === statusFilter);

  const BED_TYPES = [
    { key: "general", label: "General Ward", icon: "🛏️", color: "#3b82f6", desc: "Regular admission beds" },
    { key: "icu", label: "ICU", icon: "💊", color: "#ef4444", desc: "Intensive Care Unit" },
    { key: "emergency", label: "Emergency", icon: "🚨", color: "#f59e0b", desc: "Emergency & trauma bays" }
  ];

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div style={{ textAlign: "left" }}>
          <h2 className="serif" style={{ fontSize: "36px", color: "#fff", margin: 0 }}>🏥 Hospital Management</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              <strong style={{ color: "#60a5fa" }}>{user?.name}</strong> • Hospital Authority Portal
            </p>
            {/* Bed availability summary pills */}
            {BED_TYPES.map(bt => (
              <span key={bt.key} style={{
                fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px",
                background: bedAvailability[bt.key] ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${bedAvailability[bt.key] ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: bedAvailability[bt.key] ? "#22c55e" : "#ef4444"
              }}>
                {bt.icon} {bt.label}: {bedAvailability[bt.key] ? "Available" : "Full"}
              </span>
            ))}
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
            background: activeTab === tab.id ? "rgba(34,197,94,0.1)" : "transparent",
            border: `1px solid ${activeTab === tab.id ? "rgba(34,197,94,0.25)" : "transparent"}`,
            color: activeTab === tab.id ? "#22c55e" : "#64748b",
            padding: "10px 16px", borderRadius: 8, fontSize: "13px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6
          }}>
            {tab.icon} {tab.label}
            {tab.id === "appointments" && pendingCount > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{pendingCount}</span>
            )}
            {tab.id === "announcements" && announcements.length > 0 && (
              <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{announcements.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="fade-up">
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            {statsLoading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                <Loader2 size={24} className="animate-spin" style={{ color: "#3b82f6" }} />
              </div>
            ) : stats ? [
              { label: "Today's Load", value: stats.today_appointments ?? todayCount, icon: "📅", color: "#22c55e" },
              { label: "Pending Approval", value: stats.pending_appointments ?? pendingCount, icon: "⏳", color: "#f59e0b" },
              { label: "Total Bookings", value: stats.total_appointments ?? appointments.length, icon: "📊", color: "#3b82f6" },
              { label: "Total Patients", value: stats.total_patients ?? 0, icon: "👥", color: "#a855f7" },
              { label: "Affiliated Doctors", value: stats.affiliated_doctors ?? doctors.length, icon: "👨‍⚕️", color: "#60a5fa" },
              { label: "Cancellation Rate", value: `${stats.cancellation_rate ?? 0}%`, icon: "❌", color: "#ef4444" }
            ].map((stat, i) => (
              <div key={i} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px", textAlign: "left" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: stat.color }}>{stat.icon} {stat.value}</div>
              </div>
            )) : [
              { label: "Today's Load", value: todayCount, icon: "📅", color: "#22c55e" },
              { label: "Pending Approval", value: pendingCount, icon: "⏳", color: "#f59e0b" },
              { label: "Total Bookings", value: appointments.length, icon: "📊", color: "#3b82f6" },
              { label: "Cancellations", value: cancelledCount, icon: "❌", color: "#ef4444" },
              { label: "Affiliated Doctors", value: doctors.length, icon: "👨‍⚕️", color: "#a855f7" }
            ].map((stat, i) => (
              <div key={i} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px", textAlign: "left" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: stat.color }}>{stat.icon} {stat.value}</div>
              </div>
            ))}
          </div>

          {/* 7-Day Trend */}
          {stats?.appointment_trend_7days && (
            <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 20, padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <TrendingUp size={16} style={{ color: "#60a5fa" }} />
                <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, margin: 0 }}>7-Day Appointment Trend</h4>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
                {stats.appointment_trend_7days.map((day, i) => {
                  const maxCount = Math.max(...stats.appointment_trend_7days.map(d => d.count), 1);
                  const height = Math.max((day.count / maxCount) * 60, 4);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{day.count}</div>
                      <div style={{ width: "100%", height: `${height}px`, background: day.date === todayDate ? "#22c55e" : "rgba(37,99,235,0.4)", borderRadius: "4px 4px 0 0", transition: "all 0.3s" }} />
                      <div style={{ fontSize: 9, color: "#475569" }}>{day.date.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bed Availability Quick Panel */}
          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BedDouble size={16} style={{ color: "#22c55e" }} />
                <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, margin: 0 }}>Real-Time Bed Availability</h4>
              </div>
              <button onClick={() => setActiveTab("beds")} style={{ fontSize: 11, color: "#60a5fa", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                Manage →
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {BED_TYPES.map(bt => (
                <div key={bt.key} style={{ background: "#030912", borderRadius: 12, padding: "14px", textAlign: "center", border: `1px solid ${bedAvailability[bt.key] ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{bt.icon}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{bt.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: bedAvailability[bt.key] ? "#22c55e" : "#ef4444" }}>
                    {bedAvailability[bt.key] ? "✅ Available" : "❌ Full"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Appointments */}
          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px" }}>
            <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 16 }}>Recent Appointments</h4>
            {appointments.slice(0, 5).length === 0 ? (
              <p style={{ color: "#475569", fontSize: 13 }}>No appointments yet.</p>
            ) : appointments.slice(0, 5).map(apt => (
              <div key={apt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{apt.patient_name || "Patient"}</div>
                  <div style={{ color: "#475569", fontSize: "12px" }}>with {apt.doctor_name || "Doctor"} • {apt.date} {apt.time_slot}</div>
                </div>
                <span style={{ color: apt.status === "Confirmed" ? "#22c55e" : apt.status === "Pending" ? "#f59e0b" : "#ef4444", fontSize: "12px", fontWeight: 700 }}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BED AVAILABILITY ─────────────────────────────────────── */}
      {activeTab === "beds" && (
        <div className="fade-up">
          <div style={{ marginBottom: 24, textAlign: "left" }}>
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Real-Time Bed Availability</h4>
            <p style={{ color: "#64748b", fontSize: "13px", marginTop: 4 }}>
              Toggle availability status. Patients searching for hospitals see this live. Changes save immediately when you click "Save Status".
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
            {BED_TYPES.map(bt => {
              const isAvailable = bedAvailability[bt.key];
              return (
                <div key={bt.key} style={{
                  background: isAvailable ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)",
                  border: `2px solid ${isAvailable ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                  borderRadius: 20, padding: "28px 24px", cursor: "pointer", transition: "all 0.25s"
                }} onClick={() => toggleBed(bt.key)}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{bt.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{bt.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>{bt.desc}</div>

                  {/* Toggle Switch */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 52, height: 28, borderRadius: 14,
                      background: isAvailable ? "#22c55e" : "#ef4444",
                      position: "relative", cursor: "pointer", transition: "background 0.25s"
                    }}>
                      <div style={{
                        position: "absolute", width: 22, height: 22, borderRadius: "50%", background: "#fff",
                        top: 3, left: isAvailable ? 27 : 3, transition: "left 0.25s",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                      }} />
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: isAvailable ? "#22c55e" : "#ef4444"
                    }}>
                      {isAvailable ? "Available" : "Beds Full"}
                    </span>
                  </div>

                  {/* Bed count (if set) */}
                  {profile.bed_counts?.[bt.key] > 0 && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#475569" }}>
                      Total beds: <span style={{ color: "#60a5fa", fontWeight: 600 }}>{profile.bed_counts[bt.key]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={saveBedAvailability} disabled={savingBeds} style={{
            background: "#22c55e", border: "none", color: "#fff",
            padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8
          }}>
            {savingBeds ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Availability Status
          </button>
        </div>
      )}

      {/* ── APPOINTMENTS ───────────────────────────────────────────── */}
      {activeTab === "appointments" && (
        <div className="fade-up">
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: "6px 14px", fontSize: "12px", borderRadius: 8, cursor: "pointer",
                background: statusFilter === s ? "#2563eb" : "rgba(255,255,255,0.03)",
                border: `1px solid ${statusFilter === s ? "#3b82f6" : "rgba(255,255,255,0.06)"}`,
                color: "#fff", fontWeight: statusFilter === s ? 700 : 400
              }}>{s}</button>
            ))}
          </div>

          {aptsLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}><Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6" }} /></div>
          ) : (
            <div style={{ background: "#070c19", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "14px 20px", background: "rgba(255,255,255,0.02)", fontSize: "11px", color: "#475569", fontWeight: 700 }}>
                <span>PATIENT</span><span>DOCTOR</span><span>DATE</span><span>TIME</span><span>STATUS</span>
              </div>
              {filteredApts.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No appointments found.</div>
              ) : filteredApts.map(apt => (
                <div key={apt.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.02)", fontSize: "13px", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{apt.patient_name || "—"}</span>
                  <span style={{ color: "#94a3b8" }}>{apt.doctor_name || "—"}</span>
                  <span style={{ color: "#60a5fa" }}>{apt.date}</span>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{apt.time_slot}</span>
                  <span style={{ color: apt.status === "Confirmed" ? "#22c55e" : apt.status === "Pending" ? "#f59e0b" : apt.status === "Cancelled" ? "#ef4444" : "#a855f7", fontWeight: 700, fontSize: "12px" }}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DOCTORS ────────────────────────────────────────────────── */}
      {activeTab === "doctors" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Affiliated Doctors ({doctors.length})
            </h4>
            <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
              Doctors who set your hospital as their affiliation
            </p>
          </div>
          {doctorsLoading ? (
            <div style={{ textAlign: "center", padding: "60px" }}><Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6" }} /></div>
          ) : doctors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <Building2 size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
              <p>No affiliated doctors yet. Doctors can add your hospital from their Doctor Portal.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {doctors.map(doc => (
                <div key={doc.id} style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{doc.name}</div>
                      <div style={{ fontSize: "12px", color: "#60a5fa" }}>{doc.specialty || "General"}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: 4 }}>{doc.email}</div>
                  {doc.experience_years > 0 && <div style={{ fontSize: "12px", color: "#475569" }}>{doc.experience_years} yrs experience</div>}
                  {doc.qualifications && <div style={{ fontSize: "11px", color: "#475569", marginTop: 4 }}>{doc.qualifications}</div>}
                  {doc.verification_status && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                        background: doc.verification_status === "approved" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                        color: doc.verification_status === "approved" ? "#22c55e" : "#f59e0b",
                        border: `1px solid ${doc.verification_status === "approved" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`
                      }}>
                        {doc.verification_status === "approved" ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ANNOUNCEMENTS ────────────────────────────────────────── */}
      {activeTab === "announcements" && (
        <div className="fade-up">
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Public Announcements</h4>
            <p style={{ color: "#64748b", fontSize: "13px", marginTop: 4 }}>
              Post notices visible to patients searching your hospital (e.g. OPD timings, special clinics).
            </p>
          </div>

          {/* New Announcement Form */}
          <div style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 20, padding: "24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Megaphone size={16} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>New Announcement</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Announcement title (e.g. OPD Closed on Sunday)"
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="Details... (e.g. Due to maintenance, OPD will remain closed this Sunday, June 29)"
                value={newAnnouncement.content}
                onChange={e => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              />
              <button onClick={postAnnouncement} disabled={postingAnn} style={{
                background: "#2563eb", border: "none", color: "#fff", padding: "12px 24px",
                borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start"
              }}>
                {postingAnn ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Publish Announcement
              </button>
            </div>
          </div>

          {/* Existing Announcements */}
          {announcements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
              <Megaphone size={36} style={{ margin: "0 auto 12px", display: "block", opacity: 0.2 }} />
              <p style={{ fontSize: 13 }}>No announcements posted yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.map(ann => (
                <div key={ann.id} style={{ background: "#070c19", border: "1px solid rgba(37,99,235,0.08)", borderRadius: 14, padding: "18px 20px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{ann.title}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{ann.content}</div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 8 }}>
                      Posted {ann.created_at ? new Date(ann.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </div>
                  </div>
                  <button onClick={() => deleteAnnouncement(ann.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE ────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Hospital Profile</h4>
            <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} disabled={savingProfile}
              style={{ background: isEditing ? "#10b981" : "#2563eb", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {savingProfile ? "Saving..." : isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[{ label: "Hospital Name", value: user?.name, readOnly: true }, { label: "Email", value: user?.email, readOnly: true }].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>{f.label}</label>
                  <input type="text" value={f.value || ""} disabled style={{ ...inputStyle, background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Address / Location</label>
                <input type="text" value={profile.address} disabled={!isEditing} placeholder="Full hospital address" onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Contact Phone</label>
                <input type="tel" value={profile.phone} disabled={!isEditing} placeholder="+91 00000 00000" onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Website</label>
                <input type="text" value={profile.website} disabled={!isEditing} placeholder="https://hospital.com" onChange={e => setProfile({ ...profile, website: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Registration No.</label>
                <input type="text" value={profile.registration_number} disabled={!isEditing} placeholder="Hospital Reg. Number" onChange={e => setProfile({ ...profile, registration_number: e.target.value })} style={{ ...inputStyle, background: isEditing ? "#030712" : "transparent", border: isEditing ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.04)" }} />
              </div>
            </div>

            {/* Bed Counts */}
            {isEditing && (
              <div style={{ marginTop: 24 }}>
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 12, textTransform: "uppercase" }}>Bed Counts (Total Capacity)</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {BED_TYPES.map(bt => (
                    <div key={bt.key}>
                      <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>{bt.label}</label>
                      <input type="number" value={profile.bed_counts?.[bt.key] || 0}
                        onChange={e => setProfile(prev => ({ ...prev, bed_counts: { ...prev.bed_counts, [bt.key]: parseInt(e.target.value) || 0 } }))}
                        style={{ ...inputStyle, border: "1px solid #2563eb", background: "#030712" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Departments */}
            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 10, textTransform: "uppercase" }}>Departments</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {profile.departments.map((dep, i) => (
                  <span key={i} style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", color: "#60a5fa", padding: "4px 12px", borderRadius: 20, fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
                    {dep}
                    {isEditing && <button onClick={() => setProfile({ ...profile, departments: profile.departments.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", padding: 0 }}>✕</button>}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" placeholder="Add department..." value={departmentInput} onChange={e => setDepartmentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && departmentInput.trim()) { setProfile({ ...profile, departments: [...profile.departments, departmentInput.trim()] }); setDepartmentInput(""); } }}
                    style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => { if (departmentInput.trim()) { setProfile({ ...profile, departments: [...profile.departments, departmentInput.trim()] }); setDepartmentInput(""); } }} style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Add</button>
                </div>
              )}
            </div>

            {/* Facilities */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: "11px", color: "#475569", fontWeight: 700, display: "block", marginBottom: 10, textTransform: "uppercase" }}>Facilities</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {profile.facilities.map((fac, i) => (
                  <span key={i} style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#22c55e", padding: "4px 12px", borderRadius: 20, fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
                    {fac}
                    {isEditing && <button onClick={() => setProfile({ ...profile, facilities: profile.facilities.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#22c55e", cursor: "pointer", padding: 0 }}>✕</button>}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" placeholder="Add facility (e.g. CT Scan, ICU, Blood Bank)..." value={facilityInput} onChange={e => setFacilityInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && facilityInput.trim()) { setProfile({ ...profile, facilities: [...profile.facilities, facilityInput.trim()] }); setFacilityInput(""); } }}
                    style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => { if (facilityInput.trim()) { setProfile({ ...profile, facilities: [...profile.facilities, facilityInput.trim()] }); setFacilityInput(""); } }} style={{ padding: "10px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Add</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
