// src/components/Header.jsx
import { Calendar, Bell, ChevronDown, User, Menu, X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MockBadge from "./MockBadge";
import { alertsData } from "../data/mockdata";

const dateOptions = [
  { label: "Hari Ini",       value: "Hari Ini"            },
  { label: "Minggu Ini",     value: "01 Jun – 07 Jun 2026" },
  { label: "Bulan Ini (Juni)", value: "Bulan Ini (Juni)"   },
];

const alertIcon = {
  error:   { Icon: AlertCircle,   cls: "text-red-500 bg-red-50"     },
  warning: { Icon: AlertTriangle, cls: "text-amber-500 bg-amber-50" },
  info:    { Icon: Info,          cls: "text-blue-500 bg-blue-50"   },
  success: { Icon: CheckCircle,   cls: "text-emerald-500 bg-emerald-50" },
};

export default function Header({ onMenuToggle }) {
  const [dateOpen, setDateOpen]       = useState(false);
  const [selected, setSelected]       = useState(dateOptions[1]);
  const [alertOpen, setAlertOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const alertRef   = useRef(null);
  const profileRef = useRef(null);
  const dateRef    = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (alertRef.current && !alertRef.current.contains(e.target))   setAlertOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target))     setDateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = alertsData.filter((a) => a.level === "error" || a.level === "warning").length;

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 z-30 shrink-0 sticky top-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-base font-extrabold text-gray-900 leading-tight">Overview Kinerja</h2>
          <p className="text-[11px] text-gray-400 leading-tight">Pemantauan sistem terpusat</p>
        </div>
        <MockBadge />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Date picker */}
        <div className="relative hidden sm:block" ref={dateRef}>
          <button
            onClick={() => { setDateOpen(!dateOpen); setAlertOpen(false); setProfileOpen(false); }}
            className="flex items-center gap-2 h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Calendar size={14} className="text-blue-500 shrink-0" />
            <span className="hidden md:inline">{selected.value}</span>
            <span className="md:hidden">{selected.label}</span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${dateOpen ? "rotate-180" : ""}`} />
          </button>
          {dateOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/80 z-50 overflow-hidden py-1.5">
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSelected(opt); setDateOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selected.value === opt.value
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                  {selected.value === opt.value && <span className="float-right text-blue-500">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => { setAlertOpen(!alertOpen); setProfileOpen(false); setDateOpen(false); }}
            className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {alertOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/80 z-50 overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900">Notifikasi</p>
                <p className="text-xs text-gray-400">{alertsData.length} peringatan aktif</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {alertsData.map((alert) => {
                  const { Icon, cls } = alertIcon[alert.level];
                  return (
                    <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cls}`}>
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 leading-snug">{alert.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{alert.time}</span>
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">{alert.divisi}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-gray-50">
                <button className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Lihat Semua →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setAlertOpen(false); setDateOpen(false); }}
            className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
              <User size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700 hidden sm:inline">Admin</span>
            <ChevronDown size={12} className={`text-gray-400 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/80 z-50 overflow-hidden py-1.5">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900">Administrator</p>
                <p className="text-xs text-gray-400">admin@maint.id</p>
              </div>
              <div className="py-1.5">
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Profil Saya</button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Pengaturan</button>
                <div className="border-t border-gray-50 mt-1.5 pt-1.5">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">Keluar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}