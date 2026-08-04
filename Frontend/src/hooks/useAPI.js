/**
 * useAPI — Centralized API fetching hook with auth headers,
 * loading state, and error handling.
 *
 * Usage:
 *   const { get, post, put, del, loading } = useAPI();
 *   const data = await get("/doctors");
 */
import { useState, useCallback } from "react";

import { API_BASE } from "../api/client";

export function useAPI() {
  const [loading, setLoading] = useState(false);

  const getHeaders = useCallback((extra = {}) => {
    const token = localStorage.getItem("sehat_sathi_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }, []);

  const request = useCallback(async (method, path, body, extraHeaders = {}) => {
    setLoading(true);
    try {
      const opts = {
        method,
        headers: getHeaders(extraHeaders),
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${API_BASE}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `API error ${res.status}`);
      return data;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const get  = useCallback((path)          => request("GET",    path), [request]);
  const post = useCallback((path, body)    => request("POST",   path, body), [request]);
  const put  = useCallback((path, body)    => request("PUT",    path, body), [request]);
  const del  = useCallback((path)          => request("DELETE", path), [request]);
  const patch= useCallback((path, body)    => request("PATCH",  path, body), [request]);

  // Upload helper (multipart)
  const upload = useCallback(async (path, formData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sehat_sathi_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Upload error ${res.status}`);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { get, post, put, del, patch, upload, loading, API_BASE };
}

export default useAPI;
