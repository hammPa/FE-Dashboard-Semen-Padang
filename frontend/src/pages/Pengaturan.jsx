// src/pages/Pengaturan.jsx
//
// Config sumber data disimpan secara lokal menggunakan LocalStorage
// Catatan: Karena menggunakan LocalStorage, backend tidak bisa "listen" secara real-time.
// Konfigurasi ini hanya berlaku di browser/perangkat ini.

import { useEffect, useState, useCallback } from "react";
import {
  Settings, Database, Bell, Shield, RefreshCw,
  CheckCircle, Save, Eye, EyeOff, AlertCircle, Loader2, Pencil, X,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const CONFIG_PATH = "app-config";

const DEFAULT_CONFIG = {
  google_sheets: {
    sheet_id: "",
    tab_divisi_ip: "DivisiIP",
    interval_minutes: 5,
    active: true,
  },
  onedrive: {
    client_id: "",
    folder_path: "/MaintenanceDashboard/DivisiKS",
    interval_minutes: 10,
    active: true,
  },
  firebase: {
    project_id: "",
    database_url: "",
    active: true,
  },
};

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-600 text-white",
    error:   "bg-red-500 text-white",
    info:    "bg-blue-600 text-white",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${styles[type]}`}>
      {type === "success" && <CheckCircle size={15} />}
      {type === "error"   && <AlertCircle size={15} />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 items-start py-3 border-b border-gray-50 last:border-0">
      <div className="sm:col-span-1">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, secret = false, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={secret && !show ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-8 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:opacity-50 transition-all"
      />
      {secret && (
        <button type="button" onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      )}
    </div>
  );
}

function NumberInput({ value, onChange, min = 1, max = 60, disabled }) {
  return (
    <input
      type="number" min={min} max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-24 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:opacity-50 transition-all"
    />
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!checked)} disabled={disabled}
      className={`w-10 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        checked ? "bg-blue-600" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-1"}`} />
    </button>
  );
}

// ─── Section cards ───────────────────────────────────────────────────────────

function SheetsSection({ cfg, onChange, editing, disabled }) {
  return (
    <div>
      <FieldRow label="Sheet ID" hint="ID dari URL Google Sheets kamu">
        <TextInput value={cfg.sheet_id} onChange={(v) => onChange("sheet_id", v)}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUq…" disabled={!editing || disabled} />
      </FieldRow>
      <FieldRow label="Nama Tab Divisi IP" hint="Nama sheet/tab yang berisi data inspeksi">
        <TextInput value={cfg.tab_divisi_ip} onChange={(v) => onChange("tab_divisi_ip", v)}
          placeholder="DivisiIP" disabled={!editing || disabled} />
      </FieldRow>
      <FieldRow label="Interval Sinkronisasi" hint="Seberapa sering data diambil (menit)">
        <div className="flex items-center gap-2">
          <NumberInput value={cfg.interval_minutes} onChange={(v) => onChange("interval_minutes", v)}
            disabled={!editing || disabled} />
          <span className="text-xs text-gray-400">menit</span>
        </div>
      </FieldRow>
      <FieldRow label="Aktif">
        <Toggle checked={cfg.active} onChange={(v) => onChange("active", v)} disabled={!editing || disabled} />
      </FieldRow>
    </div>
  );
}

function OneDriveSection({ cfg, onChange, editing, disabled }) {
  return (
    <div>
      <FieldRow label="Client ID" hint="Azure App Registration Client ID">
        <TextInput value={cfg.client_id} onChange={(v) => onChange("client_id", v)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" secret disabled={!editing || disabled} />
      </FieldRow>
      <FieldRow label="Folder Path" hint="Path folder di OneDrive">
        <TextInput value={cfg.folder_path} onChange={(v) => onChange("folder_path", v)}
          placeholder="/MaintenanceDashboard/DivisiKS" disabled={!editing || disabled} />
      </FieldRow>
      <FieldRow label="Interval Sinkronisasi" hint="Seberapa sering data diambil (menit)">
        <div className="flex items-center gap-2">
          <NumberInput value={cfg.interval_minutes} onChange={(v) => onChange("interval_minutes", v)}
            disabled={!editing || disabled} />
          <span className="text-xs text-gray-400">menit</span>
        </div>
      </FieldRow>
      <FieldRow label="Aktif">
        <Toggle checked={cfg.active} onChange={(v) => onChange("active", v)} disabled={!editing || disabled} />
      </FieldRow>
    </div>
  );
}

function FirebaseSection({ cfg, onChange, editing, disabled }) {
  return (
    <div>
      <FieldRow label="Project ID" hint="Nama project Firebase kamu">
        <TextInput value={cfg.project_id} onChange={(v) => onChange("project_id", v)}
          placeholder="nama-project-firebase" disabled={!editing || disabled} />
      </FieldRow>
      <FieldRow label="Database URL" hint="URL Realtime Database">
        <TextInput value={cfg.database_url} onChange={(v) => onChange("database_url", v)}
          placeholder="https://nama-project-default-rtdb.firebaseio.com" disabled={!editing || disabled} />
      </FieldRow>
      <FieldRow label="Aktif">
        <Toggle checked={cfg.active} onChange={(v) => onChange("active", v)} disabled={!editing || disabled} />
      </FieldRow>
    </div>
  );
}

// ─── Source card wrapper ─────────────────────────────────────────────────────

const SOURCE_META = {
  google_sheets: { label: "Google Sheets", emoji: "📊", color: "emerald", desc: "Divisi IP · Sinkronisasi berkala" },
  onedrive:      { label: "OneDrive",      emoji: "☁️", color: "blue",    desc: "Divisi KS · Sinkronisasi berkala" },
  firebase:      { label: "Firebase",      emoji: "🔥", color: "amber",   desc: "Divisi P · Real-time WebSocket" },
};

const COLOR_BADGE = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blue:    "bg-blue-100 text-blue-700 border-blue-200",
  amber:   "bg-amber-100 text-amber-700 border-amber-200",
};

