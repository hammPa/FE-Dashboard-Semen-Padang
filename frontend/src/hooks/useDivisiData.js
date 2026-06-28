// src/hooks/useDivisiData.js
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  MODE SWITCH                                                     │
// │  Mock  → set VITE_USE_MOCK=true  di file .env                  │
// │  Real  → set VITE_USE_MOCK=false (atau hapus variabelnya)       │
// │                                                                  │
// │  Tidak ada perubahan struktur data antara mode mock & real.     │
// └─────────────────────────────────────────────────────────────────┘

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

/**
 * @param {string} endpoint     - Endpoint API, contoh: "/divisi-ip"
 * @param {string} socketEvent  - Nama event socket, contoh: "updateDataIP"
 * @param {object} mockData     - Data dummy (struktur identik dengan response API)
 * @returns {{ data, isLoading, error, isMock }}
 */
export function useDivisiData({ endpoint, socketEvent, mockData }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ── MODE MOCK ──────────────────────────────────────────────────
    if (USE_MOCK) {
      const timer = setTimeout(() => {
        setData(mockData);
        setIsLoading(false);
      }, 600); // simulasi network latency
      return () => clearTimeout(timer);
    }

    // ── MODE REAL ──────────────────────────────────────────────────
    const fetchData = async () => {
      try {
        const response = await api.get(endpoint, {
          timeout: endpoint === "/divisi-ks" ? 120000 : 10000, // KS butuh lebih lama
        });
        setData(response.data);
      } catch (err) {
        console.error(`[useDivisiData] Gagal ambil ${endpoint}:`, err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const socket = io(SOCKET_URL);
    socket.on(socketEvent, (dataTerbaru) => {
      console.log(`⚡ [Real-Time] ${socketEvent}:`, dataTerbaru);
      setData(dataTerbaru);
    });

    return () => socket.disconnect();
  }, []);

  return { data, isLoading, error, isMock: USE_MOCK };
}