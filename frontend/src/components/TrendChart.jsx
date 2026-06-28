// src/components/TrendChart.jsx
import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const LINES = [
  { key: "IP", color: "#6366F1", label: "Divisi IP"      },
  { key: "KS", color: "#10B981", label: "Divisi KS"      },
  { key: "P",  color: "#F59E0B", label: "Divisi Planner" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl p-3.5 text-sm min-w-[160px]">
      <p className="font-extrabold text-slate-700 text-xs mb-2.5 border-b border-slate-50 pb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: p.color }} />
            <span className="text-xs font-medium text-slate-500">{p.dataKey}</span>
          </div>
          <span className="text-xs font-black text-slate-800 tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data }) {
  const [activeLines, setActiveLines] = useState({ IP: true, KS: true, P: true });
  const toggleLine = (key) => setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-indigo-600" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tren Laporan Mingguan</h3>
            <p className="text-xs text-slate-400 font-medium">01 Jun – 07 Jun 2026</p>
          </div>
        </div>
        
        {/* Toggle pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {LINES.map(({ key, color, label }) => (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all duration-200 ${
                activeLines[key]
                  ? "text-slate-700 border-slate-200 bg-slate-50/50 shadow-sm"
                  : "text-slate-400 border-slate-100 bg-slate-50/30 opacity-50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full transition-transform duration-200"
                style={{ backgroundColor: color, transform: activeLines[key] ? 'scale(1.2)' : 'scale(1)' }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 lg:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              {LINES.map(({ key, color }) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.01}  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F8FAFC" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }} dx={-5} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F1F5F9', strokeWidth: 1.5 }} />
            {LINES.map(({ key, color }) =>
              activeLines[key] ? (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#grad-${key})`}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2.5, stroke: "#fff", fill: color }}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}