/**
 * useNotification — Centralized notification state hook.
 * Replaces the showNotif pattern duplicated in every dashboard.
 *
 * Usage:
 *   const { notification, showNotif } = useNotification();
 *   showNotif("Profile saved!");
 *   showNotif("Something failed", "error");
 *   <FloatingNotification {...notification} />
 */
import { useState, useCallback } from "react";

export function useNotification(duration = 4000) {
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    text: "",
  });

  const showNotif = useCallback((text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), duration);
  }, [duration]);

  const hideNotif = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  return { notification, showNotif, hideNotif };
}

export default useNotification;
