import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import {
  LogOut, Activity, Users, Stethoscope, Hospital, Calendar,
  CheckCircle2, XCircle, Clock, BarChart3, RefreshCw,
  Search, ChevronDown, ShieldCheck, AlertTriangle, TrendingUp
} from "lucide-react";

const API = "http://localhost:8000";

function useAdminAPI() {
  const token = localStorage.getItem("sehat_sathi_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const get = useCallback(async (path) => {
    const res = await fetch(`${API}${path}`, { headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }, [token]);

  const put = useCallback(async (path, body) => {
    const res = await fetch(`${API}${path}`, { method: "PUT", headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }, [token]);

  return { get, put };
}

// ─── STAT CARD ─────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, gradient }) {
  return (
    <div style={{
      background: gradient || "#0b1329",
      border: `1px solid ${color}20`,
      borderRadius: 16, padding: "22px 24px",
      display: "flex", alignItems: "center", gap: 16
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: color, fontWeight: 700, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── VERIFICATION CARD ─────────────────────────────────────
function VerifyCard({ item, type, onAction }) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onAction(item.id, "approve", "");
    setLoading(false);
  };

  const handleReject = async () => {
    if (!reason.trim()) return alert("Please provide a rejection reason.");
    setLoading(true);
    await onAction(item.id, "reject", reason);
    setLoading(false);
    setShowReject(false);
  };

  return (
    <div style={{ background: "#0b1329", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.name}</span>
            <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>PENDING</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{item.email}</div>
          {item.specialty && <div style={{ fontSize: 11, color: "#60a5fa", marginTop: 4 }}>Specialty: {item.specialty}</div>}
          {item.medical_reg_number && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Reg: {item.medical_reg_number}</div>}
          {item.registration_number && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Reg: {item.registration_number}</div>}
          {item.address && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>📍 {item.address}</div>}
          {item.created_at && <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>Applied: {new Date(item.created_at).toLocaleDateString()}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleApprove}
            disabled={loading}
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <CheckCircle2 size={13} /> Approve
          </button>
          <button
            onClick={() => setShowReject(!showReject)}
            disabled={loading}
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <XCircle size={13} /> Reject
          </button>
        </div>
      </div>
      {showReject && (
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(239,68,68,0.1)", paddingTop: 12 }}>
          <input
            type="text"
            placeholder="Reason for rejection (required)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{ width: "100%", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
          />
          <button onClick={handleReject} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MINI BAR CHART ────────────────────────────────────────
function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: i === data.length - 1 ? "#3b82f6" : "rgba(37,99,235,0.3)", borderRadius: "4px 4px 0 0", height: `${Math.max((d.count / max) * 48, 3)}px`, transition: "height 0.4s ease" }} />
          <div style={{ fontSize: 8, color: "#475569", whiteSpace: "nowrap" }}>{d.date.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { get, put } = useAdminAPI();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [pendingHosps, setPendingHosps] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, docs, hosps] = await Promise.all([
        get("/admin/stats"),
        get("/admin/doctors/pending"),
        get("/admin/hospitals/pending")
      ]);
      setStats(statsData);
      setPendingDocs(docs);
      setPendingHosps(hosps);
    } catch (e) {
      showToast("Failed to load data. Check your connection.", "error");
    }
    setLoading(false);
  }, [get]);

  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (userSearch) params.append("search", userSearch);
      if (userRoleFilter) params.append("role", userRoleFilter);
      const data = await get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch (e) {
      showToast("Failed to load users.", "error");
    }
  }, [get, userSearch, userRoleFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (tab === "users") loadUsers(); }, [tab, loadUsers]);

  const handleDoctorAction = async (id, action, reason) => {
    try {
      await put(`/admin/doctors/${id}/verify`, { action, reason });
      showToast(`Doctor ${action}d successfully`);
      loadData();
    } catch (e) {
      showToast("Action failed. Try again.", "error");
    }
  };

  const handleHospitalAction = async (id, action, reason) => {
    try {
      await put(`/admin/hospitals/${id}/verify`, { action, reason });
      showToast(`Hospital ${action}d successfully`);
      loadData();
    } catch (e) {
      showToast("Action failed. Try again.", "error");
    }
  };

  const handleUserSuspend = async (id, suspend) => {
    try {
      await put(`/admin/users/${id}/${suspend ? "suspend" : "reinstate"}`, {});
      showToast(`User ${suspend ? "suspended" : "reinstated"}`);
      loadUsers();
    } catch (e) {
      showToast("Action failed.", "error");
    }
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
    { id: "doctors", label: `Doctors ${pendingDocs.length > 0 ? `(${pendingDocs.length})` : ""}`, icon: <Stethoscope size={14} /> },
    { id: "hospitals", label: `Hospitals ${pendingHosps.length > 0 ? `(${pendingHosps.length})` : ""}`, icon: <Hospital size={14} /> },
    { id: "users", label: "Users", icon: <Users size={14} /> },
  ];

  const pendingTotal = pendingDocs.length + pendingHosps.length;

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600,
          color: toast.type === "success" ? "#22c55e" : "#ef4444",
          backdropFilter: "blur(10px)", animation: "fadeUp 0.3s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          {toast.type === "success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 4%" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={16} style={{ color: "white" }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Admin Control Center</h1>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
              <strong style={{ color: "#60a5fa" }}>{user?.name}</strong> · Super Administrator
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {pendingTotal > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "8px 14px" }}>
                <AlertTriangle size={12} style={{ color: "#f59e0b" }} />
                <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>{pendingTotal} pending review{pendingTotal !== 1 ? "s" : ""}</span>
              </div>
            )}
            <button onClick={loadData} disabled={loading} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b", padding: "8px 14px", borderRadius: 10, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
            <button onClick={logout} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: 5, marginBottom: 28, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "rgba(37,99,235,0.15)" : "transparent",
              border: `1px solid ${tab === t.id ? "rgba(37,99,235,0.3)" : "transparent"}`,
              color: tab === t.id ? "#60a5fa" : "#64748b",
              padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard icon={<Users size={22} style={{ color: "#60a5fa" }} />} label="Total Users" value={stats?.users?.total ?? "—"} color="#3b82f6" />
              <StatCard icon={<Stethoscope size={22} style={{ color: "#22c55e" }} />} label="Doctors" value={stats?.users?.doctors ?? "—"} sub={`${stats?.verification?.pending_doctors ?? 0} pending`} color="#22c55e" />
              <StatCard icon={<Hospital size={22} style={{ color: "#f59e0b" }} />} label="Hospitals" value={stats?.users?.hospitals ?? "—"} sub={`${stats?.verification?.pending_hospitals ?? 0} pending`} color="#f59e0b" />
              <StatCard icon={<Calendar size={22} style={{ color: "#a78bfa" }} />} label="Appointments Today" value={stats?.appointments?.today ?? "—"} sub={`${stats?.appointments?.total ?? 0} total`} color="#a78bfa" />
              <StatCard icon={<Activity size={22} style={{ color: "#f472b6" }} />} label="Reports Analyzed" value={stats?.reports_analyzed ?? "—"} color="#f472b6" />
              <StatCard icon={<Clock size={22} style={{ color: "#fb923c" }} />} label="Pending Reviews" value={(stats?.verification?.pending_doctors ?? 0) + (stats?.verification?.pending_hospitals ?? 0)} color="#fb923c" />
            </div>

            {/* Appointment Trend */}
            {stats?.appointment_trend_7days && (
              <div style={{ background: "#0b1329", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <TrendingUp size={16} style={{ color: "#3b82f6" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Appointment Trend — Last 7 Days</span>
                </div>
                <MiniBarChart data={stats.appointment_trend_7days} />
              </div>
            )}

            {/* Role distribution */}
            {stats && (
              <div style={{ background: "#0b1329", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Platform User Distribution</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  {[
                    { label: "Patients", value: stats.users.patients, color: "#3b82f6", pct: Math.round(stats.users.patients / Math.max(stats.users.total, 1) * 100) },
                    { label: "Doctors (Approved)", value: stats.verification.approved_doctors, color: "#22c55e", pct: Math.round(stats.verification.approved_doctors / Math.max(stats.users.total, 1) * 100) },
                    { label: "Hospitals (Approved)", value: stats.verification.approved_hospitals, color: "#f59e0b", pct: Math.round(stats.verification.approved_hospitals / Math.max(stats.users.total, 1) * 100) },
                    { label: "Pending Reviews", value: (stats.verification.pending_doctors + stats.verification.pending_hospitals), color: "#fb923c", pct: null },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}20`, borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.label}</div>
                      {item.pct !== null && <div style={{ fontSize: 10, color: item.color, fontWeight: 700, marginTop: 4 }}>{item.pct}% of platform</div>}
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", marginTop: 8 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: item.color, width: `${item.pct || 0}%`, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DOCTORS TAB ── */}
        {tab === "doctors" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Stethoscope size={16} style={{ color: "#60a5fa" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Pending Doctor Verifications</h2>
              <span style={{ fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>
                {pendingDocs.length} pending
              </span>
            </div>
            {pendingDocs.length === 0 ? (
              <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "40px", textAlign: "center" }}>
                <CheckCircle2 size={32} style={{ color: "#22c55e", margin: "0 auto 12px" }} />
                <p style={{ color: "#94a3b8", fontSize: 13 }}>All doctor accounts are verified! No pending reviews.</p>
              </div>
            ) : (
              pendingDocs.map(doc => (
                <VerifyCard key={doc.id} item={doc} type="doctor" onAction={handleDoctorAction} />
              ))
            )}
          </div>
        )}

        {/* ── HOSPITALS TAB ── */}
        {tab === "hospitals" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Hospital size={16} style={{ color: "#f59e0b" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Pending Hospital Verifications</h2>
              <span style={{ fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>
                {pendingHosps.length} pending
              </span>
            </div>
            {pendingHosps.length === 0 ? (
              <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "40px", textAlign: "center" }}>
                <CheckCircle2 size={32} style={{ color: "#22c55e", margin: "0 auto 12px" }} />
                <p style={{ color: "#94a3b8", fontSize: 13 }}>All hospital accounts are verified! No pending reviews.</p>
              </div>
            ) : (
              pendingHosps.map(hosp => (
                <VerifyCard key={hosp.id} item={hosp} type="hospital" onAction={handleHospitalAction} />
              ))
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  style={{ width: "100%", background: "#0b1329", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px 10px 34px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={{ background: "#0b1329", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="">All Roles</option>
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Hospital">Hospital</option>
                <option value="Admin">Admin</option>
              </select>
              <button onClick={loadUsers} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Search
              </button>
            </div>

            <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>Showing {users.length} of {usersTotal} users</div>

            <div style={{ background: "#0b1329", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 120px 120px", padding: "12px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: 12 }}>
                {["Name", "Email", "Role", "Joined", "Actions"].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.04em" }}>{h}</div>
                ))}
              </div>
              {users.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#475569", fontSize: 13 }}>No users found.</div>
              ) : (
                users.map((u, i) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 120px 120px", padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{u.email}</div>
                    <div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
                        background: u.role === "Admin" ? "rgba(168,85,247,0.1)" : u.role === "Doctor" ? "rgba(34,197,94,0.1)" : u.role === "Hospital" ? "rgba(245,158,11,0.1)" : "rgba(96,165,250,0.1)",
                        color: u.role === "Admin" ? "#a855f7" : u.role === "Doctor" ? "#22c55e" : u.role === "Hospital" ? "#f59e0b" : "#60a5fa",
                        border: `1px solid ${u.role === "Admin" ? "rgba(168,85,247,0.2)" : u.role === "Doctor" ? "rgba(34,197,94,0.2)" : u.role === "Hospital" ? "rgba(245,158,11,0.2)" : "rgba(96,165,250,0.2)"}`
                      }}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
                    <div>
                      {u.role !== "Admin" && (
                        <button
                          onClick={() => handleUserSuspend(u.id, !u.is_active === false)}
                          style={{
                            background: u.is_active === false ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                            border: `1px solid ${u.is_active === false ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                            color: u.is_active === false ? "#22c55e" : "#ef4444",
                            padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer"
                          }}
                        >
                          {u.is_active === false ? "Reinstate" : "Suspend"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
