import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2, Loader2, LogOut, Edit2, Save, AlertCircle,
  TrendingUp, BedDouble, Megaphone, Plus, X, Trash2,
  Activity, Users, Calendar, Building2, Stethoscope
} from "lucide-react";
import FloatingNotification from "../components/FloatingNotification";
import DS from "../ui/design-system";
import T from "../ui/tokens";

import { API_BASE } from "../api/client";

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
    registration_number: "", bed_counts: { general: 0, icu: 0, emergency: 0 },
    // Location fields
    city: "", state: "", pincode: "", emergency_phone: "",
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
          bed_counts: data.bed_counts || { general: 0, icu: 0, emergency: 0 },
          // Location fields
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          emergency_phone: data.emergency_phone || "",
        });
        setBedAvailability(data.bed_availability || { general: true, icu: true, emergency: true });
        setAnnouncements(data.announcements || []);
      } else {
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
        const res2 = await fetch(`${API_BASE}/appointments/doctors`);
        if (res2.ok) setDoctors(await res2.json());
      }
    } catch (e) { console.error(e); }
    finally { setDoctorsLoading(false); }
  };

  useEffect(() => {
    loadAppointments();
    loadProfile();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "doctors") loadAffiliatedDoctors();
  }, [activeTab]);

  // ── ACTIONS ─────────────────────────────────────────────────────

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/me/profile`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          address: profile.address, phone: profile.phone, website: profile.website,
          departments: profile.departments, facilities: profile.facilities,
          registration_number: profile.registration_number, bed_counts: profile.bed_counts,
          // Location
          city: profile.city, state: profile.state, pincode: profile.pincode,
          emergency_phone: profile.emergency_phone,
        })
      });
      if (!res.ok) {
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
      await fetch(`${API_BASE}/hospitals/me/announcements/${id}`, { method: "DELETE", headers: authHeaders });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showNotif("Announcement removed.");
    } catch (e) { showNotif("Remove failed.", "error"); }
  };

  // ── DERIVED STATE ────────────────────────────────────────────────
  const TABS = [
    { id: "overview",      label: "Overview",       icon: <Activity size={14} /> },
    { id: "beds",          label: "Bed Availability", icon: <BedDouble size={14} /> },
    { id: "appointments",  label: "Appointments",    icon: <Calendar size={14} /> },
    { id: "doctors",       label: "Doctors",         icon: <Stethoscope size={14} /> },
    { id: "announcements", label: "Announcements",   icon: <Megaphone size={14} /> },
    { id: "profile",       label: "Profile",         icon: <Building2 size={14} /> },
  ];

  const todayDate = new Date().toISOString().split("T")[0];
  const todayCount  = appointments.filter(a => a.date === todayDate && a.status !== "Cancelled").length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const cancelledCount = appointments.filter(a => a.status === "Cancelled").length;
  const filteredApts = statusFilter === "All" ? appointments : appointments.filter(a => a.status === statusFilter);

  const BED_TYPES = [
    { key: "general",   label: "General Ward", icon: "🛏️", color: T.primary, desc: "Regular admission beds" },
    { key: "icu",       label: "ICU",          icon: "💊", color: T.red,     desc: "Intensive Care Unit" },
    { key: "emergency", label: "Emergency",    icon: "🚨", color: T.amber,   desc: "Emergency & trauma bays" },
  ];

  const inputStyle = DS.input();
  const labelStyle = { fontSize: 11, color: T.textMuted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div style={DS.page()}>
      <FloatingNotification show={notification.show} type={notification.type} text={notification.text} />

      <div style={DS.container()}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div style={DS.between({ marginBottom: 32, flexWrap: "wrap", gap: 16 })}>
          <div>
            <div style={DS.row(10, { marginBottom: 4 })}>
              <div style={DS.iconCircle(T.amber, 40)}>
                <Building2 size={20} style={{ color: T.amber }} />
              </div>
              <div>
                <h2 style={DS.sectionTitle({ fontSize: 22, fontWeight: 800 })}>Hospital Management</h2>
                <p style={DS.sectionSub()}>
                  <strong style={{ color: T.amber }}>{user?.name}</strong> · Hospital Authority Portal
                </p>
              </div>
            </div>
            {/* Bed availability quick pills */}
            <div style={DS.row(6, { marginTop: 10, flexWrap: "wrap" })}>
              {BED_TYPES.map(bt => (
                <span key={bt.key} style={DS.badge(bedAvailability[bt.key] ? "green" : "red")}>
                  {bt.icon} {bt.label}: {bedAvailability[bt.key] ? "Available" : "Full"}
                </span>
              ))}
            </div>
          </div>
          <button onClick={logout} style={DS.btnDanger()}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* ── TABS ──────────────────────────────────────────────── */}
        <div style={DS.tabBar({ marginBottom: 28 })}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={DS.tab(activeTab === tab.id)}>
              {tab.icon} {tab.label}
              {tab.id === "appointments" && pendingCount > 0 && (
                <span style={{ background: T.red, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>{pendingCount}</span>
              )}
              {tab.id === "announcements" && announcements.length > 0 && (
                <span style={{ background: T.primary, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>{announcements.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                          */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="fade-up">
            {/* Stats Grid */}
            <div style={DS.grid3({ marginBottom: 24 })}>
              {statsLoading ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: T.primary }} />
                </div>
              ) : [
                { label: "Today's Appointments", value: stats?.today_appointments ?? todayCount, icon: <Calendar size={20} style={{ color: T.primary }} />, color: T.primary },
                { label: "Pending Approval",     value: stats?.pending_appointments ?? pendingCount, icon: <AlertCircle size={20} style={{ color: T.amber }} />, color: T.amber },
                { label: "Total Bookings",        value: stats?.total_appointments ?? appointments.length, icon: <Activity size={20} style={{ color: T.green }} />, color: T.green },
                { label: "Total Patients",        value: stats?.total_patients ?? 0, icon: <Users size={20} style={{ color: T.purple }} />, color: T.purple },
                { label: "Affiliated Doctors",    value: stats?.affiliated_doctors ?? doctors.length, icon: <Stethoscope size={20} style={{ color: T.cyan }} />, color: T.cyan },
                { label: "Cancellations",         value: cancelledCount, icon: <X size={20} style={{ color: T.red }} />, color: T.red },
              ].map((stat, i) => (
                <div key={i} style={DS.statCard(stat.color)}>
                  <div style={DS.statIcon(stat.color)}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 7-Day Trend */}
            {stats?.appointment_trend_7days && (
              <div style={DS.card({ marginBottom: 20 })}>
                <div style={DS.row(8, { marginBottom: 16 })}>
                  <TrendingUp size={16} style={{ color: T.primary }} />
                  <h4 style={DS.sectionTitle({ fontSize: 14 })}>7-Day Appointment Trend</h4>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
                  {stats.appointment_trend_7days.map((day, i) => {
                    const maxCount = Math.max(...stats.appointment_trend_7days.map(d => d.count), 1);
                    const height = Math.max((day.count / maxCount) * 60, 4);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: 10, color: T.textMuted }}>{day.count}</div>
                        <div style={{ width: "100%", height: `${height}px`, background: day.date === todayDate ? T.green : `${T.primary}44`, borderRadius: "4px 4px 0 0", transition: "all 0.3s" }} />
                        <div style={{ fontSize: 9, color: T.textMuted }}>{day.date.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bed Availability Quick Panel */}
            <div style={DS.card({ marginBottom: 20 })}>
              <div style={DS.between({ marginBottom: 16 })}>
                <div style={DS.row(8)}>
                  <BedDouble size={16} style={{ color: T.green }} />
                  <h4 style={DS.sectionTitle({ fontSize: 14 })}>Real-Time Bed Availability</h4>
                </div>
                <button onClick={() => setActiveTab("beds")} style={DS.btnGhost({ fontSize: 11 })}>
                  Manage →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {BED_TYPES.map(bt => (
                  <div key={bt.key} style={{
                    background: bedAvailability[bt.key] ? T.greenLight : T.redLight,
                    border: `1px solid ${bedAvailability[bt.key] ? T.greenBorder : T.redBorder}`,
                    borderRadius: T.radiusMd, padding: "14px", textAlign: "center"
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{bt.icon}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{bt.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: bedAvailability[bt.key] ? T.green : T.red }}>
                      {bedAvailability[bt.key] ? "✅ Available" : "❌ Full"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Appointments */}
            <div style={DS.card()}>
              <h4 style={DS.sectionTitle({ fontSize: 15, marginBottom: 16 })}>Recent Appointments</h4>
              {appointments.slice(0, 5).length === 0 ? (
                <p style={{ color: T.textMuted, fontSize: 13 }}>No appointments yet.</p>
              ) : appointments.slice(0, 5).map((apt, i) => (
                <div key={apt.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < 4 ? `1px solid ${T.border}` : "none"
                }}>
                  <div>
                    <div style={{ color: T.textPrimary, fontWeight: 600, fontSize: 14 }}>{apt.patient_name || "Patient"}</div>
                    <div style={{ color: T.textMuted, fontSize: 12 }}>with {apt.doctor_name || "Doctor"} · {apt.date} {apt.time_slot}</div>
                  </div>
                  <span style={DS.badge(apt.status === "Confirmed" ? "green" : apt.status === "Pending" ? "amber" : "red")}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* BED AVAILABILITY TAB                                  */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "beds" && (
          <div className="fade-up">
            <div style={{ marginBottom: 24 }}>
              <h4 style={DS.sectionTitle({ fontSize: 18 })}>Real-Time Bed Availability</h4>
              <p style={DS.sectionSub({ marginTop: 4 })}>
                Toggle availability status. Patients searching for hospitals see this live.
              </p>
            </div>

            <div style={DS.grid3({ marginBottom: 24 })}>
              {BED_TYPES.map(bt => {
                const isAvailable = bedAvailability[bt.key];
                return (
                  <div key={bt.key} style={{
                    background: isAvailable ? T.greenLight : T.redLight,
                    border: `2px solid ${isAvailable ? T.greenBorder : T.redBorder}`,
                    borderRadius: T.radiusXl, padding: "28px 24px", cursor: "pointer",
                    transition: T.transition
                  }} onClick={() => toggleBed(bt.key)}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{bt.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>{bt.label}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>{bt.desc}</div>
                    {/* Toggle Switch */}
                    <div style={DS.row(12)}>
                      <div style={{
                        width: 52, height: 28, borderRadius: 14,
                        background: isAvailable ? T.green : T.red,
                        position: "relative", cursor: "pointer", transition: "background 0.25s"
                      }}>
                        <div style={{
                          position: "absolute", width: 22, height: 22, borderRadius: "50%", background: "#fff",
                          top: 3, left: isAvailable ? 27 : 3, transition: "left 0.25s",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                        }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isAvailable ? T.green : T.red }}>
                        {isAvailable ? "Available" : "Beds Full"}
                      </span>
                    </div>
                    {profile.bed_counts?.[bt.key] > 0 && (
                      <div style={{ marginTop: 12, fontSize: 12, color: T.textMuted }}>
                        Total beds: <span style={{ color: T.primary, fontWeight: 600 }}>{profile.bed_counts[bt.key]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={saveBedAvailability} disabled={savingBeds} style={DS.btnPrimary()}>
              {savingBeds ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Availability Status
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* APPOINTMENTS TAB                                      */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "appointments" && (
          <div className="fade-up">
            {/* Filter Bar */}
            <div style={DS.row(8, { marginBottom: 20, flexWrap: "wrap" })}>
              {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={DS.tab(statusFilter === s, { padding: "7px 14px", fontSize: 12 })}>
                  {s}
                </button>
              ))}
            </div>

            {aptsLoading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: T.primary }} />
              </div>
            ) : (
              <div style={DS.tableWrapper()}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr", padding: "12px 20px", background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, gap: 12 }}>
                  {["PATIENT", "DOCTOR", "DATE", "TIME", "PAYMENT", "STATUS"].map((h, i) => (
                    <div key={i} style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: "0.04em" }}>{h}</div>
                  ))}
                </div>
                {filteredApts.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: T.textMuted }}>No appointments found.</div>
                ) : filteredApts.map((apt, i) => (
                  <div key={apt.id} style={{
                    display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom: i < filteredApts.length - 1 ? `1px solid ${T.surfaceAlt}` : "none",
                    gap: 12, alignItems: "center"
                  }}>
                    <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600 }}>{apt.patient_name || "—"}</span>
                    <span style={{ fontSize: 13, color: T.textSecondary }}>{apt.doctor_name || "—"}</span>
                    <span style={{ fontSize: 13, color: T.primary }}>{apt.date}</span>
                    <span style={{ fontSize: 12, color: T.textMuted, fontFamily: "monospace" }}>{apt.time_slot}</span>
                    <span style={DS.badge(apt.payment_status === "Paid" ? "green" : apt.payment_status === "Cash at Clinic" ? "blue" : "amber")}>
                      💳 {apt.payment_status || "Paid"}
                    </span>
                    <span style={DS.badge(apt.status === "Confirmed" ? "green" : apt.status === "Pending" ? "amber" : apt.status === "Cancelled" ? "red" : "purple")}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* DOCTORS TAB                                           */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "doctors" && (
          <div className="fade-up">
            <div style={DS.between({ marginBottom: 20 })}>
              <div>
                <h4 style={DS.sectionTitle()}>Affiliated Doctors ({doctors.length})</h4>
                <p style={DS.sectionSub()}>Doctors who set your hospital as their affiliation</p>
              </div>
            </div>
            {doctorsLoading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: T.primary }} />
              </div>
            ) : doctors.length === 0 ? (
              <div style={DS.emptyState()}>
                <Building2 size={40} style={{ margin: "0 auto 16px", display: "block", color: T.textMuted }} />
                <p style={{ color: T.textMuted, fontSize: 13 }}>No affiliated doctors yet. Doctors can add your hospital from their Doctor Portal.</p>
              </div>
            ) : (
              <div style={DS.grid2()}>
                {doctors.map(doc => (
                  <div key={doc.id} style={DS.card()}>
                    <div style={DS.row(12, { marginBottom: 12 })}>
                      <div style={DS.iconCircle(T.primary, 48)}>
                        <Stethoscope size={22} style={{ color: T.primary }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: T.primary }}>{doc.specialty || "General"}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>{doc.email}</div>
                    {doc.experience_years > 0 && <div style={{ fontSize: 12, color: T.textSecondary }}>{doc.experience_years} yrs experience</div>}
                    {doc.qualifications && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{doc.qualifications}</div>}
                    {doc.verification_status && (
                      <div style={{ marginTop: 10 }}>
                        <span style={DS.badge(doc.verification_status === "approved" ? "green" : "amber")}>
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

        {/* ══════════════════════════════════════════════════════ */}
        {/* ANNOUNCEMENTS TAB                                     */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "announcements" && (
          <div className="fade-up">
            <div style={{ marginBottom: 24 }}>
              <h4 style={DS.sectionTitle({ fontSize: 18 })}>Public Announcements</h4>
              <p style={DS.sectionSub()}>
                Post notices visible to patients searching your hospital (e.g. OPD timings, special clinics).
              </p>
            </div>

            {/* New Announcement Form */}
            <div style={DS.card({ border: `1px solid ${T.primaryBorder}`, marginBottom: 24 })}>
              <div style={DS.row(8, { marginBottom: 16 })}>
                <div style={DS.iconCircle(T.primary, 36)}>
                  <Megaphone size={16} style={{ color: T.primary }} />
                </div>
                <span style={DS.sectionTitle({ fontSize: 14 })}>New Announcement</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Announcement title (e.g. OPD Closed on Sunday)"
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  style={DS.input()}
                />
                <textarea
                  placeholder="Details... (e.g. Due to maintenance, OPD will remain closed this Sunday)"
                  value={newAnnouncement.content}
                  onChange={e => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  style={{ ...DS.input(), minHeight: 80, resize: "vertical" }}
                />
                <div>
                  <button onClick={postAnnouncement} disabled={postingAnn} style={DS.btnPrimary()}>
                    {postingAnn ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Publish Announcement
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Announcements */}
            {announcements.length === 0 ? (
              <div style={DS.emptyState()}>
                <Megaphone size={36} style={{ margin: "0 auto 12px", display: "block", color: T.textMuted }} />
                <p style={{ fontSize: 13, color: T.textMuted }}>No announcements posted yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ ...DS.card(), display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{ann.title}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{ann.content}</div>
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 8 }}>
                        Posted {ann.created_at ? new Date(ann.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </div>
                    </div>
                    <button onClick={() => deleteAnnouncement(ann.id)} style={DS.btnDanger({ padding: "6px 10px", fontSize: 11 })}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* PROFILE TAB                                           */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="fade-up">
            <div style={DS.between({ marginBottom: 24 })}>
              <h4 style={DS.sectionTitle({ fontSize: 18 })}>Hospital Profile</h4>
              <button
                onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
                disabled={savingProfile}
                style={isEditing ? DS.btnSuccess() : DS.btnGhost()}
              >
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                {savingProfile ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div style={DS.card({ padding: 32 })}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 24 }}>
                {[{ label: "Hospital Name", value: user?.name, readOnly: true }, { label: "Email", value: user?.email, readOnly: true }].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="text" value={f.value || ""} disabled style={{ ...DS.input(), background: T.surfaceAlt, color: T.textMuted }} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Address / Location</label>
                  <input type="text" value={profile.address} disabled={!isEditing} placeholder="Full hospital address"
                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                {/* City, State, PIN */}
                <div>
                  <label style={labelStyle}>City</label>
                  <input type="text" value={profile.city} disabled={!isEditing} placeholder="e.g. Mumbai"
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input type="text" value={profile.state} disabled={!isEditing} placeholder="e.g. Maharashtra"
                    onChange={e => setProfile({ ...profile, state: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                <div>
                  <label style={labelStyle}>PIN Code</label>
                  <input type="text" value={profile.pincode} disabled={!isEditing} placeholder="e.g. 400001"
                    onChange={e => setProfile({ ...profile, pincode: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Phone</label>
                  <input type="tel" value={profile.phone} disabled={!isEditing} placeholder="+91 00000 00000"
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                <div>
                  <label style={labelStyle}>Emergency Helpline</label>
                  <input type="tel" value={profile.emergency_phone} disabled={!isEditing} placeholder="Emergency number"
                    onChange={e => setProfile({ ...profile, emergency_phone: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input type="text" value={profile.website} disabled={!isEditing} placeholder="https://hospital.com"
                    onChange={e => setProfile({ ...profile, website: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
                <div>
                  <label style={labelStyle}>Registration No.</label>
                  <input type="text" value={profile.registration_number} disabled={!isEditing} placeholder="Hospital Reg. Number"
                    onChange={e => setProfile({ ...profile, registration_number: e.target.value })}
                    style={{ ...DS.input(), border: isEditing ? `1px solid ${T.primary}` : `1px solid ${T.border}` }} />
                </div>
              </div>

              {/* Bed Counts */}
              {isEditing && (
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Bed Counts (Total Capacity)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {BED_TYPES.map(bt => (
                      <div key={bt.key}>
                        <label style={{ fontSize: 11, color: T.textMuted, display: "block", marginBottom: 4 }}>{bt.label}</label>
                        <input type="number" value={profile.bed_counts?.[bt.key] || 0}
                          onChange={e => setProfile(prev => ({ ...prev, bed_counts: { ...prev.bed_counts, [bt.key]: parseInt(e.target.value) || 0 } }))}
                          style={{ ...DS.input(), border: `1px solid ${T.primary}` }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Departments */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Departments</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {profile.departments.map((dep, i) => (
                    <span key={i} style={{ ...DS.badge("blue"), padding: "5px 12px" }}>
                      {dep}
                      {isEditing && (
                        <button onClick={() => setProfile({ ...profile, departments: profile.departments.filter((_, idx) => idx !== i) })}
                          style={{ background: "none", border: "none", color: T.primary, cursor: "pointer", padding: 0, marginLeft: 4 }}>✕</button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div style={DS.row(8)}>
                    <input type="text" placeholder="Add department..." value={departmentInput} onChange={e => setDepartmentInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && departmentInput.trim()) { setProfile({ ...profile, departments: [...profile.departments, departmentInput.trim()] }); setDepartmentInput(""); } }}
                      style={{ ...DS.input(), flex: 1 }} />
                    <button onClick={() => { if (departmentInput.trim()) { setProfile({ ...profile, departments: [...profile.departments, departmentInput.trim()] }); setDepartmentInput(""); } }}
                      style={DS.btnPrimary({ padding: "10px 16px" })}>Add</button>
                  </div>
                )}
              </div>

              {/* Facilities */}
              <div>
                <label style={labelStyle}>Facilities</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {profile.facilities.map((fac, i) => (
                    <span key={i} style={{ ...DS.badge("green"), padding: "5px 12px" }}>
                      {fac}
                      {isEditing && (
                        <button onClick={() => setProfile({ ...profile, facilities: profile.facilities.filter((_, idx) => idx !== i) })}
                          style={{ background: "none", border: "none", color: T.green, cursor: "pointer", padding: 0, marginLeft: 4 }}>✕</button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div style={DS.row(8)}>
                    <input type="text" placeholder="Add facility (e.g. CT Scan, ICU, Blood Bank)..." value={facilityInput} onChange={e => setFacilityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && facilityInput.trim()) { setProfile({ ...profile, facilities: [...profile.facilities, facilityInput.trim()] }); setFacilityInput(""); } }}
                      style={{ ...DS.input(), flex: 1 }} />
                    <button onClick={() => { if (facilityInput.trim()) { setProfile({ ...profile, facilities: [...profile.facilities, facilityInput.trim()] }); setFacilityInput(""); } }}
                      style={DS.btnSuccess({ padding: "10px 16px" })}>Add</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
