/**
 * AppointmentsModule — Patient appointment management.
 * Extracted from PatientDashboard.jsx for single-responsibility and mobile performance.
 * Receives all state as props — no internal API calls.
 */
import { useState } from "react";
import { Calendar, Loader2, ChevronLeft, Clock, CheckCircle2, XCircle, RefreshCw, FileText, Video, MessageSquare, Trash2 } from "lucide-react";
import PaymentInvoiceModal from "../../components/PaymentInvoiceModal";
import VideoCallModal from "../../components/VideoCallModal";
import DoctorDirectChatModal from "../../components/DoctorDirectChatModal";
import { useTelehealthBridge } from "../../context/TelehealthBridgeContext";

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
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeVideoApt, setActiveVideoApt] = useState(null);
  const [activeChatApt, setActiveChatApt] = useState(null);
  const { initiateCall = () => {}, openChat = () => {} } = useTelehealthBridge() || {};

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--surface)",
    color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit"
  };

  const activeApts = appointments.filter(a => a.status !== "Cancelled" && a.status !== "Completed");
  const completedApts = appointments.filter(a => a.status === "Completed");
  const cancelledApts = appointments.filter(a => a.status === "Cancelled");

  const displayList = activeTab === "active"
    ? activeApts
    : activeTab === "completed"
    ? completedApts
    : cancelledApts;

  const handleClearAllCancelled = () => {
    if (window.confirm("Are you sure you want to clear all cancelled appointment slots?")) {
      cancelledApts.forEach(apt => onDelete && onDelete(apt.id || apt._id || apt.appointment_id));
    }
  };

  return (
    <div className="fade-up" style={{ textAlign: "left", marginBottom: 40 }}>
      {/* Header */}
      <button onClick={onBack} className="back-btn">
        <ChevronLeft size={14} /> Back to Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 28, color: "var(--text)", margin: 0 }}>📅 My Appointments</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "6px 0 0" }}>
            {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>

        {activeTab === "cancelled" && cancelledApts.length > 0 && (
          <button
            onClick={handleClearAllCancelled}
            style={{
              padding: "8px 16px", background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)", color: "#DC2626",
              borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit"
            }}
          >
            <Trash2 size={13} /> Clear All Cancelled Slots
          </button>
        )}
      </div>

      {/* ── SEPARATE TABS FOR UNCLUTTERED UX ─────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10, overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: activeTab === "active" ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "var(--surface-alt)",
            color: activeTab === "active" ? "#FFF" : "var(--text-secondary)",
            border: activeTab === "active" ? "none" : "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit"
          }}
        >
          🟢 Active Appointments ({activeApts.length})
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          style={{
            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: activeTab === "completed" ? "linear-gradient(135deg, #059669, #10B981)" : "var(--surface-alt)",
            color: activeTab === "completed" ? "#FFF" : "var(--text-secondary)",
            border: activeTab === "completed" ? "none" : "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit"
          }}
        >
          ✅ Completed ({completedApts.length})
        </button>

        <button
          onClick={() => setActiveTab("cancelled")}
          style={{
            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: activeTab === "cancelled" ? "linear-gradient(135deg, #DC2626, #B91C1C)" : "var(--surface-alt)",
            color: activeTab === "cancelled" ? "#FFF" : "var(--text-secondary)",
            border: activeTab === "cancelled" ? "none" : "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit"
          }}
        >
          ❌ Cancelled Slots ({cancelledApts.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your appointments…</p>
        </div>
      ) : displayList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <Calendar size={40} style={{ margin: "0 auto 16px", display: "block", color: "var(--text-muted)", opacity: 0.4 }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            {activeTab === "active" ? "No active appointments currently." : activeTab === "completed" ? "No completed consultations." : "No cancelled slots in history."}
          </p>
          {activeTab === "active" && (
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "6px 0 0" }}>Go to <strong>Find Doctors</strong> to book one.</p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayList.map(apt => {
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
                      {apt.doctor_name ? (apt.doctor_name.startsWith("Dr.") ? apt.doctor_name : `Dr. ${apt.doctor_name}`) : "Dr. Health Specialist"}
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
                    
                    {/* Payment Status & Details */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap", fontSize: 11 }}>
                      <span style={{
                        background: apt.payment_status === "Paid" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                        color: apt.payment_status === "Paid" ? "#059669" : "#D97706",
                        border: `1px solid ${apt.payment_status === "Paid" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                        padding: "2px 8px", borderRadius: 100, fontWeight: 700,
                      }}>
                        💳 {apt.payment_status || "Paid"} ({apt.payment_method?.toUpperCase() || "UPI"})
                      </span>
                      {apt.amount > 0 && <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Amount: ₹{apt.amount}</span>}
                      {apt.transaction_id && <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>ID: {apt.transaction_id}</span>}
                    </div>
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
                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setSelectedInvoice({
                      invoice_number: `INV-2026-${(apt.id || "8924").slice(-5)}`,
                      patient_name: apt.patient_name || "Patient",
                      doctor_name: apt.doctor_name || "Dr. Specialist",
                      doctor_specialization: apt.doctor_specialty || "Consultant Physician",
                      hospital_name: apt.hospital_name || "Sehat-Sathi Partnered Clinic",
                      service_name: "Doctor Consultation & Health Guidance",
                      base_amount: apt.amount || 500,
                      tax_amount: Math.round((apt.amount || 500) * 0.18),
                      discount: 0,
                      total_amount: Math.round((apt.amount || 500) * 1.18),
                      payment_method: (apt.payment_method || "UPI").toUpperCase(),
                      payment_status: apt.payment_status || "Paid",
                      reference_number: apt.transaction_id || `SS-PAY-${(apt.id || "8924").slice(-6)}`,
                      created_at: apt.created_at || apt.date
                    })}
                    style={{
                      padding: "9px 16px", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                      border: "1px solid #334155", color: "#38BDF8",
                      borderRadius: "10px", fontSize: 12.5, fontWeight: 800, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)", transition: "all 0.15s ease"
                    }}
                  >
                    <FileText size={15} style={{ color: "#38BDF8" }} /> 📄 Download PDF Invoice Slip
                  </button>

                  {apt.status !== "Cancelled" && (
                    <>
                      <button
                        onClick={() => initiateCall({
                          callerRole: "Patient",
                          callerName: apt.patient_name || "Patient",
                          recipientName: apt.doctor_name || "Doctor",
                          doctor: { name: apt.doctor_name || "Doctor" },
                          appointment: apt
                        })}
                        style={{
                          padding: "8px 14px", background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                          border: "none", color: "#FFFFFF",
                          borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                          boxShadow: "0 4px 12px rgba(37,99,235,0.2)"
                        }}
                      >
                        <Video size={13} /> Start Video Call
                      </button>

                      <button
                        onClick={() => openChat({
                          doctor: { name: apt.doctor_name || "Doctor" },
                          appointment: apt
                        })}
                        style={{
                          padding: "8px 14px", background: "rgba(139,92,246,0.12)",
                          border: "1px solid rgba(139,92,246,0.3)", color: "#7C3AED",
                          borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                        }}
                      >
                        <MessageSquare size={13} /> Direct SMS / Chat
                      </button>
                    </>
                  )}

                  {apt.status !== "Cancelled" && apt.status !== "Completed" && (
                    <>
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
                    </>
                  )}

                  {apt.status === "Cancelled" && (
                    <button
                      onClick={() => onDelete && onDelete(apt.id || apt._id || apt.appointment_id)}
                      style={{
                        padding: "8px 14px", background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.3)", color: "#DC2626",
                        borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                        boxShadow: "0 2px 8px rgba(220,38,38,0.15)"
                      }}
                    >
                      <Trash2 size={13} /> Delete Appointment
                    </button>
                  )}
                </div>

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
                        value={rescheduleForm?.new_date || ""}
                        onChange={e => setRescheduleForm && setRescheduleForm({ ...(rescheduleForm || {}), new_date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>NEW TIME SLOT</label>
                      <input
                        type="text" required placeholder="10:00 AM"
                        value={rescheduleForm?.new_time_slot || ""}
                        onChange={e => setRescheduleForm && setRescheduleForm({ ...(rescheduleForm || {}), new_time_slot: e.target.value })}
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

      {/* ── PAYMENT INVOICE RECEIPT MODAL ────────────────────── */}
      {selectedInvoice && (
        <PaymentInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* ── TELEHEALTH LIVE VIDEO CALL MODAL ─────────────────── */}
      {activeVideoApt && (
        <VideoCallModal
          doctor={{ name: activeVideoApt.doctor_name || "Dr. Specialist" }}
          appointment={activeVideoApt}
          onClose={() => setActiveVideoApt(null)}
        />
      )}

      {/* ── DIRECT DOCTOR CHAT & SMS MODAL ──────────────────── */}
      {activeChatApt && (
        <DoctorDirectChatModal
          doctor={{ name: activeChatApt.doctor_name || "Dr. Specialist" }}
          appointment={activeChatApt}
          onClose={() => setActiveChatApt(null)}
        />
      )}
    </div>
  );
}
