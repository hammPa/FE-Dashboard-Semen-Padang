// src/components/SourceChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Database, Wifi } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-xl shadow-xl px-3 py-1.5 text-xs font-bold">
      {payload[0].name}: {payload[0].value}%
    </div>
  );
};

// ✅ uptimeMap dibangun dari props.uptimeBySource — tidak import mockdata
export default function SourceChart({ data, uptimeBySource = {} }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  const dataWithPct = data.map((d) => ({
    ...d,
    pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
    // ✅ Uptime: dari props kalau ada, fallback ke 99 kalau backend belum kirim
    uptime: uptimeBySource[d.name] ?? 99,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 lg:p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Database size={16} className="text-blue-600" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Distribusi Sumber Data</h3>
            <p className="text-xs text-slate-400 font-medium">Proporsi per integrasi</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-44 w-full relative my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPct}
                cx="50%" cy="50%"
                innerRadius={54} outerRadius={72}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={0}
              >
                {dataWithPct.map((entry, i) => (
                  <Cell key={i} fill={entry.color} className="focus:outline-none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-2xl font-black text-slate-800 tracking-tight">100%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
          </div>
        </div>
      </div>

      {/* Legend + uptime bars */}
      <div className="mt-4 space-y-3.5">
        {dataWithPct.map((item, i) => (
          <div key={i} className="space-y-1.5 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-600 font-semibold">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-emerald-100/50">
                  <Wifi size={10} className="animate-pulse" />
                  {/* ✅ Uptime dari data, bukan hardcode */}
                  <span>{item.uptime}%</span>
                </div>
                <span className="text-xs font-black text-slate-700 w-8 text-right tabular-nums">
                  {item.pct}%
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}