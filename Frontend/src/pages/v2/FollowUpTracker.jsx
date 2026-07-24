import { useState, useEffect } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle, Loader2, Stethoscope, Pill, FlaskConical, CalendarCheck } from "lucide-react";
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

const TYPE_CONFIG = {
  review: { label: "Review Visit", icon: Stethoscope, color: C.primary },
  medicine: { label: "Medicine", icon: Pill, color: C.green },
  test: { label: "Lab Test", icon: FlaskConical, color: "#8B5CF6" },
  general: { label: "Follow-up", icon: Bell, color: C.amber },
};

export default function FollowUpTracker({ user }) {
  const token = localStorage.getItem("sehat_sathi_token");
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  useEffect(() => { loadFollowups(); }, []);

  const loadFollowups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/followups/my`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setFollowups(await res.json());
    } catch (e) { }
    finally { setLoading(false); }
  };

  const markComplete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/followups/${id}/complete`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setFollowups(fus => fus.map(f => f.id === id ? { ...f, status: "completed", is_overdue: false } : f));
      showNotif("Marked as complete! ✅");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const displayed = filter === "all"
    ? followups
    : followups.filter(f => f.status === filter || (filter === "overdue" && f.is_overdue));

  const overdueCount = followups.filter(f => f.is_overdue && f.status === "pending").length;
  const pendingCount = followups.filter(f => f.status === "pending").length;
  const completedCount = followups.filter(f => f.status === "completed").length;

  return (
    <div style={{ background: C.bg, minHeight: "100%", padding: "0 0 40px" }}>
      <FloatingNotification show={notification.show} type={notification.type} text={notification.text} />

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={18} color={C.amber} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>My Follow-ups</h2>
            <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>Reminders from your doctors</p>
          </div>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: C.amberLight, border: `1px solid ${C.amber}40`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.amber }}>{pendingCount}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.amber }}>Pending</div>
          </div>
          {overdueCount > 0 && (
            <div style={{ background: C.redLight, border: `1px solid ${C.red}40`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>{overdueCount}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.red }}>Overdue</div>
            </div>
          )}
          <div style={{ background: C.greenLight, border: `1px solid ${C.green}40`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{completedCount}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.green }}>Done</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 28px" }}>
        {/* Overdue alert */}
        {overdueCount > 0 && (
          <div style={{ background: C.redLight, border: `1px solid ${C.red}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.red, fontWeight: 600 }}>
            <AlertCircle size={16} />
            You have {overdueCount} overdue follow-up{overdueCount > 1 ? "s" : ""}. Please contact your doctor.
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { key: "pending", label: "Upcoming" },
            { key: "overdue", label: "Overdue" },
            { key: "completed", label: "Completed" },
            { key: "all", label: "All" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer",
              background: filter === key ? C.amber : C.surface,
              border: filter === key ? "none" : `1px solid ${C.border}`,
              color: filter === key ? "#fff" : C.textSecondary,
            }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
            <CalendarCheck size={36} color={C.textMuted} style={{ marginBottom: 12 }} />
            <p style={{ color: C.textSecondary, margin: 0, fontWeight: 600 }}>
              {filter === "completed" ? "No completed follow-ups yet" : "No follow-ups here"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
            {displayed.map(fu => {
              const config = TYPE_CONFIG[fu.type] || TYPE_CONFIG.general;
              const Icon = config.icon;
              return (
                <div key={fu.id} style={{
                  background: C.surface, borderRadius: 12, padding: 18,
                  border: `1px solid ${fu.is_overdue ? C.red : C.border}`,
                  borderLeft: `4px solid ${fu.is_overdue ? C.red : config.color}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 12, flex: 1 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: config.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} color={config.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{fu.title}</span>
                          {fu.is_overdue && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: C.redLight, color: C.red, borderRadius: 5, padding: "2px 7px" }}>OVERDUE</span>
                          )}
                        </div>
                        {fu.description && (
                          <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>{fu.description}</div>
                        )}
                        <div style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={11} />
                          {fu.due_date}{fu.due_time ? ` at ${fu.due_time}` : ""}
                          {fu.doctor_name && ` · Dr. ${fu.doctor_name}`}
                        </div>
                      </div>
                    </div>
                    {fu.status === "pending" && (
                      <button onClick={() => markComplete(fu.id)} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 8, border: "none",
                        background: C.green, color: "#fff",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
                      }}>
                        <CheckCircle2 size={13} /> Done
                      </button>
                    )}
                    {fu.status === "completed" && (
                      <span style={{ fontSize: 12, color: C.green, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
