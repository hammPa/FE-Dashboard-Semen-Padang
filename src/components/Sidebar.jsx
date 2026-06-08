// src/components/Sidebar.jsx
import { LayoutDashboard, BarChart3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  // Fungsi penentu warna: Jika aktif biru, jika tidak transparan/abu-abu
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "hover:bg-slate-800 text-slate-300 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider">DASHBOARD</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <NavLink to="/" className={navClass} end>
          <LayoutDashboard size={20} /> Overview
        </NavLink>
        <NavLink to="/divisi-ip" className={navClass}>
          <BarChart3 size={20} /> Divisi IP
        </NavLink>
        <NavLink to="/divisi-ks" className={navClass}>
          <BarChart3 size={20} /> Divisi KS
        </NavLink>
        <NavLink to="/divisi-p" className={navClass}>
          <BarChart3 size={20} /> Divisi P
        </NavLink>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <NavLink to="/pengaturan" className={navClass}>
          <Settings size={20} /> Pengaturan
        </NavLink>
      </div>
    </aside>
  );
}
