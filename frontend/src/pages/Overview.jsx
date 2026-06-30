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
  alertsData,
} from "../data/mockdata";
import api from "../utils/api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const MOCK_DATA = {
  summary:   summaryData,
  trendData,
  sourceData,
  recentLogs,
  alerts:    alertsData,
};

export default function Overview() {
  const [isLoading,  setIsLoading]  = useState(true);
  const [serverData, setServerData] = useState(null);
  const [dataSource, setDataSource] = useState(null);

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
        console.log("[Overview] API response:", response.data); // ✅ debug
        setServerData(response.data);
        setDataSource("api");
      } catch (err) {
        console.warn("[Overview] API gagal diambil:", err?.message || err);
        setDataSource("error");
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

  // if (dataSource === "error" || !serverData) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm mt-5">
  //       <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
  //         <span className="text-red-500 text-xl font-bold">!</span>
  //       </div>
  //       <h3 className="text-sm font-bold text-gray-800">Gagal Memuat Data Dashboard</h3>
  //       <p className="text-xs text-gray-400 mt-1">Terjadi kesalahan pada server atau batas waktu habis.</p>
  //       <button 
  //         onClick={() => window.location.reload()} 
  //         className="mt-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors"
  //       >
  //         Muat Ulang Halaman
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-5">
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

      <SummaryCards
        data={serverData.summary}
        recentLogs={serverData.recentLogs}
        alerts={serverData.alerts ?? []}
      />
      <TrendChart data={serverData.trendData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        <SourceChart data={serverData.sourceData} />
        <LogTable    data={serverData.recentLogs} />
      </div>
    </div>
  );
}