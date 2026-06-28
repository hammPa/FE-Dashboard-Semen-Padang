// src/pages/Overview.jsx
import { useState, useEffect } from "react";
import SummaryCards from "../components/SummaryCards";
import TrendChart   from "../components/TrendChart";
import SourceChart  from "../components/SourceChart";
import LogTable     from "../components/LogTable";
import Skeleton     from "../components/Skeleton";
import {
  summaryData,
  trendData,
  sourceData,
  recentLogs,
  uptimeData,
  kpiData,
} from "../data/mockdata";
import api from "../utils/api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ✅ Satu titik definisi mock — semua field lengkap
const MOCK_DATA = {
  summary: {
    ...summaryData,
    // kpiData dimasukkan ke summary supaya SummaryCards bisa deriveKpi dengan benar
    syncSuccess: kpiData.syncSuccess,
    avgLatency:  kpiData.avgLatency,
  },
  trendData,
  sourceData,
  recentLogs,
  // uptimeBySource: objek flat { "Google Sheets": 99.9, ... }
  uptimeBySource: {
    "Google Sheets": uptimeData["Google Sheets"],
    "Firebase":      uptimeData["Firebase"],
    "OneDrive":      uptimeData["OneDrive"],
  },
};

export default function Overview() {
  const [isLoading, setIsLoading]   = useState(true);
  const [serverData, setServerData] = useState(null);
  const [dataSource, setDataSource] = useState(null); // "mock" | "api" | "fallback"

  useEffect(() => {
    (async () => {
      if (USE_MOCK) {
        setServerData(MOCK_DATA);
        setDataSource("mock");
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/dashboard");
        // Backend belum kirim uptimeBySource? Fallback ke {} — SourceChart handle sendiri
        const apiData = {
          ...response.data,
          uptimeBySource: response.data.uptimeBySource || {},
        };
        setServerData(apiData);
        setDataSource("api");
      } catch (err) {
        console.warn("[Overview] API gagal, fallback ke mock. Error:", err?.message || err);
        setServerData(MOCK_DATA);
        setDataSource("fallback");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading || !serverData) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-80 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Banner debug — hanya muncul di mode development */}
      {import.meta.env.DEV && (
        <div className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border w-fit ${
          dataSource === "api"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : dataSource === "fallback"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {dataSource === "api"      && "✅ Data: API Backend (Live)"}
          {dataSource === "mock"     && "🧪 Data: Mock (VITE_USE_MOCK=true)"}
          {dataSource === "fallback" && "⚠️ Data: Mock Fallback (API tidak bisa dijangkau)"}
        </div>
      )}

      {/* ✅ Semua komponen dapat data dari serverData — zero hardcode di dalamnya */}
      <SummaryCards
        data={serverData.summary}
        recentLogs={serverData.recentLogs}
      />
      <TrendChart data={serverData.trendData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        <SourceChart
          data={serverData.sourceData}
          uptimeBySource={serverData.uptimeBySource}
        />
        <LogTable data={serverData.recentLogs} />
      </div>
    </div>
  );
}