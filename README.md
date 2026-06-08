# 📊 Dashboard Industri - Frontend Prototype (Minggu 1)

Proyek ini adalah _prototype_ antarmuka (UI) untuk sistem pelaporan terpusat Divisi IP, KS, dan P. Dibangun menggunakan React, Vite, dan Tailwind CSS.

## Cara Menjalankan Proyek Lokal

1. Pastikan Node.js sudah terinstal.
2. Buka terminal di folder proyek ini.
3. Jalankan `npm install` untuk mengunduh dependensi.
4. Jalankan `npm run dev` untuk menyalakan server lokal.
5. Buka tautan `http://localhost:5173` di _browser_.

## Kontrak Data (Mock API untuk Tim Backend)

Agar grafik di Frontend bisa merender data dengan benar, mohon tim Backend (BE) menyediakan _endpoint_ API dengan format JSON persis seperti di bawah ini:

### 1. Endpoint Summary (Ringkasan Total)

```json
{
  "ip": 145,
  "ks": 89,
  "p": 210,
  "lastUpdate": "2026-06-04 10:15 WIB"
}
```
