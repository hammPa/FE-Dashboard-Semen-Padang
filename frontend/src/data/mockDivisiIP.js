// src/data/mockDivisiIP.js
//
// Struktur data IDENTIK dengan response dari endpoint /divisi-ip.
// Gunakan sebagai fallback saat VITE_USE_MOCK=true.
// Untuk switch ke data real: set VITE_USE_MOCK=false di .env

export const mockDivisiIPData = {
  dataLogs: [
    {
      id: "INS-001",
      area: "Area Produksi A",
      deskripsi: "Kerusakan belt conveyor utama unit 3",
      prioritas: "High",
      tanggal: "01 Jun 2026",
      status: "Menunggu Analisa",
    },
    {
      id: "INS-002",
      area: "Area Utilitas",
      deskripsi: "Kebocoran pipa steam line jalur barat",
      prioritas: "High",
      tanggal: "02 Jun 2026",
      status: "Sudah Dianalisa",
    },
    {
      id: "INS-003",
      area: "Area Produksi B",
      deskripsi: "Vibrasi berlebih pada motor pompa P-102",
      prioritas: "Medium",
      tanggal: "02 Jun 2026",
      status: "Menunggu Analisa",
    },
    {
      id: "INS-004",
      area: "Gudang Bahan Baku",
      deskripsi: "Lampu penerangan area loading dock mati",
      prioritas: "Low",
      tanggal: "03 Jun 2026",
      status: "Sudah Dianalisa",
    },
    {
      id: "INS-005",
      area: "Area Produksi A",
      deskripsi: "Temperatur bearing motor induk melebihi ambang batas",
      prioritas: "High",
      tanggal: "04 Jun 2026",
      status: "Menunggu Analisa",
    },
    {
      id: "INS-006",
      area: "Area Utilitas",
      deskripsi: "Filter udara kompresor tersumbat, tekanan drop 15%",
      prioritas: "Medium",
      tanggal: "04 Jun 2026",
      status: "Sudah Dianalisa",
    },
    {
      id: "INS-007",
      area: "Area Produksi B",
      deskripsi: "Seal pompa centrifugal bocor di area pendinginan",
      prioritas: "High",
      tanggal: "05 Jun 2026",
      status: "Menunggu Analisa",
    },
    {
      id: "INS-008",
      area: "Gudang Bahan Baku",
      deskripsi: "Rak penyimpanan baris C perlu penguatan struktur",
      prioritas: "Low",
      tanggal: "06 Jun 2026",
      status: "Sudah Dianalisa",
    },
    {
      id: "INS-009",
      area: "Area Produksi A",
      deskripsi: "Gearbox unit 5 mengeluarkan suara abnormal saat startup",
      prioritas: "Medium",
      tanggal: "06 Jun 2026",
      status: "Menunggu Analisa",
    },
    {
      id: "INS-010",
      area: "Area Utilitas",
      deskripsi: "Panel distribusi listrik zona D overheating",
      prioritas: "High",
      tanggal: "07 Jun 2026",
      status: "Menunggu Analisa",
    },
  ],
};