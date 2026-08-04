import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import {
  LogOut, Activity, Users, Stethoscope, Hospital, Calendar,
  CheckCircle2, XCircle, Clock, BarChart3, RefreshCw,
  Search, ShieldCheck, AlertTriangle, TrendingUp,
  Trash2, Zap, Award, Building2
} from "lucide-react";
import DS from "../ui/design-system";
import T from "../ui/tokens";

import { API_BASE as API } from "../api/client";

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

  const del = useCallback(async (path) => {
    const res = await fetch(`${API}${path}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }, [token]);

  return { get, put, del };
}

// ─── STAT CARD ─────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={DS.statCard(color)}>
      <div style={DS.statIcon(color)}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color, fontWeight: 700, marginTop: 3 }}>{sub}</div>}
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
    <div style={{ ...DS.card(), marginBottom: 12 }}>
      <div style={DS.between()}>
        <div style={{ flex: 1 }}>
          <div style={DS.row(8, { marginBottom: 4 })}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{item.name}</span>
            <span style={DS.badge("amber")}>PENDING</span>
          </div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{item.email}</div>
          {item.specialty && <div style={{ fontSize: 11, color: T.primary, marginTop: 4 }}>Specialty: {item.specialty}</div>}
          {item.medical_reg_number && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Reg: {item.medical_reg_number}</div>}
          {item.registration_number && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Reg: {item.registration_number}</div>}
          {item.address && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>📍 {item.address}</div>}
          {item.created_at && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>Applied: {new Date(item.created_at).toLocaleDateString()}</div>}
        </div>
        <div style={DS.row(8, { flexShrink: 0 })}>
          <button onClick={handleApprove} disabled={loading} style={DS.btnSuccess()}>
            <CheckCircle2 size={13} /> Approve
          </button>
          <button onClick={() => setShowReject(!showReject)} disabled={loading} style={DS.btnDanger()}>
            <XCircle size={13} /> Reject
          </button>
        </div>
      </div>
      {showReject && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${T.redBorder}`, paddingTop: 12 }}>
          <input
            type="text"
            placeholder="Reason for rejection (required)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{ ...DS.input(), marginBottom: 8 }}
          />
          <button onClick={handleReject} style={DS.btnDanger()}>
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MINI BAR CHART ────────────────────────────────────────
function MiniBarChart({ data, labelKey = "date", color = T.primary }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%",
            background: i === data.length - 1 ? color : `${color}55`,
            borderRadius: "3px 3px 0 0",
            height: `${Math.max((d.count / max) * 50, d.count > 0 ? 3 : 0)}px`,
            transition: "height 0.4s ease"
          }} />
          <div style={{ fontSize: 7, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", textAlign: "center" }}>
            {d[labelKey] ? d[labelKey].slice(-5) : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DELETE CONFIRMATION MODAL ──────────────────────────────
function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const isReady = confirmText === "DELETE";

  const handleConfirm = async () => {
    if (!isReady) return;
    setLoading(true);
    await onConfirm(user.id);
    setLoading(false);
  };

  const roleColors = { Patient: T.primary, Doctor: T.green, Hospital: T.amber };

  return (
    <div style={DS.modalOverlay()} onClick={onCancel}>
      <div style={DS.modal({ maxWidth: 420 })} onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={DS.iconCircle(T.red, 56)}>
            <Trash2 size={24} style={{ color: T.red }} />
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, textAlign: "center", marginBottom: 8 }}>
          Permanently Delete Account
        </h3>
        <p style={{ fontSize: 12, color: T.textSecondary, textAlign: "center", lineHeight: 1.6, marginBottom: 20 }}>
          This action <strong style={{ color: T.red }}>cannot be undone</strong>. All data including
          appointments, reports, and notifications will be permanently erased.
        </p>

        {/* User info */}
        <div style={{ background: T.redLight, border: `1px solid ${T.redBorder}`, borderRadius: T.radiusMd, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>{user.email}</div>
          <span style={DS.badge(user.role === "Doctor" ? "green" : user.role === "Hospital" ? "amber" : "blue")}>
            {user.role}
          </span>
        </div>

        {/* Type DELETE */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: T.red, fontWeight: 700, display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>
            TYPE "DELETE" TO CONFIRM
          </label>
          <input
            type="text"
            placeholder="DELETE"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            style={{
              ...DS.input(),
              border: `1px solid ${isReady ? T.red : T.redBorder}`,
              fontFamily: "monospace",
              letterSpacing: "0.08em",
            }}
          />
        </div>

        <div style={DS.row(10)}>
          <button onClick={onCancel} style={{ ...DS.btnGhost(), flex: 1, justifyContent: "center" }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isReady || loading}
            style={{
              ...DS.btnDanger(),
              flex: 1,
              justifyContent: "center",
              opacity: !isReady || loading ? 0.5 : 1,
              cursor: !isReady || loading ? "not-allowed" : "pointer",
            }}
          >
            <Trash2 size={13} />
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HORIZONTAL BAR ────────────────────────────────────────
function HBar({ label, value, max, color, suffix = "" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={DS.between({ marginBottom: 4 })}>
        <span style={{ fontSize: 12, color: T.textSecondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700, flexShrink: 0 }}>{value}{suffix}</span>
      </div>
      <div style={DS.progressTrack()}>
        <div style={DS.progressFill(pct, color)} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { get, put, del } = useAdminAPI();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsView, setAnalyticsView] = useState("daily");
  const [pendingDocs, setPendingDocs] = useState([]);
  const [pendingHosps, setPendingHosps] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, docs, hosps, analyticsData] = await Promise.all([
        get("/admin/stats"),
        get("/admin/doctors/pending"),
        get("/admin/hospitals/pending"),
        get("/admin/booking-analytics")
      ]);
      setStats(statsData);
      setPendingDocs(docs);
      setPendingHosps(hosps);
      setAnalytics(analyticsData);
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

  const handleDeleteConfirm = async (userId) => {
    try {
      await del(`/admin/users/${userId}`);
      showToast("Account permanently deleted.", "success");
      setDeleteTarget(null);
      loadUsers();
    } catch (e) {
      showToast("Deletion failed. Try again.", "error");
      setDeleteTarget(null);
    }
  };

  const TABS = [
    { id: "overview",   label: "Overview",   icon: <BarChart3 size={14} /> },
    { id: "doctors",   label: `Doctors${pendingDocs.length > 0 ? ` (${pendingDocs.length})` : ""}`,   icon: <Stethoscope size={14} /> },
    { id: "hospitals", label: `Hospitals${pendingHosps.length > 0 ? ` (${pendingHosps.length})` : ""}`, icon: <Hospital size={14} /> },
    { id: "users",     label: "Users",       icon: <Users size={14} /> },
  ];

  const pendingTotal = pendingDocs.length + pendingHosps.length;

  const getChartData = () => {
    if (!analytics) return [];
    if (analyticsView === "daily")   return analytics.daily_bookings?.slice(-14) || [];
    if (analyticsView === "weekly")  return analytics.weekly_bookings || [];
    if (analyticsView === "monthly") return analytics.monthly_bookings || [];
    return [];
  };

  const chartLabelKey = analyticsView === "daily" ? "date" : analyticsView === "weekly" ? "week" : "month";

  const roleColorMap = { Patient: T.primary, Doctor: T.green, Hospital: T.amber, Admin: T.purple };

  return (
    <div style={DS.page()}>
      {/* TOAST */}
      {toast && (
        <div style={DS.toast(toast.type)}>
          {toast.type === "success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={DS.container()}>
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div style={DS.between({ marginBottom: 32 })}>
          <div>
            <div style={DS.row(10, { marginBottom: 4 })}>
              <div style={{
                width: 36, height: 36, borderRadius: T.radiusMd,
                background: `linear-gradient(135deg, ${T.purple}, #7c3aed)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 12px ${T.purple}30`
              }}>
                <ShieldCheck size={18} style={{ color: "white" }} />
              </div>
              <h1 style={DS.sectionTitle({ fontSize: 22, fontWeight: 800 })}>Admin Control Center</h1>
            </div>
            <p style={DS.sectionSub()}>
              <strong style={{ color: T.purple }}>{user?.name}</strong> · Super Administrator
            </p>
          </div>
          <div style={DS.row(10)}>
            {pendingTotal > 0 && (
              <div style={{ ...DS.badge("amber"), padding: "8px 14px", fontSize: 12 }}>
                <AlertTriangle size={12} />
                {pendingTotal} pending review{pendingTotal !== 1 ? "s" : ""}
              </div>
            )}
            <button onClick={loadData} disabled={loading} style={DS.btnGhost()}>
              <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
            <button onClick={logout} style={DS.btnDanger()}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* ── TABS ──────────────────────────────────────────────── */}
        <div style={DS.tabBar()}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={DS.tab(tab === t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                          */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div>
            {/* Stats Grid */}
            <div style={DS.grid4({ marginBottom: 24 })}>
              <StatCard icon={<Users size={22} style={{ color: T.primary }} />} label="Total Users" value={stats?.users?.total ?? "—"} color={T.primary} />
              <StatCard icon={<Stethoscope size={22} style={{ color: T.green }} />} label="Doctors" value={stats?.users?.doctors ?? "—"} sub={`${stats?.verification?.pending_doctors ?? 0} pending`} color={T.green} />
              <StatCard icon={<Hospital size={22} style={{ color: T.amber }} />} label="Hospitals" value={stats?.users?.hospitals ?? "—"} sub={`${stats?.verification?.pending_hospitals ?? 0} pending`} color={T.amber} />
              <StatCard icon={<Calendar size={22} style={{ color: T.purple }} />} label="Appointments Today" value={stats?.appointments?.today ?? "—"} sub={`${stats?.appointments?.total ?? 0} total`} color={T.purple} />
              <StatCard icon={<Activity size={22} style={{ color: T.cyan }} />} label="Reports Analyzed" value={stats?.reports_analyzed ?? "—"} color={T.cyan} />
              <StatCard icon={<Clock size={22} style={{ color: T.amber }} />} label="Pending Reviews" value={(stats?.verification?.pending_doctors ?? 0) + (stats?.verification?.pending_hospitals ?? 0)} color={T.amber} />
            </div>

            {/* ── BOOKING ANALYTICS ── */}
            {analytics && (
              <div style={{ marginBottom: 24 }}>
                {/* Analytics header */}
                <div style={DS.row(8, { marginBottom: 16 })}>
                  <div style={DS.iconCircle(T.amber, 32)}>
                    <Zap size={16} style={{ color: T.amber }} />
                  </div>
                  <span style={DS.sectionTitle()}>Booking Analytics</span>
                  <span style={DS.badge("gray")}>
                    {analytics.summary?.total_analyzed ?? 0} appointments analyzed
                  </span>
                </div>

                {/* Summary Cards */}
                <div style={DS.grid4({ marginBottom: 20 })}>
                  {[
                    { label: "⚡ PEAK BOOKING TIME", value: analytics.summary?.peak_hour || "N/A", sub: "Highest appointment demand", color: T.amber },
                    { label: "🎯 MOST BOOKED SLOT",  value: analytics.summary?.most_booked_slot || "N/A", sub: "Top time slot by bookings", color: T.primary },
                    { label: "📅 TODAY'S BOOKINGS",  value: stats?.appointments?.today ?? 0, sub: "Appointments scheduled today", color: T.green },
                    { label: "📊 TOTAL BOOKINGS",    value: analytics.summary?.total_analyzed ?? 0, sub: "All-time appointments", color: T.purple },
                  ].map((item, i) => (
                    <div key={i} style={DS.card()}>
                      <div style={{ fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>{item.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Booking Trend Chart */}
                <div style={DS.card({ marginBottom: 20 })}>
                  <div style={DS.between({ marginBottom: 18 })}>
                    <div style={DS.row(8)}>
                      <TrendingUp size={15} style={{ color: T.primary }} />
                      <span style={DS.sectionTitle({ fontSize: 13 })}>Booking Trends</span>
                    </div>
                    <div style={DS.row(4)}>
                      {["daily", "weekly", "monthly"].map(v => (
                        <button key={v} onClick={() => setAnalyticsView(v)} style={DS.tab(analyticsView === v, { padding: "5px 12px", fontSize: 11 })}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <MiniBarChart data={getChartData()} labelKey={chartLabelKey} color={T.primary} />
                </div>

                {/* Peak Hours + Top Slots */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={DS.card()}>
                    <div style={DS.row(6, { marginBottom: 14 })}>
                      <Clock size={13} style={{ color: T.amber }} />
                      <span style={DS.sectionTitle({ fontSize: 12 })}>Peak Booking Hours</span>
                    </div>
                    {(analytics.peak_hours || []).length === 0
                      ? <div style={{ fontSize: 12, color: T.textMuted }}>No data yet</div>
                      : (analytics.peak_hours || []).map((h, i) => (
                        <HBar key={i} label={h.hour} value={h.count} max={analytics.peak_hours[0]?.count || 1} color={T.amber} suffix=" bookings" />
                      ))
                    }
                  </div>
                  <div style={DS.card()}>
                    <div style={DS.row(6, { marginBottom: 14 })}>
                      <Calendar size={13} style={{ color: T.primary }} />
                      <span style={DS.sectionTitle({ fontSize: 12 })}>Most Booked Slots</span>
                    </div>
                    {(analytics.most_booked_slots || []).length === 0
                      ? <div style={{ fontSize: 12, color: T.textMuted }}>No data yet</div>
                      : (analytics.most_booked_slots || []).map((s, i) => (
                        <HBar key={i} label={s.slot} value={s.count} max={analytics.most_booked_slots[0]?.count || 1} color={T.primary} suffix=" bookings" />
                      ))
                    }
                  </div>
                </div>

                {/* Top Doctors + Top Hospitals */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={DS.card()}>
                    <div style={DS.row(6, { marginBottom: 14 })}>
                      <Award size={13} style={{ color: T.green }} />
                      <span style={DS.sectionTitle({ fontSize: 12 })}>Most Active Doctors</span>
                    </div>
                    {(analytics.most_active_doctors || []).length === 0
                      ? <div style={{ fontSize: 12, color: T.textMuted }}>No data yet</div>
                      : (analytics.most_active_doctors || []).map((d, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "8px 10px", background: T.greenLight, borderRadius: T.radiusSm }}>
                          <div>
                            <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600 }}>{d.name}</div>
                            <div style={{ fontSize: 10, color: T.textMuted }}>{d.specialty}</div>
                          </div>
                          <div style={{ fontSize: 13, color: T.green, fontWeight: 700 }}>{d.appointments}</div>
                        </div>
                      ))
                    }
                  </div>
                  <div style={DS.card()}>
                    <div style={DS.row(6, { marginBottom: 14 })}>
                      <Building2 size={13} style={{ color: T.amber }} />
                      <span style={DS.sectionTitle({ fontSize: 12 })}>Most Active Hospitals</span>
                    </div>
                    {(analytics.most_active_hospitals || []).length === 0
                      ? <div style={{ fontSize: 12, color: T.textMuted }}>No data yet</div>
                      : (analytics.most_active_hospitals || []).map((h, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "8px 10px", background: T.amberLight, borderRadius: T.radiusSm }}>
                          <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600 }}>{h.name}</div>
                          <div style={{ fontSize: 13, color: T.amber, fontWeight: 700 }}>{h.appointments}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Trend (last 7 days) */}
            {stats?.appointment_trend_7days && (
              <div style={DS.card({ marginBottom: 24 })}>
                <div style={DS.row(8, { marginBottom: 20 })}>
                  <TrendingUp size={16} style={{ color: T.primary }} />
                  <span style={DS.sectionTitle({ fontSize: 13 })}>Appointment Trend — Last 7 Days</span>
                </div>
                <MiniBarChart data={stats.appointment_trend_7days} labelKey="date" color={T.primary} />
              </div>
            )}

            {/* User Distribution */}
            {stats && (
              <div style={DS.card()}>
                <div style={DS.sectionTitle({ marginBottom: 16 })}>Platform User Distribution</div>
                <div style={DS.grid4()}>
                  {[
                    { label: "Patients", value: stats.users.patients, color: T.primary, pct: Math.round(stats.users.patients / Math.max(stats.users.total, 1) * 100) },
                    { label: "Doctors (Approved)", value: stats.verification.approved_doctors, color: T.green, pct: Math.round(stats.verification.approved_doctors / Math.max(stats.users.total, 1) * 100) },
                    { label: "Hospitals (Approved)", value: stats.verification.approved_hospitals, color: T.amber, pct: Math.round(stats.verification.approved_hospitals / Math.max(stats.users.total, 1) * 100) },
                    { label: "Pending Reviews", value: (stats.verification.pending_doctors + stats.verification.pending_hospitals), color: T.red, pct: null },
                  ].map((item, i) => (
                    <div key={i} style={{ background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: T.radiusMd, padding: "14px 16px" }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.label}</div>
                      {item.pct !== null && <div style={{ fontSize: 10, color: item.color, fontWeight: 700, marginTop: 4 }}>{item.pct}% of platform</div>}
                      <div style={DS.progressTrack({ marginTop: 8 })}>
                        <div style={DS.progressFill(item.pct || 0, item.color)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* DOCTORS TAB                                           */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "doctors" && (
          <div>
            <div style={DS.row(10, { marginBottom: 20 })}>
              <div style={DS.iconCircle(T.green, 36)}>
                <Stethoscope size={16} style={{ color: T.green }} />
              </div>
              <h2 style={DS.sectionTitle()}>Pending Doctor Verifications</h2>
              <span style={DS.badge("amber")}>{pendingDocs.length} pending</span>
            </div>
            {pendingDocs.length === 0 ? (
              <div style={DS.emptyState()}>
                <CheckCircle2 size={36} style={{ color: T.green, margin: "0 auto 12px", display: "block" }} />
                <p style={{ color: T.textMuted, fontSize: 13 }}>All doctor accounts are verified! No pending reviews.</p>
              </div>
            ) : (
              pendingDocs.map(doc => (
                <VerifyCard key={doc.id} item={doc} type="doctor" onAction={handleDoctorAction} />
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* HOSPITALS TAB                                         */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "hospitals" && (
          <div>
            <div style={DS.row(10, { marginBottom: 20 })}>
              <div style={DS.iconCircle(T.amber, 36)}>
                <Hospital size={16} style={{ color: T.amber }} />
              </div>
              <h2 style={DS.sectionTitle()}>Pending Hospital Verifications</h2>
              <span style={DS.badge("amber")}>{pendingHosps.length} pending</span>
            </div>
            {pendingHosps.length === 0 ? (
              <div style={DS.emptyState()}>
                <CheckCircle2 size={36} style={{ color: T.green, margin: "0 auto 12px", display: "block" }} />
                <p style={{ color: T.textMuted, fontSize: 13 }}>All hospital accounts are verified! No pending reviews.</p>
              </div>
            ) : (
              pendingHosps.map(hosp => (
                <VerifyCard key={hosp.id} item={hosp} type="hospital" onAction={handleHospitalAction} />
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* USERS TAB                                             */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "users" && (
          <div>
            {/* Search & Filter Bar */}
            <div style={DS.row(12, { marginBottom: 20, flexWrap: "wrap" })}>
              <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  style={{ ...DS.input(), paddingLeft: 36 }}
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                style={{ ...DS.select(), width: 160 }}
              >
                <option value="">All Roles</option>
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Hospital">Hospital</option>
                <option value="Admin">Admin</option>
              </select>
              <button onClick={loadUsers} style={DS.btnPrimary({ padding: "11px 22px" })}>
                Search
              </button>
            </div>

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>
              Showing {users.length} of {usersTotal} users
            </div>

            {/* Users Table */}
            <div style={DS.tableWrapper()}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 110px 100px 200px",
                padding: "12px 20px",
                background: T.surfaceAlt,
                borderBottom: `1px solid ${T.border}`,
                gap: 12
              }}>
                {["Name", "Email", "Role", "Joined", "Actions"].map((h, i) => (
                  <div key={i} style={DS.tableHeader()}>{h}</div>
                ))}
              </div>
              {users.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
                  No users found.
                </div>
              ) : (
                users.map((u, i) => {
                  const rc = roleColorMap[u.role] || T.primary;
                  return (
                    <div key={u.id} style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 110px 100px 200px",
                      padding: "14px 20px",
                      borderBottom: i < users.length - 1 ? `1px solid ${T.surfaceAlt}` : "none",
                      gap: 12,
                      alignItems: "center",
                    }}>
                      <div style={DS.row(8)}>
                        {u.profile_photo_url ? (
                          <img src={`${API}${u.profile_photo_url}`} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={DS.avatar(32, rc)}>
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600 }}>{u.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted }}>{u.email}</div>
                      <div>
                        <span style={DS.badge(u.role === "Admin" ? "purple" : u.role === "Doctor" ? "green" : u.role === "Hospital" ? "amber" : "blue")}>
                          {u.role}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
                      <div style={DS.row(6)}>
                        {u.role !== "Admin" && (
                          <>
                            <button
                              onClick={() => handleUserSuspend(u.id, !u.is_active === false)}
                              style={u.is_active === false ? DS.btnSuccess({ padding: "5px 10px", fontSize: 11 }) : DS.btnDanger({ padding: "5px 10px", fontSize: 11 })}
                            >
                              {u.is_active === false ? "Reinstate" : "Suspend"}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              style={DS.btnDanger({ padding: "5px 8px", fontSize: 11 })}
                              title="Delete Account"
                            >
                              <Trash2 size={11} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
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
