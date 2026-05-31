import { Shield, CheckCircle2, RefreshCw, Zap, Heart, Award, Upload } from "lucide-react";

export default function Dashboard() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 6%" }} className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 40, textAlign: "left" }}>
        <div>
          <h2 className="serif" style={{ fontSize: "38px", color: "#fff" }}>Secure Health Command Node</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Authorized session channel linked to patient ledger network.</p>
        </div>
        <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={16} className="text-blue-400" />
          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Encryption: AES-256 Enabled</span>
        </div>
      </div>

      {/* Core Interactive Sandbox Panel Module */}
      <section style={{ marginBottom: 48 }}>
        <div className="fade-up" style={{ background: "linear-gradient(145deg, #090f22, #050914)", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 24, padding: "44px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
                <CheckCircle2 size={11} /> LIVE PATIENT DATA TUNNEL
              </div>
              <h3 className="serif" style={{ fontSize: "32px", color: "#fff" }}>Interactive Vitals Sandbox</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: 4 }}>Simulated AI extraction module demonstrating data normalization from unstructured inputs.</p>
            </div>
            <div style={{ background: "#030712", padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
              <RefreshCw size={12} className="animate-spin text-blue-500" style={{ animationDuration: "3s" }} /> Node Stream: Stable
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { title: "Metabolic Basal Rate", value: "1,740 kcal", icon: <Zap size={16} />, desc: "Calculated active thermodynamic rest threshold.", color: "#3b82f6" },
              { title: "Cardiovascular Load", value: "72 bpm", icon: <Heart size={16} />, desc: "Resting pulse rhythm extracted from pulse graphs.", color: "#ef4444" },
              { title: "AI Core Extraction", value: "99.42%", icon: <Award size={16} />, desc: "Algorithmic confidence index for structure parser.", color: "#22c55e" }
            ].map((card, i) => (
              <div key={i} style={{ background: "#030712", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{card.title}</span>
                  <div style={{ color: card.color, background: `${card.color}10`, padding: 6, borderRadius: 8 }}>{card.icon}</div>
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: 6 }}>{card.value}</div>
                <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Secure Drag and Drop file parsing layout */}
      <div style={{ background: "#091022", border: "2px dashed rgba(37,99,235,0.2)", borderRadius: 20, padding: "60px 40px", textAlign: "center" }} className="card-hover">
        <Upload size={32} className="text-blue-500 mx-auto mb-4 animate-bounce" />
        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Ingest New Health Repository Files</h4>
        <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "360px", margin: "6px auto 20px" }}>Drop clinical lab PDFs here, or click to upload raw medical capture prints from your network terminal.</p>
        <button className="btn-primary" style={{ padding: "12px 24px", fontSize: "13px" }}>Select Binary Source</button>
      </div>
    </div>
  );
}