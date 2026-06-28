// src/data/mockDivisiP.js
//
// Struktur data IDENTIK dengan response dari endpoint /divisi-p.
// Gunakan sebagai fallback saat VITE_USE_MOCK=true.
// Untuk switch ke data real: set VITE_USE_MOCK=false di .env

export const mockDivisiPData = {
  dataLogs: [
    {
      id: "WO-001",
      area: "Area Produksi A",
      kategori: "Preventive",
      status_sparepart: "Tersedia",
      status: "Ready to Execute",
    },
    {
      id: "WO-002",
      area: "Area Utilitas",
      kategori: "Corrective",
      status_sparepart: "Indent",
      status: "Waiting Sparepart",
    },
    {
      id: "WO-003",
      area: "Area Produksi B",
      kategori: "Predictive",
      status_sparepart: "Tersedia",
      status: "Ready to Execute",
    },
    {
      id: "WO-004",
      area: "Gudang Bahan Baku",
      kategori: "Preventive",
      status_sparepart: "Kosong",
      status: "Delayed",
    },
    {
      id: "WO-005",
      area: "Area Produksi A",
      kategori: "Corrective",
      status_sparepart: "Tersedia",
      status: "Ready to Execute",
    },
    {
      id: "WO-006",
      area: "Area Utilitas",
      kategori: "Preventive",
      status_sparepart: "Indent",
      status: "Waiting Sparepart",
    },
    {
      id: "WO-007",
      area: "Area Produksi B",
      kategori: "Corrective",
      status_sparepart: "Tersedia",
      status: "Ready to Execute",
    },
    {
      id: "WO-008",
      area: "Gudang Bahan Baku",
      kategori: "Predictive",
      status_sparepart: "Kosong",
      status: "Delayed",
    },
    {
      id: "WO-009",
      area: "Area Produksi A",
      kategori: "Preventive",
      status_sparepart: "Tersedia",
      status: "Ready to Execute",
    },
    {
      id: "WO-010",
      area: "Area Utilitas",
      kategori: "Corrective",
      status_sparepart: "Tersedia",
      status: "Ready to Execute",
    },
  ],
};