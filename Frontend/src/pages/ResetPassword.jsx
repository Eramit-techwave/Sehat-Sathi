import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Key, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // URL se token extract karna

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("input"); // "input" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setErrorMsg("Reset token missing from URL target vector.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://https://sehat-sathi-ce58.onrender.com/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Reset operation failed");

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#020408" }}>
      <div style={{ width: "100%", maxWidth: 390, background: "#0b1329", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px 36px 36px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        
        {status === "input" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 6px 16px rgba(37,99,235,0.2)" }}>
                <Key size={20} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>Update Access Phrase</h3>
              <p style={{ fontSize: 12, color: "#64748b" }}>Configure your new security node credentials</p>
            </div>

            <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: "#475569", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>NEW SECURITY PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input-field"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ marginTop: 4, width: "100%", fontSize: 13, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Re-coding Matrix..." : "Confirm Password Change →"}
              </button>
            </form>
          </>
        )}

        {status === "success" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#22c55e" }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: "#ffffff", marginBottom: 6 }}>Password Updated!</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>
              Your account encryption layer has been successfully updated with the new credentials.
            </p>
            <button className="btn-primary" onClick={() => navigate("/")} style={{ width: "100%", fontSize: 13 }}>
              Return to Login Page
            </button>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 6 }}>Reset Failed</h3>
            <p style={{ fontSize: 12, color: "#f87171", lineHeight: 1.6, marginBottom: 20 }}>{errorMsg}</p>
            <button className="btn-primary" onClick={() => setStatus("input")} style={{ width: "100%", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}