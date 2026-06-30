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
    // 1. Fungsi helper agar kegagalan 1 sumber tidak menyebabkan crash pada semua sumber
    const tarikAman = async (fungsiFetch, nama) => {
      try {
        const data = await fungsiFetch();
        return { nama, status: "Sukses", data };
      } catch (err) {
        console.error(`⚠️ Chat API: Gagal narik ${nama}:`, err.message);
        return { nama, status: "Gagal", data: [] }; 
      }
    };

    // 2. Ambil data secara paralel namun aman
    const hasilFetch = await Promise.all([
      tarikAman(fetchSheetLogs, "Google Sheets (IP)"),
      tarikAman(fetchPlannerLogs, "Firebase (P)"),
      tarikAman(fetchOnedriveLogs, "OneDrive (KS)"),
    ]);

    // 3. Kalkulasi Sumber Aktif
    const sumberSukses = hasilFetch.filter(h => h.status === "Sukses").length;
    const totalSumber  = hasilFetch.length;

    // Ekstrak data array dari masing-masing hasil
    const logsIP = hasilFetch[0].data;
    const logsP  = hasilFetch[1].data;
    const logsKS = hasilFetch[2].data;

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
    // Ambil data yang aktif (opsional, jika ingin ditampilkan jumlahnya saja)
    const aktifKS     = logsKS.filter(l => (l.status || "").toLowerCase().includes("aktif"));
    // Ambil data yang expired untuk dicantumkan di prompt
    const expiredKS   = logsKS.filter(l => (l.status || "").toLowerCase().includes("expired"));

    // 4. Bangun teks konteks dengan pencegah undefined
    kontekData = `
STATUS KONEKSI SISTEM:
- Sumber Data Aktif: ${sumberSukses} dari ${totalSumber}
- Detail Koneksi: ${hasilFetch.map(h => `${h.nama}: ${h.status}`).join(", ")}

DATA REAL-TIME DIVISI IP (Inspeksi Pemeliharaan) — Google Sheets:
- Total temuan: ${analitikIP.totalInspeksi || 0}
- Prioritas High: ${analitikIP.prioritasTinggi || 0}
- Menunggu Analisa: ${analitikIP.menungguAnalisa || 0}
- Sudah Dianalisa: ${(analitikIP.totalInspeksi || 0) - (analitikIP.menungguAnalisa || 0)}
Temuan prioritas High:
${highIP.length > 0 ? highIP.map(l => `  • [${l.id}] ${l.area} — ${l.deskripsi} (${l.tanggal})`).join("\n") : "  Tidak ada"}
Temuan menunggu analisa:
${menungguIP.length > 0 ? menungguIP.map(l => `  • [${l.id}] ${l.area} — ${l.prioritas}`).join("\n") : "  Tidak ada"}

DATA REAL-TIME DIVISI P (Planner) — Firebase:
- Total Work Order: ${analitikP.totalWorkOrder || 0}
- Siap Eksekusi: ${analitikP.siapEksekusi || 0}
- Tertunda: ${analitikP.tertunda || 0}
- Waiting Sparepart: ${analitikP.menungguSparepart || 0}
- Persentase Kesiapan: ${analitikP.persentaseKesiapan || 0}%
WO tertunda:
${tertundaP.length > 0 ? tertundaP.map(l => `  • [${l.id || "-"}] ${l.deskripsi || l.nama || "-"}`).join("\n") : "  Tidak ada"}
WO waiting sparepart:
${sparepartP.length > 0 ? sparepartP.map(l => `  • [${l.id || "-"}] ${l.deskripsi || l.nama || "-"}`).join("\n") : "  Tidak ada"}

DATA REAL-TIME DIVISI KS (Kontrak Servis) — OneDrive:
- Total kontrak: ${totalKS || 0}
- Aktif: ${aktifKS.length || 0}
- Expired: ${expiredKS.length || 0}
Daftar kontrak expired:
${expiredKS.length > 0 ? expiredKS.map(l => `  • [${l.id}] ${l.vendor} | Nilai: ${l.nilai ? l.nilai.toLocaleString("id-ID") : 0} | Exp: ${l.exp}`).join("\n") : "  Tidak ada kontrak expired"}
    `.trim();

  } catch (e) {
    console.error("Gagal menyusun konteks data:", e.message);
    kontekData = "Data tidak dapat dimuat saat ini karena gangguan internal server.";
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