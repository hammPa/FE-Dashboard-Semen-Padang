import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const accentMap = {
  gray:   { iconBg: "bg-slate-100", iconText: "text-slate-600", val: "text-slate-800" },
  red:    { iconBg: "bg-rose-100",  iconText: "text-rose-600",  val: "text-rose-700" },
  orange: { iconBg: "bg-amber-100", iconText: "text-amber-600", val: "text-amber-700" },
  green:  { iconBg: "bg-teal-100",  iconText: "text-teal-600",  val: "text-teal-700" },
  blue:   { iconBg: "bg-sky-100",   iconText: "text-sky-600",   val: "text-sky-700" },
  purple: { iconBg: "bg-indigo-100",iconText: "text-indigo-600",val: "text-indigo-700" },
};

export default function StatCard({ icon: Icon, label, value, accent = "gray", trend, sub }) {
  const s = accentMap[accent] ?? accentMap.gray;
  const isPositive = trend?.startsWith("+");
  const isNegative = trend?.startsWith("-");

  const TrendIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;

  return (
    <div className="group relative bg-white rounded-2xl p-5 flex flex-col justify-between gap-4 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${s.iconBg} ${s.iconText}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPositive ? "bg-teal-50 text-teal-600" : isNegative ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
          }`}>
            <TrendIcon size={14} />
            <span>{trend.replace(/[+-]/, '')}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className={`text-3xl font-bold tracking-tight tabular-nums ${s.val}`}>{value}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}