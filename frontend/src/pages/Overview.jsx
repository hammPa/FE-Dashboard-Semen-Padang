import { useState, useEffect } from "react";
import api from "../utils/api"; // Memanggil konfigurasi Axios kita
import SummaryCards from "../components/SummaryCards";
import TrendChart from "../components/TrendChart";
import SourceChart from "../components/SourceChart";
import LogTable from "../components/LogTable";
import Skeleton from "../components/Skeleton";
import { summaryData, trendData, sourceData, recentLogs } from "../data/mockdata";

export default function Overview() {
  const [isLoading, setIsLoading] = useState(true);
  const [serverData, setServerData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk menarik data dari Backend
    // fetchDashboardData
    (async () => {
      try {
        // Axios otomatis menembak ke http://localhost:3000/api/dashboard
        const response = await api.get("/dashboard");
        setServerData(response.data);
      }
      catch (error) {
        console.error("Gagal mengambil data dari server:", error);
        setError(error.message);
        // FIX: Gunakan mock data sebagai fallback
        setServerData({
          summary: summaryData,
          trendData,
          sourceData,
          recentLogs
        });
      }
      finally {
        setIsLoading(false);
      }
    })();
  }, []); // sekali

  if (isLoading || !serverData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full lg:col-span-1" />
          <Skeleton className="h-80 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kita "lempar" data dari server ke masing-masing komponen */}
      <SummaryCards data={serverData.summary} />
      <TrendChart data={serverData.trendData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SourceChart data={serverData.sourceData} />
        <LogTable data={serverData.recentLogs} />
      </div>
    </div>
  );
}
