import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, Loader2, LogOut, Edit2, Save, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:8000";
const inputStyle = { width: "100%", background: "#060b16", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" };

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("sehat_sathi_token");
  const authHeaders = { "Authorization": `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState("overview");
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  const [appointments, setAppointments] = useState([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ address: "", phone: "", website: "", departments: [], facilities: [] });
  const [departmentInput, setDepartmentInput] = useState("");
  const [facilityInput, setFacilityInput] = useState("");

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  useEffect(() => { loadAppointments(); loadDoctors(); loadProfile(); }, []);

  const loadAppointments = async () => {
    setAptsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/my`, { headers: authHeaders });
      if (res.ok) setAppointments(await res.json());
    } catch (e) { console.error(e); }
    finally { setAptsLoading(false); }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/appointments/doctors`);
      if (res.ok) setDoctors(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          address: data.location || "",
          phone: data.phone || "",
          website: data.website || "",
          departments: data.departments || [],
          facilities: data.facilities || []
        });
      }
    } catch (e) { console.error(e); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ phone: profile.phone, location: profile.address, departments: profile.departments, facilities: profile.facilities })
      });
      if (!res.ok) throw new Error("Save failed");
      setIsEditing(false);
      showNotif("Hospital profile updated!");
    } catch (e) { showNotif(e.message, "error"); }
    setSavingProfile(false);
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: "🏥" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "doctors", label: "Doctors", icon: "👨‍⚕️" },
    { id: "profile", label: "Profile", icon: "🏢" }
  ];

  const todayDate = new Date().toISOString().split("T")[0];
  const todayCount = appointments.filter(a => a.date === todayDate && a.status !== "Cancelled").length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const cancelledCount = appointments.filter(a => a.status === "Cancelled").length;

  const filteredApts = statusFilter === "All" ? appointments : appointments.filter(a => a.status === statusFilter);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%", position: "relative" }}>

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
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0, marginTop: 4 }}>
            <strong style={{ color: "#60a5fa" }}>{user?.name}</strong> • Hospital Authority Portal
          </p>
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
            padding: "10px 20px", borderRadius: 8, fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6
          }}>
            {tab.icon} {tab.label}
            {tab.id === "appointments" && pendingCount > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="fade-up">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
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

          {/* Recent appointments preview */}
          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px" }}>
            <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: 16 }}>Recent Appointments</h4>
            {appointments.slice(0, 5).map(apt => (
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
          <h4 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: 20 }}>Registered Doctors ({doctors.length})</h4>
          {doctors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <p>No doctors registered yet. Doctors can sign up with the Doctor role.</p>
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
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{doc.email}</div>
                  {doc.experience_years > 0 && <div style={{ fontSize: "12px", color: "#475569", marginTop: 4 }}>{doc.experience_years} years experience</div>}
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
              {savingProfile ? <Loader2 size={14} /> : isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {savingProfile ? "Saving..." : isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <div style={{ background: "#070c19", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { label: "Hospital Name", value: user?.name, readOnly: true },
                { label: "Email", value: user?.email, readOnly: true }
              ].map(f => (
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
            </div>

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
                  <input type="text" placeholder="Add department..." value={departmentInput} onChange={e => setDepartmentInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => { if (departmentInput.trim()) { setProfile({ ...profile, departments: [...profile.departments, departmentInput.trim()] }); setDepartmentInput(""); } }} style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Add</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
