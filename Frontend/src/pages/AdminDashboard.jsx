import { useAuth } from "../context/AuthContext";
import { LogOut, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div>
          <h2 className="serif" style={{ fontSize: "36px", color: "#fff", margin: 0 }}>⚙️ Admin Control</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: 4 }}>
            <strong style={{ color: "#60a5fa" }}>{user?.name}</strong> • Central Administrator
          </p>
        </div>
        <button onClick={logout} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "10px 18px", borderRadius: 12, fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div style={{ background: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 24, padding: "60px 40px", textAlign: "center" }}>
        <Activity size={48} style={{ color: "#3b82f6", margin: "0 auto 20px", display: "block" }} />
        <h3 style={{ color: "#fff", fontSize: "22px", fontWeight: 700 }}>Admin Dashboard</h3>
        <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "400px", margin: "8px auto", lineHeight: 1.6 }}>
          Administrative features and platform-wide controls are in development.
        </p>
      </div>
    </div>
  );
}
