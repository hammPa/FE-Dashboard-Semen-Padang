// src/data/mockdata.js

export const summaryData = {
  ip: 145,
  ks: 89,
  p: 210,
  lastUpdate: "2026-06-04 10:15 WIB",
};

export const trendData = [
  { date: "01 Jun", IP: 20, KS: 10, P: 30 },
  { date: "02 Jun", IP: 25, KS: 15, P: 35 },
  { date: "03 Jun", IP: 22, KS: 12, P: 28 },
  { date: "04 Jun", IP: 30, KS: 18, P: 40 },
  { date: "05 Jun", IP: 28, KS: 20, P: 38 },
  { date: "06 Jun", IP: 35, KS: 25, P: 45 },
  { date: "07 Jun", IP: 40, KS: 30, P: 50 },
];

export const sourceData = [
  { name: "Google Sheets", value: 45, color: "#10B981" },
  { name: "Firebase",      value: 35, color: "#F59E0B" },
  { name: "OneDrive",      value: 20, color: "#3B82F6" },
];

export const recentLogs = [
  { id: "LOG-001", divisi: "IP", sumber: "Google Sheets", tanggal: "07 Jun 2026", status: "Sukses" },
  { id: "LOG-002", divisi: "KS", sumber: "Firebase",      tanggal: "07 Jun 2026", status: "Sukses" },
  { id: "LOG-003", divisi: "P",  sumber: "OneDrive",      tanggal: "07 Jun 2026", status: "Sukses" },
  { id: "LOG-004", divisi: "IP", sumber: "Firebase",      tanggal: "06 Jun 2026", status: "Sukses" },
  { id: "LOG-005", divisi: "KS", sumber: "Google Sheets", tanggal: "05 Jun 2026", status: "Sukses" },
  { id: "LOG-006", divisi: "P",  sumber: "Google Sheets", tanggal: "05 Jun 2026", status: "Sukses" },
  { id: "LOG-007", divisi: "IP", sumber: "OneDrive",      tanggal: "04 Jun 2026", status: "Gagal"  },
  { id: "LOG-008", divisi: "KS", sumber: "Firebase",      tanggal: "04 Jun 2026", status: "Sukses" },
  { id: "LOG-009", divisi: "P",  sumber: "Firebase",      tanggal: "03 Jun 2026", status: "Sukses" },
  { id: "LOG-010", divisi: "IP", sumber: "Google Sheets", tanggal: "03 Jun 2026", status: "Sukses" },
  { id: "LOG-011", divisi: "KS", sumber: "OneDrive",      tanggal: "02 Jun 2026", status: "Sukses" },
  { id: "LOG-012", divisi: "P",  sumber: "Google Sheets", tanggal: "01 Jun 2026", status: "Sukses" },
];

export const alertsData = [
  { id: "A-001", title: "Gagal Sinkronisasi OneDrive",  level: "error",   time: "10 Menit yang lalu", divisi: "IP" },
  { id: "A-002", title: "Koneksi Firebase Melambat",    level: "warning", time: "1 Jam yang lalu",    divisi: "KS" },
];