const express = require("express");
const router = express.Router();
const { fetchSheetLogs, hitungAnalitikIP } = require("../services/sheetsService");
const { fetchPlannerLogs, hitungAnalitikPlanner }   = require("../services/firestoreService");
const { fetchOnedriveLogs }                         = require("../services/onedriveService");

const rateLimit = {
  windowMs: 60 * 1000,
  maxRequests: 10,
  requests: [],
};

function cekRateLimit() {
  const now = Date.now();
  rateLimit.requests = rateLimit.requests.filter(t => now - t < rateLimit.windowMs);
  if (rateLimit.requests.length >= rateLimit.maxRequests) {
    const tunggu = Math.ceil((rateLimit.windowMs - (now - rateLimit.requests[0])) / 1000);
    return { boleh: false, tunggu };
  }
  rateLimit.requests.push(now);
  return { boleh: true, tunggu: 0 };
}

router.get("/quota", (req, res) => {
  const now = Date.now();
  const aktif = rateLimit.requests.filter(t => now - t < rateLimit.windowMs).length;
  res.json({
    used: aktif,
    limit: rateLimit.maxRequests,
    sisa: rateLimit.maxRequests - aktif,
  });
});

router.post("/chat", async (req, res) => {
  const { boleh, tunggu } = cekRateLimit();
  if (!boleh) {
    return res.status(429).json({
      content: [{ text: `⚠️ Terlalu banyak permintaan. Tunggu ${tunggu} detik lagi.` }]
    });
  }

  const { messages } = req.body;

  let kontekData = "";
  try {
    // Ambil semua data paralel
    const [logsIP, logsP, logsKS] = await Promise.all([
      fetchSheetLogs(),
      fetchPlannerLogs(),
      fetchOnedriveLogs(),
    ]);

    // ── Analitik IP ──
    const analitikIP  = hitungAnalitikIP(logsIP);
    const highIP      = logsIP.filter(l => l.prioritas === "High");
    const menungguIP  = logsIP.filter(l => l.status === "Menunggu Analisa");

    // ── Analitik P ──
    const analitikP   = hitungAnalitikPlanner(logsP);
    const tertundaP   = logsP.filter(l => (l.status || "").trim() === "Delayed");
    const sparepartP  = logsP.filter(l => (l.status || "").trim() === "Waiting Sparepart");

    // ── Analitik KS ──
    const totalKS     = logsKS.length;
    const aktifKS     = logsKS.filter(l => (l.status || "").toLowerCase().includes("aktif"));
    const expiredKS   = logsKS.filter(l => (l.status || "").toLowerCase().includes("expired"));

    kontekData = `
DATA REAL-TIME DIVISI IP (Inspeksi Pemeliharaan) — Google Sheets:
- Total temuan: ${analitikIP.totalInspeksi}
- Prioritas High: ${analitikIP.prioritasTinggi}
- Menunggu Analisa: ${analitikIP.menungguAnalisa}
- Sudah Dianalisa: ${analitikIP.totalInspeksi - analitikIP.menungguAnalisa}
Temuan prioritas High:
${highIP.map(l => `  • [${l.id}] ${l.area} — ${l.deskripsi} (${l.tanggal})`).join("\n")}
Temuan menunggu analisa:
${menungguIP.map(l => `  • [${l.id}] ${l.area} — ${l.prioritas}`).join("\n")}

DATA REAL-TIME DIVISI P (Planner) — Firebase:
- Total Work Order: ${analitikP.totalWorkOrder}
- Siap Eksekusi: ${analitikP.siapEksekusi}
- Tertunda: ${analitikP.tertunda}
- Waiting Sparepart: ${analitikP.menungguSparepart}
- Persentase Kesiapan: ${analitikP.persentaseKesiapan}
WO tertunda:
${tertundaP.map(l => `  • [${l.id || "-"}] ${l.deskripsi || l.nama || "-"}`).join("\n") || "  Tidak ada"}
WO waiting sparepart:
${sparepartP.map(l => `  • [${l.id || "-"}] ${l.deskripsi || l.nama || "-"}`).join("\n") || "  Tidak ada"}

DATA REAL-TIME DIVISI KS (Kontrak Servis) — OneDrive:
- Total kontrak: ${totalKS}
- Aktif: ${aktifKS.length}
- Expired: ${expiredKS.length}
Daftar kontrak:
${logsKS.map(l => `  • [${l.id}] ${l.vendor} — ${l.jenis} | Nilai: ${l.nilai.toLocaleString("id-ID")} | Exp: ${l.exp} | Status: ${l.status}`).join("\n") || "  Tidak ada data"}
    `.trim();

  } catch (e) {
    console.error("Gagal ambil data:", e.message);
    kontekData = "Data tidak dapat dimuat saat ini.";
  }

  const systemPrompt = `Kamu adalah asisten AI analis untuk dashboard MAINT — sistem pemantauan pemeliharaan industri pabrik semen.

Tugasmu adalah menganalisis data pemeliharaan dan membantu pengguna memahami kondisi sistem secara mendalam.

Kemampuanmu:
- Menganalisis tren dan pola dari data inspeksi
- Menjelaskan arti setiap metrik dan status yang ada di dashboard
- Memberikan insight dan rekomendasi berdasarkan data
- Menjelaskan istilah teknis pemeliharaan industri

Penjelasan lengkap fitur dashboard MAINT:

1. DASHBOARD UTAMA
   - Menampilkan ringkasan performa keseluruhan 3 divisi
   - Total record: gabungan data dari IP, KS, dan P
   - Sync sukses: persentase keberhasilan sinkronisasi data dari semua sumber
   - Avg latency: rata-rata waktu respons sistem dalam milidetik
   - Log aktivitas: riwayat sinkronisasi data terbaru beserta statusnya

2. DIVISI IP (Inspeksi Pemeliharaan)
   - Mencatat temuan lapangan hasil inspeksi rutin di area pabrik
   - Prioritas High = kerusakan kritis, perlu ditangani segera
   - Prioritas Medium = perlu ditangani dalam waktu dekat
   - Prioritas Low = terjadwal, tidak mendesak
   - Status "Menunggu Analisa" = belum diverifikasi tim engineer
   - Status "Sudah Dianalisa" = sudah divalidasi, solusi sedang dijalankan

3. DIVISI KS (Kontrak Servis)
   - Memantau kontrak pemeliharaan dengan vendor dan pihak ketiga
   - Mengelola jadwal servis berkala peralatan pabrik
   - Nilai kontrak dalam rupiah

4. DIVISI P (Planner)
   - Mengelola Work Order (WO) perencanaan pemeliharaan
   - Status "Ready to Execute" = WO siap dikerjakan
   - Status "Delayed" = ada hambatan pelaksanaan
   - Status "Waiting Sparepart" = menunggu suku cadang

CARA MENGANALISIS:
- Backlog "Menunggu Analisa" tinggi → tim kewalahan atau kekurangan engineer
- Banyak prioritas High menumpuk → risiko downtime produksi meningkat
- Banyak WO "Waiting Sparepart" → masalah rantai pasok suku cadang
- Kontrak KS expired → peralatan tidak terjamin servisnya

Aturan menjawab:
- Gunakan format HTML untuk bold: <b>teks</b>
- Gunakan <ul><li> untuk daftar
- Gunakan <ol><li> untuk daftar bernomor
- Gunakan <br> untuk baris baru
- Gunakan <h4> untuk subjudul
- WAJIB gunakan HTML untuk semua format. DILARANG KERAS menggunakan simbol markdown seperti **, *, __, ##, atau backtick.
- Untuk teks tebal: <b>teks</b> — BUKAN **teks**
- Jangan gunakan markdown seperti ** atau ## atau *
- Analisis mendalam, bukan sekadar membacakan data
- Berikan insight, kemungkinan penyebab, dan saran tindakan
- Jawab dalam Bahasa Indonesia
- Jika ditanya hal di luar konteks dashboard, tolak dengan sopan

${kontekData}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      }
    );
    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, tidak ada respons.";
    res.json({ content: [{ text }] });
  } catch (e) {
    console.error("Error detail:", e.message, e.stack);
    res.status(500).json({ content: [{ text: "Terjadi kesalahan server." }] });
  }
});

module.exports = router;