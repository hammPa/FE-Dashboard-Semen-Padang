// src/hooks/useAlerts.js
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { alertsData } from "../data/mockdata";

const USE_MOCK   = import.meta.env.VITE_USE_MOCK === "true";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

/**
 * Hook untuk fetch & subscribe real-time data alerts/notifikasi.
 * Struktur tiap item:
 *   { id, title, level: "error"|"warning"|"info"|"success", time, divisi }
 */
export function useAlerts() {
  const [alerts,    setAlerts]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    // ── MODE MOCK ─────────────────────────────────────────────
    if (USE_MOCK) {
      const timer = setTimeout(() => {
        setAlerts(alertsData);
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }

    // ── MODE REAL ─────────────────────────────────────────────
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/dashboard");
        setAlerts(res.data.alerts ?? []);
      } catch (err) {
        console.error("[useAlerts] Gagal fetch alerts:", err);
        setError(err.message);
        setAlerts([]); // jangan crash UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Real-time via socket — backend emit "updateDashboard" setiap ada perubahan
    const socket = io(SOCKET_URL);
    socket.on("updateDashboard", (data) => {
      console.log("⚡ [Real-Time] updateDashboard alerts:", data.alerts);
      if (data.alerts) setAlerts(data.alerts);
    });

    return () => socket.disconnect();
  }, []);

  const unreadCount = alerts.filter(
    (a) => a.level === "error" || a.level === "warning"
  ).length;

  return { alerts, isLoading, error, unreadCount, isMock: USE_MOCK };
}