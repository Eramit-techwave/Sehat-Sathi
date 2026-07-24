import { useState, useEffect } from "react";
import {
  Plus, Bell, CheckCircle2, Clock, AlertCircle,
  Loader2, Search, ChevronRight, Trash2, Stethoscope,
  Pill, FlaskConical, CalendarCheck
} from "lucide-react";
import FloatingNotification from "../../components/FloatingNotification";

const API_BASE = "https://sehat-sathi-ce58.onrender.com";

const C = {
  bg: "#F8FAFC", surface: "#FFFFFF", border: "#E2E8F0",
  primary: "#1A73E8", primaryLight: "rgba(26,115,232,0.08)",
  green: "#00A651", greenLight: "rgba(0,166,81,0.08)",
  amber: "#F59E0B", amberLight: "rgba(245,158,11,0.08)",
  red: "#EF4444", redLight: "rgba(239,68,68,0.08)",
  textPrimary: "#1E293B", textSecondary: "#64748B", textMuted: "#94A3B8",
};

const FOLLOW_UP_TYPES = [
  { value: "review", label: "Review Visit", icon: Stethoscope, color: C.primary },
  { value: "medicine", label: "Medicine Reminder", icon: Pill, color: C.green },
  { value: "test", label: "Lab Test", icon: FlaskConical, color: "#8B5CF6" },
  { value: "general", label: "General Follow-up", icon: Bell, color: C.amber },
];

const EMPTY_FORM = {
  patient_id: "", patient_name: "", type: "review",
  title: "", description: "", due_date: "", due_time: "",
  prescription_id: "", appointment_id: ""
};