function SourceCard({ sourceKey, cfg, onFieldChange, saving }) {
  const [editing, setEditing] = useState(false);
  const meta = SOURCE_META[sourceKey];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <p className="text-sm font-bold text-gray-800">{meta.label}</p>
            <p className="text-[11px] text-gray-400">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${COLOR_BADGE[meta.color]}`}>
            <CheckCircle size={10} />
            {cfg.active ? "Aktif" : "Nonaktif"}
          </span>
          <button
            onClick={() => setEditing((e) => !e)}
            disabled={saving}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              editing ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            {editing ? <X size={13} /> : <Pencil size={13} />}
          </button>
        </div>
      </div>

      {/* Collapsible fields */}
      {editing && (
        <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
          {sourceKey === "google_sheets" && (
            <SheetsSection cfg={cfg} onChange={onFieldChange} editing={editing} disabled={saving} />
          )}
          {sourceKey === "onedrive" && (
            <OneDriveSection cfg={cfg} onChange={onFieldChange} editing={editing} disabled={saving} />
          )}
          {sourceKey === "firebase" && (
            <FirebaseSection cfg={cfg} onChange={onFieldChange} editing={editing} disabled={saving} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Notification prefs ──────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { key: "sync_fail",   label: "Gagal sinkronisasi",       desc: "Beritahu saat sumber data gagal terhubung" },
  { key: "new_data",    label: "Laporan baru masuk",        desc: "Notifikasi real-time setiap ada data baru" },
  { key: "contract",    label: "Kontrak hampir expired",    desc: "Peringatan 7 hari sebelum kontrak KS habis" },
  { key: "daily_recap", label: "Ringkasan harian",          desc: "Kirim ringkasan ke email setiap pukul 08:00" },
];

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Pengaturan() {
  const [config, setConfig]         = useState(DEFAULT_CONFIG);
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const [notifPrefs, setNotifPrefs] = useState({
    sync_fail: true, new_data: true, contract: false, daily_recap: false,
  });

  // Load config dari LocalStorage saat mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(CONFIG_PATH);
      if (savedConfig) {
        setConfig((prev) => ({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) }));
      }
    } catch (err) {
      console.error("Local Storage read error:", err);
      setToast({ type: "error", message: "Gagal memuat config dari Local Storage." });
    } finally {
      setLoadingCfg(false);
    }
  }, []);

  // Update satu field dalam satu source
  const handleFieldChange = useCallback((sourceKey, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [sourceKey]: { ...prev[sourceKey], [field]: value },
    }));
  }, []);

  // Simpan semua config ke LocalStorage
  const handleSave = () => {
    setSaving(true);
    
    // Sedikit delay simulasi agar ada feedback visual tombol loading
    setTimeout(() => {
      try {
        localStorage.setItem(CONFIG_PATH, JSON.stringify(config));
        setToast({ type: "success", message: "Konfigurasi berhasil disimpan secara lokal." });
      } catch (err) {
        console.error("Save error:", err);
        setToast({ type: "error", message: "Gagal menyimpan ke Local Storage." });
      } finally {
        setSaving(false);
      }
    }, 400); 
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Settings size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Pengaturan</h2>
            <p className="text-xs text-gray-400">Kelola koneksi sumber data dan preferensi sistem</p>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || loadingCfg}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          {saving
            ? <><Loader2 size={13} className="animate-spin" /> Menyimpan…</>
            : <><Save size={13} /> Simpan Perubahan</>
          }
        </button>
      </div>

      {/* Data Sources */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Database size={15} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Sumber Data</h3>
          <span className="text-[10px] text-gray-400 ml-auto">Klik ✏️ untuk edit</span>
        </div>

        {loadingCfg ? (
          <div className="flex items-center gap-2 py-8 justify-center text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Memuat konfigurasi…
          </div>
        ) : (
          <div className="space-y-3">
            {Object.keys(SOURCE_META).map((key) => (
              <SourceCard
                key={key}
                sourceKey={key}
                cfg={config[key] ?? DEFAULT_CONFIG[key]}
                onFieldChange={(field, value) => handleFieldChange(key, field, value)}
                saving={saving}
              />
            ))}
          </div>
        )}

        <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
          Konfigurasi disimpan secara lokal di browser kamu (Local Storage) dengan nama key <code className="font-mono bg-gray-100 px-1 rounded">{CONFIG_PATH}</code>.
        </p>
      </div>

      {/* Notifikasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={15} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
        </div>
        <div className="space-y-1">
          {NOTIF_ITEMS.map((item) => (
            <label key={item.key}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Toggle
                checked={notifPrefs[item.key]}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, [item.key]: v }))}
              />
            </label>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={15} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Informasi Sistem</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Versi Dashboard</p>
              <p className="text-xs text-gray-400">MAINT Dashboard v2.0.0</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Up to date
            </span>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Penyimpanan Config</p>
              <p className="text-xs text-gray-400">Browser Local Storage · {CONFIG_PATH}</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              💻 Lokal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}