/**
 * AppointmentsModule — Patient appointment management.
 * Extracted from PatientDashboard.jsx for single-responsibility and mobile performance.
 * Receives all state as props — no internal API calls.
 */
import { Calendar, Loader2, ChevronLeft, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const STATUS_CONFIG = {
  Confirmed:  { bg: "var(--green-light)",  color: "var(--green)",   border: "var(--green-border)",  label: "Confirmed",  dot: "🟢" },
  Pending:    { bg: "var(--amber-light)",  color: "var(--amber)",   border: "var(--amber-border)",  label: "Pending",    dot: "🟡" },
  Completed:  { bg: "var(--primary-light)",color: "var(--primary)", border: "var(--primary-border)",label: "Completed",  dot: "✅" },
  Cancelled:  { bg: "var(--red-light)",    color: "var(--red)",     border: "var(--red-border)",    label: "Cancelled",  dot: "❌" },
};

export default function AppointmentsModule({
  appointments = [],
  loading = false,
  rescheduleTarget,
  rescheduleForm,
  setRescheduleTarget,
  setRescheduleForm,
  onBack,
  onReschedule,
  onCancel,
}) {
  const inputStyle = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)", padding: "10px 13px", color: "var(--text)",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  };

  return (
    <div className="fade-up" style={{ textAlign: "left", marginBottom: 40 }}>
      {/* Header */}
      <button onClick={onBack} className="back-btn">
        <ChevronLeft size={14} /> Back to Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 28, color: "var(--text)", margin: 0 }}>📅 My Appointments</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "6px 0 0" }}>
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} · {appointments.filter(a => a.status !== "Cancelled" && a.status !== "Completed").length} active
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "20px 0 24px" }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your appointments…</p>
        </div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <Calendar size={40} style={{ margin: "0 auto 16px", display: "block", color: "var(--text-muted)", opacity: 0.4 }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>No appointments yet.</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "6px 0 0" }}>Go to <strong>Find Doctors</strong> to book one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {appointments.map(apt => {
            const statusCfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.Pending;
            return (
              <div key={apt.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "20px 24px",
                borderLeft: `4px solid ${statusCfg.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                      Dr. {apt.doctor_name || apt.doctor_id?.slice(-6)}
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={11} /> {apt.date}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={11} /> {apt.time_slot}
                      </span>
                    </div>
                    {apt.reason && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>Reason: {apt.reason}</div>}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{
                      background: statusCfg.bg, color: statusCfg.color,
                      border: `1px solid ${statusCfg.border}`,
                      padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                    }}>
                      {statusCfg.dot} {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setRescheduleTarget(rescheduleTarget === apt.id ? null : apt.id)}
                      style={{
                        padding: "8px 14px", background: "var(--primary-light)",
                        border: "1px solid var(--primary-border)", color: "var(--primary)",
                        borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                      }}
                    >
                      <RefreshCw size={11} /> Reschedule
                    </button>
                    <button
                      onClick={() => onCancel(apt.id)}
                      style={{
                        padding: "8px 14px", background: "var(--red-light)",
                        border: "1px solid var(--red-border)", color: "var(--red)",
                        borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                      }}
                    >
                      <XCircle size={11} /> Cancel
                    </button>
                  </div>
                )}

                {/* Reschedule form */}
                {rescheduleTarget === apt.id && (
                  <form onSubmit={onReschedule} style={{
                    marginTop: 16, padding: 16, background: "var(--surface-alt)",
                    borderRadius: "var(--radius-md)", border: "1px solid var(--primary-border)",
                    display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end",
                  }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>NEW DATE</label>
                      <input
                        type="date" required
                        value={rescheduleForm.new_date}
                        onChange={e => setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>NEW TIME SLOT</label>
                      <input
                        type="text" required placeholder="10:00 AM"
                        value={rescheduleForm.new_time_slot}
                        onChange={e => setRescheduleForm({ ...rescheduleForm, new_time_slot: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" className="btn-primary" style={{ padding: "10px 16px" }}>
                        <CheckCircle2 size={12} /> Confirm
                      </button>
                      <button type="button" onClick={() => setRescheduleTarget(null)} className="btn-ghost" style={{ padding: "10px 14px" }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
