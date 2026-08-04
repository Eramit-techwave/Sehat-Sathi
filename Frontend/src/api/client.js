/**
 * Shared API boundary for feature modules.
 * Keep endpoint configuration and response handling out of UI components so
 * mobile clients can use the same resource contracts later.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "https://sehat-sathi-ce58.onrender.com");

export async function apiGet(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

export function apiAsset(path) {
  if (!path || /^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}
