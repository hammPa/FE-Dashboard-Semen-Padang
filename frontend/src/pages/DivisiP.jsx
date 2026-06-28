// src/pages/DivisiP.jsx
import { useDivisiData } from "../hooks/useDivisiData";
import { mockDivisiPData } from "../data/mockDivisiP";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  BarChart2, PieChart as PieIcon, CalendarClock,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useState } from "react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

const SPAREPART_BADGE = {
  Tersedia: "bg-emerald-100 text-emerald-700",
  Indent:   "bg-amber-100 text-amber-700",
  Kosong:   "bg-red-100 text-red-700",
  _default: "bg-gray-100 text-gray-500",
};
const getSparepartBadge = (v) => SPAREPART_BADGE[v] ?? SPAREPART_BADGE._default;

const STATUS_STYLE = {
  "Ready to Execute":   "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Delayed":            "text-red-700 bg-red-50 border-red-200",
  "Waiting Sparepart":  "text-amber-700 bg-amber-50 border-amber-200",
};
const getStatusStyle = (s) => STATUS_STYLE[s?.trim()] ?? "text-gray-500 bg-gray-50 border-gray-200";

export default function DivisiP() {
  const { data, isLoading } = useDivisiData({
    endpoint:    "/divisi-p",
    socketEvent: "updateDataPlanner",
    mockData:    mockDivisiPData,
  });

  const [searchTerm, setSearchTerm]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-14 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const { dataLogs } = data;
  const totalWO           = dataLogs.length;
  const siapEksekusi      = dataLogs.filter((l) => l.status?.trim() === "Ready to Execute").length;
  const menungguSparepart = dataLogs.filter((l) => l.status?.trim() === "Waiting Sparepart").length;
  const tertunda          = dataLogs.filter((l) => l.status?.trim() === "Delayed").length;
  const pctKesiapan       = totalWO > 0 ? Math.round((siapEksekusi / totalWO) * 100) : 0;

  const woPerArea = dataLogs.reduce((acc, log) => {
    const found = acc.find((x) => x.name === log.area);
    if (found) found.jumlah += 1;
    else acc.push({ name: log.area, jumlah: 1 });
    return acc;
  }, []);

  const woPerAreaShort = woPerArea.map((x) => ({
    ...x,
    shortName: x.name.replace("Area ", "").replace("Gudang Bahan Baku", "Gudang"),
  }));

  const kategoriWO = dataLogs.reduce((acc, log) => {
    const found = acc.find((x) => x.name === log.kategori);
    if (found) found.value += 1;
    else acc.push({ name: log.kategori, value: 1 });
    return acc;
  }, []);

  // Filtered table
  const filteredLogs = dataLogs.filter((l) =>
    !searchTerm ||
    l.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paged = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarClock size={15} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Divisi P</h2>
          </div>
          <p className="text-xs text-gray-400">Planner · Manajemen work order dan kesiapan eksekusi</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm self-start sm:self-auto">
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 font-medium">Kesiapan Pabrik</p>
            <p className="text-2xl font-extrabold text-blue-600 tabular-nums">{pctKesiapan}%</p>
          </div>
          <div className="w-10 h-10 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#EFF6FF" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#3B82F6" strokeWidth="4"
                strokeDasharray={`${pctKesiapan} 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              <CheckCircle size={12} className="text-blue-500" />
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={ClipboardList} label="Total Work Order"   value={totalWO}           accent="gray"   />
        <StatCard icon={CheckCircle}   label="Siap Eksekusi"      value={siapEksekusi}       accent="green"  />
        <StatCard icon={Clock}         label="Menunggu Sparepart" value={menungguSparepart}  accent="orange" />
        <StatCard icon={AlertTriangle} label="Tertunda"           value={tertunda}           accent="red"    />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ChartCard title="Sebaran Work Order per Area" subtitle="Jumlah WO per lokasi" icon={BarChart2} iconColor="#3B82F6">
          <div style={{ width: "100%", height: 224 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={woPerAreaShort} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="shortName" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: "#EFF6FF" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 4px 20px rgb(0 0 0 / 0.08)" }}
                  formatter={(val) => [`${val} WO`, "Jumlah"]}
                />
                <Bar dataKey="jumlah" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Rasio Kategori Pekerjaan" subtitle="Preventive · Corrective · Predictive" icon={PieIcon} iconColor="#3B82F6">
          <div style={{ width: "100%", height: 224 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={kategoriWO} cx="50%" cy="45%"
                  innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}
                >
                  {kategoriWO.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 4px 20px rgb(0 0 0 / 0.08)" }}
                  formatter={(val, name) => [`${val} WO`, name]}
                />
                <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Work Order Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-bold text-gray-900">Daftar Work Order</h3>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari WO, area…" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-40 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                {["ID WO", "Area Pabrik", "Kategori", "Status Sparepart", "Status WO"].map((h) => (
                  <th key={h} className="pb-3 px-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length > 0 ? paged.map((log, i) => (
                <tr key={log.id || `log-${i}`} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-gray-700 text-xs">{log.id}</td>
                  <td className="py-3 px-3 font-semibold text-blue-600 text-xs whitespace-nowrap">{log.area}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{log.kategori || "Umum"}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getSparepartBadge(log.status_sparepart)}`}>
                      {log.status_sparepart || "Belum Dicek"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusStyle(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Tidak ada data cocok</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
            <span className="text-xs text-gray-400">Hal. <span className="font-bold text-gray-700">{currentPage}</span> / {totalPages}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}