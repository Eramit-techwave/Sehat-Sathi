/**
 * NotificationBell — Reusable notification dropdown component
 * 
 * Usage: <NotificationBell />
 * Drop this into any dashboard header (Patient, Doctor, Hospital, Admin)
 * 
 * Features:
 * - Unread badge count (polling every 30s)
 * - Dropdown list of last 20 notifications
 * - Mark single / mark all as read
 * - Type-specific icons and colors
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, X, Clock } from "lucide-react";

const API = "http://localhost:8000";

const TYPE_CONFIG = {
  appointment_booked:     { icon: "📅", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  appointment_confirmed:  { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  appointment_cancelled:  { icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  appointment_completed:  { icon: "🎉", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  verification_approved:  { icon: "🛡️", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  verification_rejected:  { icon: "⚠️", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  report_analyzed:        { icon: "🔬", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
};

function getTypeConfig(type) {
  for (const key of Object.keys(TYPE_CONFIG)) {
    if (type?.startsWith(key.split("_")[0])) return TYPE_CONFIG[key];
  }
  return { icon: "🔔", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("sehat_sathi_token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/notifications/unread-count`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) { /* silent */ }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/notifications/?limit=20`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
  }, [token]);

  // Poll for unread count every 30s
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await fetch(`${API}/notifications/${id}/read`, { method: "PUT", headers });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, { method: "PUT", headers });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    await fetch(`${API}/notifications/${id}`, { method: "DELETE", headers });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative", background: open ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${open ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 10, width: 40, height: 40, display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        <Bell size={16} style={{ color: open ? "#60a5fa" : "#64748b" }} />
        {unreadCount > 0 && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 18, height: 18, borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            fontSize: 9, fontWeight: 800, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #030712", animation: "pulse 2s infinite"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 340, maxHeight: 480,
          background: "#0b1329", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          zIndex: 200, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={13} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ fontSize: 10, color: "#fff", background: "#2563eb", borderRadius: 100, padding: "1px 7px", fontWeight: 700 }}>{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#475569", fontSize: 12 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Bell size={28} style={{ color: "#1e293b", margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontSize: 12, color: "#475569" }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = getTypeConfig(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px", cursor: n.is_read ? "default" : "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      background: n.is_read ? "transparent" : "rgba(37,99,235,0.04)",
                      transition: "background 0.2s"
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 700, color: n.is_read ? "#94a3b8" : "#fff", lineHeight: 1.3 }}>{n.title}</span>
                        {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0, marginTop: 3 }} />}
                      </div>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "3px 0 0", lineHeight: 1.5 }}>{n.message}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <Clock size={9} style={{ color: "#334155" }} />
                        <span style={{ fontSize: 10, color: "#334155" }}>{n.created_at ? timeAgo(n.created_at) : ""}</span>
                      </div>
                    </div>
                    <button onClick={(e) => deleteNotif(n.id, e)} style={{ background: "none", border: "none", color: "#1e293b", cursor: "pointer", padding: 2, flexShrink: 0, display: "flex", alignItems: "center" }}>
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}
