// src/components/SummaryCards.jsx
import { FileText, Clock, Database, Wifi, CheckCircle } from "lucide-react";

const divisiCards = [
  { key: "ip", label: "Divisi IP",  sub: "Inspeksi Pemeliharaan", iconBg: "bg-indigo-50 text-indigo-600",   bar: "from-indigo-500 to-violet-600", shadow: "hover:shadow-indigo-100" },
  { key: "ks", label: "Divisi KS",  sub: "Kontrak Servis",        iconBg: "bg-emerald-50 text-emerald-600", bar: "from-emerald-400 to-teal-600",   shadow: "hover:shadow-emerald-100" },
  { key: "p",  label: "Divisi P",   sub: "Planner",               iconBg: "bg-amber-50 text-amber-600",     bar: "from-amber-400 to-orange-500",   shadow: "hover:shadow-amber-100" },
];

const DIVISI_LABEL = { ip: "IP", ks: "KS", p: "P" };

/**
 * Hitung sumber aktif dari alertsData:
 * sumber dianggap DOWN kalau ada alert level "error" untuk divisi itu.
 * Total sumber = 3 (IP, KS, P).
 */
function deriveSumberAktif(alerts = []) {
  const errorDivisi = new Set(
    alerts.filter((a) => a.level === "error").map((a) => a.divisi)
  );
  const total = 3;
  const aktif = ["IP", "KS", "P"].filter((d) => !errorDivisi.has(d)).length;
  return { aktif, total };
}

export default function SummaryCards({ data, recentLogs = [], alerts = [] }) {
  const total       = (data?.ip || 0) + (data?.ks || 0) + (data?.p || 0);
  const totalRecord = total.toLocaleString("id-ID");
  const sumberAktif = deriveSumberAktif(alerts);

  // Ambil syncSuccess dari data (dikirim backend), fallback 100 kalau tidak ada
  const syncSuccess = data?.syncSuccess ?? 100;

  // Warna Sumber Aktif: merah kalau ada yang mati, hijau kalau semua OK
  const sumberColor =
    sumberAktif.aktif < sumberAktif.total
      ? { bg: "text-red-600 bg-red-50",        text: "text-red-700"     }
      : { bg: "text-emerald-600 bg-emerald-50", text: "text-emerald-700" };

  // Warna Sync Success: hijau ≥95%, kuning ≥80%, merah <80%
  const syncColor =
    syncSuccess >= 95 ? { bg: "text-emerald-600 bg-emerald-50", text: "text-emerald-700" } :
    syncSuccess >= 80 ? { bg: "text-amber-600 bg-amber-50",     text: "text-amber-700"   } :
                        { bg: "text-red-600 bg-red-50",         text: "text-red-700"     };

  const kpiCards = [
    {
      icon:      Database,
      color:     "text-blue-600 bg-blue-50",
      label:     "Total Record",
      val:       totalRecord,
      textClass: "text-slate-800",
    },
    {
      icon:      Wifi,
      color:     sumberColor.bg,
      label:     "Sumber Aktif",
      val:       `${sumberAktif.aktif}/${sumberAktif.total}`,
      textClass: sumberColor.text,
    },
    {
      // ✅ Ganti "Paling Lama Tidak Update" → "Sync Success" dari backend
      icon:      CheckCircle,
      color:     syncColor.bg,
      label:     "Sync Success",
      val:       `${syncSuccess}%`,
      textClass: syncColor.text,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3.5 transition-all duration-200 hover:shadow-md"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={18} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className={`text-xl font-black tabular-nums tracking-tight ${item.textClass}`}>
                {item.val}
              </p>
            </div>
          </div>
        ))}

        {/* Dark card: Last Update */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 flex items-center gap-3.5 shadow-md border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Terakhir</p>
            <p className="text-xs font-bold text-white leading-snug mt-0.5 tracking-wide">
              {data?.lastUpdate || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Divisi breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {divisiCards.map(({ key, label, sub, iconBg, bar, shadow }) => {
          const val = data?.[key] || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div
              key={key}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-xl transition-all duration-300 group ${shadow} hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${iconBg}`}>
                  <FileText size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${iconBg}`}>{pct}%</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <h3 className="text-3xl font-black text-slate-800 tabular-nums tracking-tight my-1">{val}</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">{sub}</p>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-1000 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}