export default function FollowUpManager({ user }) {
  const token = localStorage.getItem("sehat_sathi_token");
  const authHeaders = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const [view, setView] = useState("create"); // "create" | "list"
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [myPatients, setMyPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  useEffect(() => { loadPatients(); }, []);
  useEffect(() => { if (view === "list") loadFollowups(); }, [view]);

  const loadPatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors/${user?.id}/patients`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setMyPatients(await res.json());
    } catch (e) { }
  };

  const loadFollowups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/followups/my`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) setFollowups(await res.json());
    } catch (e) { }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.patient_id) return showNotif("Please select a patient", "error");
    if (!form.title.trim()) return showNotif("Title is required", "error");
    if (!form.due_date) return showNotif("Due date is required", "error");

    setSaving(true);
    try {
      const payload = {
        patient_id: form.patient_id,
        type: form.type,
        title: form.title,
        description: form.description || null,
        due_date: form.due_date,
        due_time: form.due_time || null,
        prescription_id: form.prescription_id || null,
        appointment_id: form.appointment_id || null
      };
      const res = await fetch(`${API_BASE}/followups/`, {
        method: "POST", headers: authHeaders, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create follow-up");
      showNotif("Follow-up created & patient notified! 🔔");
      setForm({ ...EMPTY_FORM });
    } catch (e) { showNotif(e.message, "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/followups/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setFollowups(f => f.filter(fu => fu.id !== id));
      showNotif("Follow-up cancelled");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const filteredPatients = myPatients.filter(p =>
    patientSearch && (
      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(patientSearch.toLowerCase())
    )
  );

  const inp = {
    width: "100%", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "10px 12px", color: C.textPrimary,
    fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
  };

  const pendingCount = followups.filter(f => f.status === "pending").length;
  const overdueCount = followups.filter(f => f.is_overdue).length;

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <FloatingNotification show={notification.show} type={notification.type} text={notification.text} />

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} color={C.amber} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>Follow-up Engine</h2>
              <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>Schedule automatic reminders for your patients</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["create", "list"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: view === v ? "none" : `1px solid ${C.border}`,
                background: view === v ? C.amber : "transparent",
                color: view === v ? "#fff" : C.textSecondary,
              }}>
                {v === "create" ? "New Reminder" : `Scheduled (${pendingCount})`}
              </button>
            ))}
          </div>
        </div>

        {overdueCount > 0 && (
          <div style={{
            marginTop: 14, background: C.redLight, border: `1px solid ${C.red}`,
            borderRadius: 8, padding: "10px 14px", fontSize: 12,
            color: C.red, fontWeight: 600, display: "flex", alignItems: "center", gap: 8
          }}>
            <AlertCircle size={14} />
            {overdueCount} patient(s) have overdue follow-ups
          </div>
        )}
      </div>

      <div style={{ padding: "0 28px" }}>
        {/* ─── CREATE VIEW ──────────────────────────────────────────── */}
        {view === "create" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Patient select */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>👤 Patient</h3>
              {form.patient_id ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.primaryLight, border: `1px solid ${C.primary}`, borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ fontWeight: 600, color: C.primary, fontSize: 14 }}>✓ {form.patient_name}</span>
                  <button onClick={() => setForm(f => ({ ...f, patient_id: "", patient_name: "" }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 12 }}>Change</button>
                </div>
              ) : (
                <>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
                    <input style={{ ...inp, paddingLeft: 36 }} placeholder="Search patients..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                  </div>
                  {filteredPatients.length > 0 && (
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, marginTop: 8, overflow: "hidden", maxHeight: 200, overflowY: "auto" }}>
                      {filteredPatients.map(p => (
                        <div key={p.id} onClick={() => { setForm(f => ({ ...f, patient_id: p.id, patient_name: p.name })); setPatientSearch(""); }}
                          style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                          onMouseEnter={e => e.currentTarget.style.background = C.bg}
                          onMouseLeave={e => e.currentTarget.style.background = C.surface}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>{p.email}</div>
                          </div>
                          <ChevronRight size={13} color={C.textMuted} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Follow-up type */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>🔔 Type of Follow-up</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {FOLLOW_UP_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <button key={value} onClick={() => setForm(f => ({ ...f, type: value }))} style={{
                    padding: "12px 10px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "center",
                    background: form.type === value ? color + "15" : C.bg,
                    border: form.type === value ? `2px solid ${color}` : `1px solid ${C.border}`,
                    transition: "all 0.2s"
                  }}>
                    <Icon size={18} color={form.type === value ? color : C.textMuted} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 11, fontWeight: form.type === value ? 700 : 500, color: form.type === value ? color : C.textSecondary }}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>📋 Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 5 }}>Title *</label>
                  <input style={inp} placeholder="e.g. 'Review blood test results' or 'Take Metformin 500mg'" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 5 }}>Instructions (Optional)</label>
                  <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} placeholder="Additional details for the patient..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 5 }}>Due Date *</label>
                    <input type="date" style={inp} min={new Date().toISOString().split("T")[0]} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 5 }}>Time (Optional)</label>
                    <input type="time" style={inp} value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleCreate} disabled={saving} style={{
                padding: "12px 28px", borderRadius: 10, border: "none",
                background: C.amber, color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(245,158,11,0.25)"
              }}>
                {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <><Bell size={16} /> Schedule Follow-up</>}
              </button>
            </div>
          </div>
        )}

        {/* ─── LIST VIEW ────────────────────────────────────────────── */}
        {view === "list" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : followups.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <CalendarCheck size={40} color={C.textMuted} style={{ marginBottom: 12 }} />
                <p style={{ color: C.textSecondary, margin: 0, fontWeight: 600 }}>No follow-ups scheduled</p>
                <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>Schedule follow-ups to keep your patients on track</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {followups.map(fu => {
                  const typeConfig = FOLLOW_UP_TYPES.find(t => t.value === fu.type) || FOLLOW_UP_TYPES[3];
                  const TypeIcon = typeConfig.icon;
                  return (
                    <div key={fu.id} style={{
                      background: C.surface, border: `1px solid ${fu.is_overdue ? C.red : C.border}`,
                      borderLeft: `4px solid ${fu.is_overdue ? C.red : typeConfig.color}`,
                      borderRadius: 12, padding: 18
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 12, flex: 1 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: typeConfig.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <TypeIcon size={16} color={typeConfig.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{fu.title}</span>
                              {fu.is_overdue && (
                                <span style={{ fontSize: 10, fontWeight: 700, background: C.redLight, color: C.red, borderRadius: 5, padding: "2px 7px" }}>OVERDUE</span>
                              )}
                              <span style={{
                                fontSize: 10, fontWeight: 600,
                                background: fu.status === "completed" ? C.greenLight : C.amberLight,
                                color: fu.status === "completed" ? C.green : C.amber,
                                borderRadius: 5, padding: "2px 7px"
                              }}>{fu.status?.toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: 13, color: C.textSecondary }}>
                              Patient: <strong style={{ color: C.textPrimary }}>{fu.patient_name}</strong>
                            </div>
                            {fu.description && (
                              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{fu.description}</div>
                            )}
                            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={11} /> Due: {fu.due_date}{fu.due_time ? ` at ${fu.due_time}` : ""}
                            </div>
                          </div>
                        </div>
                        {fu.status === "pending" && (
                          <button onClick={() => handleDelete(fu.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
