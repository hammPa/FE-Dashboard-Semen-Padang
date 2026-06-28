// src/pages/DivisiIP.jsx
import { useDivisiData } from "../hooks/useDivisiData";
import { mockDivisiIPData } from "../data/mockDivisiIP";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import {
  ClipboardList, AlertOctagon, Activity, CheckSquare,
  BarChart2, PieChart as PieIcon, Wrench, Search, ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from "recharts";
import { useState } from "react";

const PRIORITY_COLOR = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981", _default: "#6B7280" };
const getPriorityColor = (n) => PRIORITY_COLOR[n] ?? PRIORITY_COLOR._default;
const PRIORITY_BADGE   = { High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-emerald-100 text-emerald-700", _default: "bg-gray-100 text-gray-500" };
const getPriorityBadge = (n) => PRIORITY_BADGE[n] ?? PRIORITY_BADGE._default;

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1 text-xs">{label}</p>
      <p className="text-violet-600 font-bold">{payload[0].value} temuan</p>
    </div>
  );
};

export default function DivisiIP() {
  const { data, isLoading } = useDivisiData({
    endpoint:    "/divisi-ip",
    socketEvent: "updateDataIP",
    mockData:    mockDivisiIPData,
  });

  const [searchTerm, setSearchTerm]     = useState("");
  const [filterPrioritas, setFilterPrioritas] = useState("Semua");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-14 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const { dataLogs } = data;
  const totalInspeksi   = dataLogs.length;
  const prioritasTinggi = dataLogs.filter((l) => l.prioritas?.trim() === "High").length;
  const menungguAnalisa = dataLogs.filter((l) => l.status?.trim() === "Menunggu Analisa").length;
  const sudahDianalisa  = totalInspeksi - menungguAnalisa;
  const selesaiPct      = totalInspeksi > 0 ? Math.round((sudahDianalisa / totalInspeksi) * 100) : 0;

  const temuanPerArea = dataLogs.reduce((acc, log) => {
    if (!log.area) return acc;
    const found = acc.find((x) => x.name === log.area);
    if (found) found.jumlah += 1; else acc.push({ name: log.area, jumlah: 1 });
    return acc;
  }, []);

  // Shorten long area names for chart
  const temuanPerAreaShort = temuanPerArea.map((x) => ({
    ...x,
    shortName: x.name.replace("Area ", "").replace("Gudang Bahan Baku", "Gudang"),
  }));

  const rasioPrioritas = dataLogs.reduce((acc, log) => {
    if (!log.prioritas) return acc;
    const found = acc.find((x) => x.name === log.prioritas);
    if (found) found.value += 1; else acc.push({ name: log.prioritas, value: 1 });
    return acc;
  }, []);

  // Radial bar data for completion
  const radialData = [{ name: "Selesai", value: selesaiPct, fill: "#8B5CF6" }];

  // Filtered table
  const filteredLogs = dataLogs.filter((l) => {
    const matchSearch = !searchTerm ||
      l.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterPrioritas === "Semua" || l.prioritas === filterPrioritas;
    return matchSearch && matchFilter;
  });
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paged = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Wrench size={15} className="text-violet-600" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Divisi IP</h2>
          </div>
          <p className="text-xs text-gray-400">Inspeksi Pemeliharaan · Pemantauan temuan lapangan real-time</p>
        </div>
        {/* Progress badge */}
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm self-start sm:self-auto">
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#F3F4F6" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#8B5CF6" strokeWidth="4"
                strokeDasharray={`${selesaiPct} 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-violet-700">{selesaiPct}%</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Analisa Selesai</p>
            <p className="text-sm font-bold text-gray-800">{sudahDianalisa} / {totalInspeksi}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={ClipboardList} label="Total Temuan"     value={totalInspeksi}   accent="gray"   />
        <StatCard icon={AlertOctagon}  label="Prioritas Tinggi" value={prioritasTinggi} accent="red"    />
        <StatCard icon={Activity}      label="Menunggu Analisa" value={menungguAnalisa} accent="orange" />
        <StatCard icon={CheckSquare}   label="Sudah Dianalisa"  value={sudahDianalisa}  accent="green"  />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ChartCard title="Temuan per Area Pabrik" subtitle="Distribusi lokasi inspeksi" icon={BarChart2} iconColor="#8B5CF6">
          <div style={{ width: "100%", height: 224 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={temuanPerAreaShort} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="shortName" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: "#F5F3FF" }} />
                <Bar dataKey="jumlah" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Rasio Prioritas Temuan" subtitle="Distribusi tingkat urgensi" icon={PieIcon} iconColor="#8B5CF6">
          <div style={{ width: "100%", height: 224 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={rasioPrioritas} cx="50%" cy="45%"
                  innerRadius={50} outerRadius={78}
                  paddingAngle={4} dataKey="value" strokeWidth={0}
                >
                  {rasioPrioritas.map((entry, i) => (
                    <Cell key={i} fill={getPriorityColor(entry.name)} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 4px 20px rgb(0 0 0 / 0.08)" }}
                  formatter={(val, name) => [`${val} temuan`, name]}
                />
                <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-bold text-gray-900">Log Inspeksi Lapangan</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 w-36 transition-all"
              />
            </div>
            <div className="flex items-center gap-1">
              {["Semua", "High", "Medium", "Low"].map((p) => (
                <button key={p} onClick={() => { setFilterPrioritas(p); setCurrentPage(1); }}
                  className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                    filterPrioritas === p ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                {["ID Inspeksi", "Area Pabrik", "Deskripsi Temuan", "Prioritas", "Tanggal", "Status"].map((h) => (
                  <th key={h} className="pb-3 px-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length > 0 ? paged.map((log, i) =>
                log.id ? (
                  <tr key={i} className="hover:bg-violet-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gray-700 text-xs">{log.id}</td>
                    <td className="py-3 px-3 font-semibold text-violet-600 text-xs whitespace-nowrap">{log.area}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs max-w-xs">{log.deskripsi}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityBadge(log.prioritas)}`}>
                        {log.prioritas}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">{log.tanggal}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        log.status?.trim() === "Sudah Dianalisa" ? "text-emerald-600" : "text-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status?.trim() === "Sudah Dianalisa" ? "bg-emerald-400" : "bg-amber-400"
                        }`} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ) : null
              ) : (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">Tidak ada data cocok</td></tr>
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