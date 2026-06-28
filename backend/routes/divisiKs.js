// backend/routes/divisiOnedrive.js
//
// Route ini melayani GET /api/divisi-ks
// Data diambil dari OneDrive via Playwright (cache in-memory).
// Download hanya terjadi SEKALI selama server hidup.
// Untuk force refresh: GET /api/divisi-ks/refresh

const express = require("express");
const router  = express.Router();
const { fetchOnedriveLogs, invalidateCache } = require("../services/onedriveService");

// GET /api/divisi-ks
router.get("/", async (req, res) => {
  try {
    const dataLogs = await fetchOnedriveLogs();

    if (!dataLogs || dataLogs.length === 0) {
      // Tetap return struktur yang benar agar frontend tidak crash
      return res.json({ dataLogs: [] });
    }

    // ✅ Struktur HARUS { dataLogs: [...] } — sama persis dengan mockDivisiKSData
    res.json({ dataLogs });

  } catch (error) {
    console.error("❌ Error route /api/divisi-ks:", error);
    res.status(500).json({
      pesan: "Gagal menarik data dari OneDrive",
      error: error.message,
    });
  }
});

// GET /api/divisi-ks/refresh — paksa download ulang dari OneDrive
router.get("/refresh", async (req, res) => {
  try {
    invalidateCache();
    const dataLogs = await fetchOnedriveLogs();
    res.json({ pesan: "Cache diperbarui", total: dataLogs.length, dataLogs });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal refresh", error: error.message });
  }
});

module.exports = router;