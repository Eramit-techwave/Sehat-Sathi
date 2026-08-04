/**
 * IncomingVideoCallModal.jsx — Doctor-to-Patient Incoming Call Alert Component
 * Sehat-Sathi Healthcare Ecosystem
 *
 * Displays a live ringing incoming video call alert for patients when a doctor calls:
 * - Animated Ringing Avatar & Doctor Profile
 * - Accept Call (launches VideoCallModal) & Decline Call actions
 */
import { Phone, PhoneOff, Video, ShieldCheck } from "lucide-react";

export default function IncomingVideoCallModal({ doctorName, appointment, onAccept, onDecline }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999999,
      background: "rgba(9, 13, 22, 0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "#0F172A",
        borderRadius: 24, padding: "32px 24px", textAlign: "center",
        border: "1px solid rgba(37,99,235,0.3)",
        boxShadow: "0 30px 90px rgba(37,99,235,0.3)",
        color: "#FFFFFF", fontFamily: "'Inter', sans-serif"
      }}>
        {/* Animated Ringing Pulse Avatar */}
        <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 20px" }}>
          <div style={{
            position: "absolute", inset: -12, borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.25)",
            animation: "ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite"
          }} />
          <div style={{
            width: 90, height: 90, borderRadius: "50%",
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, position: "relative", zIndex: 1,
            boxShadow: "0 10px 25px rgba(37,99,235,0.4)"
          }}>
            👨‍⚕️
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          INCOMING TELEHEALTH VIDEO CALL
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#FFFFFF" }}>
          {doctorName || "Dr. Specialist"}
        </h3>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 24px" }}>
          Your doctor is calling you for your scheduled consultation.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button
            onClick={onDecline}
            style={{
              flex: 1, padding: "13px", borderRadius: 14,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            <PhoneOff size={16} /> Decline
          </button>

          <button
            onClick={onAccept}
            style={{
              flex: 1, padding: "13px", borderRadius: 14,
              background: "linear-gradient(135deg, #10B981, #059669)",
              border: "none", color: "#FFFFFF",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 8px 20px rgba(16,185,129,0.35)"
            }}
          >
            <Video size={16} /> Accept Call
          </button>
        </div>
      </div>
    </div>
  );
}
