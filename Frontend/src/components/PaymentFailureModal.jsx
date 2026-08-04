/**
 * PaymentFailureModal.jsx — Amazon-Grade Payment Failure & Retry Checkout Modal
 * Sehat-Sathi Healthcare Ecosystem
 *
 * Displays clear transaction error feedback & instant retry workflow:
 * - Error Diagnostics (Declined, Timeout, Verification failure)
 * - Immediate "Retry Payment Now" action
 * - Switch payment method tab (UPI ↔ Card ↔ Net Banking ↔ Cash at Clinic)
 * - 24/7 Support assistance reference
 */
import { AlertTriangle, RefreshCw, CreditCard, Banknote, ShieldAlert, X, ArrowRight, PhoneCall } from "lucide-react";

export default function PaymentFailureModal({
  errorReason,
  doctor,
  appointmentData,
  onRetry,
  onSwitchToCash,
  onClose
}) {
  const doctorName = doctor?.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor?.name || "Specialist"}`;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 500, background: "#FFFFFF",
          borderRadius: 24, overflow: "hidden",
          boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
          animation: "fadeScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
          fontFamily: "'Inter', sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header banner */}
        <div style={{
          background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
          padding: "28px 24px 20px",
          color: "#FFFFFF", textAlign: "center", position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.2)", border: "none",
              color: "#FFF", width: 32, height: 32, borderRadius: 10,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#FFFFFF", color: "#DC2626",
            margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
          }}>
            <ShieldAlert size={38} strokeWidth={2.2} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Payment Could Not Be Completed
          </h2>
          <p style={{ fontSize: 12.5, opacity: 0.92, margin: 0, fontWeight: 500 }}>
            Don't worry — your appointment slot is reserved for 5 minutes.
          </p>
        </div>

        {/* Details Card */}
        <div style={{ padding: "24px 28px" }}>

          {/* Error explanation box */}
          <div style={{
            background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 14, padding: "14px 16px", marginBottom: 20,
            display: "flex", alignItems: "flex-start", gap: 12
          }}>
            <AlertTriangle size={20} style={{ color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>Transaction Failure Reason:</div>
              <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 2 }}>
                {errorReason || "Bank declined transaction or authentication timed out."}
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div style={{
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: 14, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{doctorName}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Date: {appointmentData?.date} · {appointmentData?.time_slot}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#2563EB" }}>
              ₹{doctor?.consultation_fee || doctor?.fee || 500}
            </div>
          </div>

          {/* Action Buttons (Amazon Style Retry) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={onRetry}
              style={{
                width: "100%", padding: "13px 16px", borderRadius: 12,
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                border: "none", color: "#FFFFFF",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
              }}
            >
              <RefreshCw size={16} /> Retry Online Payment (UPI / Card)
            </button>

            {onSwitchToCash && (
              <button
                onClick={onSwitchToCash}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#047857", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                <Banknote size={16} /> Switch to Pay at Clinic (Cash)
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: "10px 14px", borderRadius: 10,
                background: "#F1F5F9", border: "1px solid #CBD5E1",
                color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4
              }}
            >
              Cancel Checkout
            </button>
          </div>

          {/* Support Helpline */}
          <div style={{ textAlign: "center", borderTop: "1px solid #E2E8F0", paddingTop: 14, marginTop: 20 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <PhoneCall size={12} style={{ color: "#2563EB" }} /> Need payment assistance? Contact Sehat-Sathi 24/7 Support at <strong>1800-SEHAT-SATHI</strong>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
