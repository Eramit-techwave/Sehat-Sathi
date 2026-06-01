import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard.jsx";
import { Activity, LogOut } from "lucide-react";

export default function App() {
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
        <span style={{ fontSize: "14px", fontFamily: "monospace" }}>Synchronizing Health Mesh Security Link...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* GLOBAL PRODUCTION EMBEDDED STYLES MESH */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .app-container {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #030712;
          color: #f1f5f9;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        
        button, input, .card-hover, .tab-btn {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up-2 { animation: fadeUp 0.8s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up-4 { animation: fadeUp 0.8s 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-in { animation: fadeIn 0.5s ease both; }

        .shimmer-text {
          background: linear-gradient(90deg, #60a5fa, #fff, #2563eb, #fff, #60a5fa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 6s linear infinite;
        }

        .card-hover {
          background: #0b1329;
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(37,99,235,0.08);
          border-color: rgba(37,99,235,0.25);
          background: #0e1a38;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37,99,235,0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37,99,235,0.35);
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        .btn-primary:active { transform: scale(0.98) translateY(0); }

        .btn-ghost {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: #94a3b8;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-ghost:hover { 
          border-color: rgba(96,165,250,0.4); 
          color: #fff; 
          background: rgba(37,99,235,0.05); 
        }

        .input-field {
          width: 100%;
          background: #060b16;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px 16px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
        }
        .input-field:focus { 
          border-color: #2563eb; 
          background: #0a1122;
          box-shadow: 0 0 15px rgba(37,99,235,0.15);
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(37,99,235,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          animation: pulseGlow 8s ease-in-out infinite;
        }
        
        .report-line {
          height: 2px;
          background: linear-gradient(90deg, transparent, #2563eb, transparent);
          animation: shimmer 2.5s linear infinite;
          background-size: 200% auto;
        }
        .float-card { animation: float 6s ease-in-out infinite; }
        .float-card-2 { animation: float 7s 0.7s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>

      {/* FIXED NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(3,7,18,0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
        padding: "0 6%", transition: "all 0.2s ease"
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Activity size={18} style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Sehat<span style={{ color: "#60a5fa", fontWeight: 400 }}>Sathi</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#60a5fa" }}>Hi, {user.name}</span>
                <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }} onClick={logout}>
                  <LogOut size={13} /> Exit Node
                </button>
              </div>
            ) : (
              /* DYNAMIC EMISSION FOR LANDING ROUTE PATH */
              location.pathname === "/" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* These buttons communicate seamlessly with LandingPage instances */}
                  <button className="btn-ghost" onClick={() => window.dispatchEvent(new Event("trigger-login-modal"))}>Sign In</button>
                  <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "13px" }} onClick={() => window.dispatchEvent(new Event("trigger-signup-modal"))}>
                    Get Started
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      {/* CORE ROUTES CONTROLLER */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}