/**
 * keepAlive.js — Server ping utility to prevent Render.com free instance sleep
 * Sehat-Sathi | August 2026
 */
const API_BASE = "https://sehat-sathi-ce58.onrender.com";
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in ms

export function keepServerAwake() {
  const isDev = import.meta.env.DEV;

  const pingServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: "GET" });
      if (isDev) {
        console.log(`[KeepAlive] Server health ping status: ${res.status}`);
      }
    } catch (err) {
      if (isDev) {
        console.warn("[KeepAlive] Silent ping error:", err.message);
      }
    }
  };

  // Immediate ping on app startup
  pingServer();

  // Periodic ping every 10 minutes
  const intervalId = setInterval(pingServer, PING_INTERVAL);

  return () => clearInterval(intervalId);
}
