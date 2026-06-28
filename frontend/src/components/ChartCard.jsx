// src/components/ChartCard.jsx
export default function ChartCard({ title, subtitle, icon: Icon, iconColor = "#6B7280", children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon size={15} style={{ color: iconColor }} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Chart area — flex-1 + min-h-0 agar ResponsiveContainer dapat ukuran nyata */}
      <div className="w-full" style={{ minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}