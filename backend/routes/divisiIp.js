// backend/routes/divisiIp.js
const express = require("express");
const router = express.Router();
const { fetchSheetLogs, hitungAnalitikIP } = require("../services/sheetsService");

// GET /api/divisi-ip - Menarik data dari Google Sheets
router.get("/", async (req, res) => {
  try {
    const dataLogs = await fetchSheetLogs();

    if (dataLogs.length === 0) {
      return res.json({ analitik_ip: {}, dataLogs: [] });
    }

    res.json({
      status: "Berhasil 📝",
      analitik_ip: hitungAnalitikIP(dataLogs),
      dataLogs,
    });
  } catch (error) {
    console.error("Waduh, error membaca Google Sheets:", error);
    res
      .status(500)
      .json({ pesan: "Gagal menarik data dari Sheets", error: error.message });
  }
});

module.exports = router;