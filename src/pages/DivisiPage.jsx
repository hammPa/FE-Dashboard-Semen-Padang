// src/pages/DivisiPage.jsx
import { FileText, Clock, Activity } from "lucide-react";
import { summaryData, trendData } from "../data/mockdata";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DivisiPage({ namaDivisi }) {
  // 1. Logika untuk menentukan Data dan Warna berdasarkan Divisi yang sedang dibuka
  let dataKey = "IP";
  let color = "#2563EB"; // Biru untuk IP
  let totalLaporan = summaryData.ip;

  if (namaDivisi === "Divisi KS") {
    dataKey = "KS";
    color = "#10B981"; // Hijau untuk KS
    totalLaporan = summaryData.ks;
  } else if (namaDivisi === "Divisi P") {
    dataKey = "P";
    color = "#F59E0B"; // Kuning / Orange untuk P
    totalLaporan = summaryData.p;
  }

  return (
    <div className="space-y-6">
      {/* HEADER HALAMAN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Laporan {namaDivisi}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Detail performa dan log aktivitas khusus untuk {namaDivisi}
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS (Khusus 1 Divisi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Laporan {namaDivisi}
            </p>
            <h3 className="text-2xl font-bold text-gray-800">{totalLaporan}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Update Terakhir</p>
            <h3 className="text-sm font-bold text-gray-800 mt-1">
              {summaryData.lastUpdate}
            </h3>
          </div>
        </div>
      </div>

      {/* GRAFIK (Hanya menampilkan 1 garis sesuai divisi) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Activity size={20} style={{ color: color }} /> Tren Laporan Mingguan{" "}
          {namaDivisi}
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />

              {/* Garis tunggal yang dinamis berdasarkan properti dataKey dan color */}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4, fill: color }}
                activeDot={{ r: 6 }}
                name={namaDivisi}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
