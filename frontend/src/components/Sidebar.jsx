// src/components/Sidebar.jsx
import { LayoutDashboard, BarChart3, Settings, Zap, X, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/",          icon: LayoutDashboard, label: "Overview",       sub: "Ringkasan Sistem",  end: true },
  { to: "/divisi-ip", icon: BarChart3,       label: "Divisi IP",      sub: "Google Sheets"              },
  { to: "/divisi-ks", icon: BarChart3,       label: "Divisi KS",      sub: "One Drive"                  },
  { to: "/divisi-p",  icon: BarChart3,       label: "Divisi Planner", sub: "Firebase"                   },
];

export default function Sidebar({ isOpen, onClose }) {
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group relative ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/25"
        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
    }`;

  const sidebarContent = (
    <aside className="flex flex-col h-full bg-slate-950 text-white">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-widest text-white uppercase leading-none">MAINT</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Dashboard v2.0</p>
          </div>
        </div>
        {/* Close button (mobile only) */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Menu Utama</p>
        {navItems.map(({ to, icon: Icon, label, sub, end }) => (
          <NavLink key={to} to={to} className={navClass} end={end} onClick={onClose}>
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "bg-white/15" : "bg-slate-800/60 group-hover:bg-slate-700/60"
                }`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight truncate">{label}</div>
                  {sub && <div className={`text-[11px] truncate mt-0.5 ${isActive ? "text-blue-200/70" : "text-slate-600 group-hover:text-slate-500"}`}>{sub}</div>}
                </div>
                {isActive && <ChevronRight size={14} className="text-white/60 shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-2 shrink-0">
        {/* Status indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/50">
          <div className="relative flex shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="animate-ping absolute inline-flex w-2 h-2 rounded-full bg-emerald-400 opacity-60" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-300 font-medium">Sistem Aktif</p>
            <p className="text-[10px] text-slate-600 truncate">3 sumber terhubung</p>
          </div>
        </div>

        <NavLink
          to="/pengaturan"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
            }`
          }
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center">
            <Settings size={16} />
          </div>
          <span className="text-sm font-semibold">Pengaturan</span>
        </NavLink>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 border-r border-slate-800 flex-col h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}