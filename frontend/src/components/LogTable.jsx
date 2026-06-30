// src/components/LogTable.jsx
import { useState } from "react";
import {
  List, Search, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertTriangle, Wrench, Filter,
} from "lucide-react";

const divisiColor = {
  IP: "bg-violet-100 text-violet-700",
  KS: "bg-emerald-100 text-emerald-700",
  P:  "bg-amber-100 text-amber-700",
};

const STATUS_CONFIG = {
  // Divisi IP — Google Sheets
  "Menunggu Analisa":  { label: "Menunggu Analisa",  icon: Clock,          cls: "text-amber-700 bg-amber-50"     },
  "Menunggu analisa":  { label: "Menunggu Analisa",  icon: Clock,          cls: "text-amber-700 bg-amber-50"     },
  "Sudah Dianalisa":   { label: "Sudah Dianalisa",   icon: CheckCircle,    cls: "text-emerald-700 bg-emerald-50" }, // ✅

  // Divisi P — Firebase
  "Ready to Execute":  { label: "Siap Eksekusi",     icon: CheckCircle,    cls: "text-emerald-700 bg-emerald-50" },
  "Waiting Sparepart": { label: "Tunggu Sparepart",  icon: Wrench,         cls: "text-blue-700 bg-blue-50"       },
  "Delayed":           { label: "Tertunda",           icon: AlertTriangle,  cls: "text-red-600 bg-red-50"         },

  // Generik
  "Sukses":            { label: "Sukses",             icon: CheckCircle,    cls: "text-emerald-700 bg-emerald-50" },
  "Gagal":             { label: "Gagal",              icon: XCircle,        cls: "text-red-600 bg-red-50"         },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    icon:  Clock,
    cls:   "text-gray-500 bg-gray-100",
  };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export default function LogTable({ data }) {
  const [searchTerm,   setSearchTerm]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [filterDivisi, setFilterDivisi] = useState("Semua");
  const itemsPerPage = 5;

  const divisiOptions = ["Semua", "IP", "KS", "P"];

  const filtered = (data || []).filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (log.id     || "").toLowerCase().includes(q) ||
      (log.divisi || "").toLowerCase().includes(q) ||
      (log.sumber || "").toLowerCase().includes(q) ||
      (log.status || "").toLowerCase().includes(q);
    const matchDivisi = filterDivisi === "Semua" || log.divisi === filterDivisi;
    return matchSearch && matchDivisi;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start      = (currentPage - 1) * itemsPerPage;
  const paged      = filtered.slice(start, start + itemsPerPage);

  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleFilter = (v)  => { setFilterDivisi(v);           setCurrentPage(1); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 lg:col-span-2 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <List size={14} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Log Data Terbaru</h3>
              <p className="text-xs text-gray-400">{filtered.length} entri ditemukan</p>
            </div>
          </div>
          {/* Search — desktop */}
          <div className="relative hidden sm:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID, divisi, status…"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-48 transition-all"
            />
          </div>
        </div>

        {/* Filter pills + search mobile */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="sm:hidden relative flex-1 min-w-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari…"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 w-full transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-gray-400" />
            {divisiOptions.map((d) => (
              <button
                key={d}
                onClick={() => handleFilter(d)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  filterDivisi === d
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 -mx-1">
        <table className="w-full text-sm text-left min-w-[500px]">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <th className="pb-3 px-2">ID Log</th>
              <th className="pb-3 px-2">Divisi</th>
              <th className="pb-3 px-2">Platform</th>
              <th className="pb-3 px-2">Tanggal</th>
              <th className="pb-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length > 0 ? (
              paged.map((log, i) => (
                <tr key={log.id || `log-${i}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs font-bold text-gray-700">{log.id}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${divisiColor[log.divisi] ?? "bg-gray-100 text-gray-600"}`}>
                      {log.divisi}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{log.sumber}</td>
                  <td className="py-3 px-2 text-gray-400 text-xs whitespace-nowrap">{log.tanggal}</td>
                  <td className="py-3 px-2">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  Tidak ada data yang cocok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
          <span className="text-xs text-gray-400">
            Hal. <span className="font-bold text-gray-700">{currentPage}</span> / {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}