import { useAuth } from "../context/AuthContext";
import { Clock, LogOut, Activity, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function PendingVerification() {
  const { user, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const roleLabel = user?.role === "Doctor" ? "Doctor" : "Hospital";
  const roleIcon = user?.role === "Doctor" ? "👨‍⚕️" : "🏥";
  const roleColor = user?.role === "Doctor" ? "#3b82f6" : "#f59e0b";

  const checkStatus = async () => {
    setChecking(true);
    setStatusMsg("");
    try {
      const token = localStorage.getItem("sehat_sathi_token");
      const res = await fetch("http://localhost:8000/auth/verification-status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.verification_status === "approved") {
        // Update stored user and reload
        const storedUser = JSON.parse(localStorage.getItem("sehat_sathi_user") || "{}");
        storedUser.verification_status = "approved";
        localStorage.setItem("sehat_sathi_user", JSON.stringify(storedUser));
        window.location.reload();
      } else if (data.verification_status === "rejected") {
        setStatusMsg(`rejected:${data.rejection_reason || "No reason provided"}`);
      } else {
        setStatusMsg("still_pending");
      }
    } catch (e) {
      setStatusMsg("error");
    }
    setChecking(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030712",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 4%",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Background orb */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${roleColor}15, transparent)`,
        filter: "blur(80px)", pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={18} style={{ color: "white" }} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Sehat<span style={{ color: "#60a5fa", fontWeight: 400 }}>Sathi</span>
          </span>
        </div>

        {/* Main card */}
        <div style={{
          background: "#0b1329",
          border: `1px solid ${roleColor}25`,
          borderRadius: 24,
          padding: "40px 36px",
          textAlign: "center",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${roleColor}08`
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `${roleColor}15`,
            border: `2px solid ${roleColor}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: 32
          }}>
            {roleIcon}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 100, padding: "4px 14px", marginBottom: 16 }}>
            <Clock size={11} style={{ color: "#f59e0b" }} />
            <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.06em" }}>PENDING VERIFICATION</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", marginBottom: 8 }}>
            Account Under Review
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 28 }}>
            Hi <strong style={{ color: "#fff" }}>{user?.name}</strong>! Your <strong style={{ color: roleColor }}>{roleLabel}</strong> account has been created and is currently under review by our verification team.
            <br /><br />
            Once verified, you'll have full access to your {roleLabel} dashboard.
          </p>

          {/* Timeline */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: "20px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 16 }}>VERIFICATION STEPS</div>
            {[
              { label: "Registration Submitted", done: true },
              { label: "Admin Review in Progress", done: false, active: true },
              { label: "Credential Verification", done: false },
              { label: "Account Activated", done: false }
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: step.done ? "#22c55e20" : step.active ? `${roleColor}20` : "rgba(255,255,255,0.03)",
                  border: `2px solid ${step.done ? "#22c55e" : step.active ? roleColor : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {step.done ? <CheckCircle size={12} style={{ color: "#22c55e" }} /> :
                   step.active ? <Clock size={10} style={{ color: roleColor }} /> : null}
                </div>
                <span style={{ fontSize: 12, color: step.done ? "#22c55e" : step.active ? "#fff" : "#475569", fontWeight: step.active ? 600 : 400 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Status message */}
          {statusMsg === "still_pending" && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#f59e0b" }}>
              ⏳ Still pending. Our team is working on it. Check back in a few hours.
            </div>
          )}
          {statusMsg?.startsWith("rejected:") && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <XCircle size={14} style={{ color: "#ef4444" }} />
                <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>Account Not Approved</span>
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{statusMsg.replace("rejected:", "")}</span>
            </div>
          )}
          {statusMsg === "error" && (
            <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ef4444" }}>
              Could not connect. Please check your connection and try again.
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={checkStatus}
              disabled={checking}
              style={{
                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                color: "white", border: "none", padding: "14px 28px",
                borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: checking ? "not-allowed" : "pointer",
                opacity: checking ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <RefreshCw size={14} style={{ animation: checking ? "spin 1s linear infinite" : "none" }} />
              {checking ? "Checking status..." : "Check Verification Status"}
            </button>

            <button
              onClick={logout}
              style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444", padding: "12px 28px",
                borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>

          <p style={{ fontSize: 11, color: "#334155", marginTop: 20 }}>
            Questions? Contact support at{" "}
            <a href="mailto:support@sehatsathi.in" style={{ color: "#60a5fa", textDecoration: "none" }}>
              support@sehatsathi.in
            </a>
          </p>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
