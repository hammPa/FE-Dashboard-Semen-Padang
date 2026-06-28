// src/pages/DivisiKS.jsx
import { useDivisiData } from "../hooks/useDivisiData";
import { mockDivisiKSData } from "../data/mockDivisiKS";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import {
  FileCheck, FileX, Clock, DollarSign,
  BarChart2, PieChart as PieIcon, Briefcase,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useState } from "react";

const STATUS_COLOR  = { Aktif: "#10B981", Kadaluarsa: "#EF4444", Pending: "#F59E0B", _default: "#6B7280" };
const STATUS_BADGE  = { Aktif: "bg-emerald-100 text-emerald-700", Kadaluarsa: "bg-red-100 text-red-700", Pending: "bg-amber-100 text-amber-700", _default: "bg-gray-100 text-gray-500" };
const getStatusBadge = (s) => STATUS_BADGE[s] ?? STATUS_BADGE._default;

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];

function formatRupiah(v) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} M`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(0)} Jt`;
  return `${(v / 1_000).toFixed(0)} Rb`;
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-emerald-600 font-bold">Rp {payload[0].value?.toLocaleString("id-ID")}</p>
    </div>
  );
};

export default function DivisiKS() {
  const { data, isLoading } = useDivisiData({
    endpoint:    "/divisi-ks",
    socketEvent: "updateDataKS",
    mockData:    mockDivisiKSData,
  });

  const [searchTerm, setSearchTerm] = useState("");
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
        <Skeleton className="h-72" />
      </div>
    );
  }

  const { dataLogs } = data;
  const totalKontrak   = dataLogs.length;
  const aktif          = dataLogs.filter((l) => l.status === "Aktif").length;
  const kadaluarsa     = dataLogs.filter((l) => l.status === "Kadaluarsa").length;
  const pending        = dataLogs.filter((l) => l.status === "Pending").length;
  const totalNilai     = dataLogs.reduce((s, l) => s + (l.nilai || 0), 0);
  const aktifPct       = totalKontrak > 0 ? Math.round((aktif / totalKontrak) * 100) : 0;

  // Nilai per vendor
  const nilaiPerVendor = dataLogs.reduce((acc, log) => {
    const found = acc.find((x) => x.name === log.vendor);
    if (found) found.nilai += log.nilai || 0;
    else acc.push({ name: log.vendor, nilai: log.nilai || 0 });
    return acc;
  }, []).sort((a, b) => b.nilai - a.nilai).slice(0, 5);

  // Status distribution
  const statusDist = [
    { name: "Aktif",      value: aktif,      color: "#10B981" },
    { name: "Kadaluarsa", value: kadaluarsa, color: "#EF4444" },
    { name: "Pending",    value: pending,    color: "#F59E0B" },
  ].filter((x) => x.value > 0);

  // Jenis kontrak distribution
  const jenisDist = dataLogs.reduce((acc, log) => {
    const found = acc.find((x) => x.name === log.jenis);
    if (found) found.value += 1;
    else acc.push({ name: log.jenis, value: 1 });
    return acc;
  }, []);

  // Filtered table
  const filteredLogs = dataLogs.filter((l) =>
    !searchTerm ||
    l.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.jenis?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paged = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Briefcase size={15} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Divisi KS</h2>
          </div>
          <p className="text-xs text-gray-400">Kontrak Servis · Manajemen vendor dan nilai kontrak aktif</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm self-start sm:self-auto">
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 font-medium">Total Nilai Kontrak</p>
            <p className="text-xl font-extrabold text-emerald-700 tabular-nums">Rp {formatRupiah(totalNilai)}</p>
          </div>
          <div className="w-10 h-10 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#D1FAE5" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#10B981" strokeWidth="4"
                strokeDasharray={`${aktifPct} 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-emerald-700">{aktifPct}%</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={FileCheck}  label="Total Kontrak"   value={totalKontrak} accent="gray"   />
        <StatCard icon={FileCheck}  label="Kontrak Aktif"   value={aktif}        accent="green"  />
        <StatCard icon={FileX}      label="Kadaluarsa"      value={kadaluarsa}   accent="red"    />
        <StatCard icon={Clock}      label="Pending"         value={pending}      accent="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ChartCard title="Nilai Kontrak per Vendor" subtitle="Top 5 vendor berdasarkan nilai" icon={BarChart2} iconColor="#10B981">
          <div style={{ width: "100%", height: 224 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={nilaiPerVendor} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => formatRupiah(v)} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: "#F0FDF4" }} />
                <Bar dataKey="nilai" fill="#10B981" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Distribusi Status Kontrak" subtitle="Persentase per kategori status" icon={PieIcon} iconColor="#10B981">
          <div style={{ width: "100%", height: 224 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="45%"
                  innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}
                >
                  {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #F1F5F9", boxShadow: "0 4px 20px rgb(0 0 0 / 0.08)" }}
                  formatter={(val, name) => [`${val} kontrak`, name]}
                />
                <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Kontrak Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-bold text-gray-900">Daftar Kontrak</h3>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari vendor, jenis…" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 w-44 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                {["ID", "Vendor", "Jenis Kontrak", "Nilai", "Exp. Date", "Status"].map((h) => (
                  <th key={h} className="pb-3 px-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length > 0 ? paged.map((log, i) => (
                <tr key={log.id || `log-${i}`} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-gray-700 text-xs">{log.id}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700 text-xs">{log.vendor}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{log.jenis}</td>
                  <td className="py-3 px-3 text-xs font-bold text-gray-700">Rp {log.nilai?.toLocaleString("id-ID") || "–"}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">{log.exp}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              )) : (
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