// backend/routes/divisiOnedrive.js
const express = require("express");
const router = express.Router();
const {
  fetchOnedriveLogs,
  hitungAnalitikOnedrive,
} = require("../services/onedriveService");

// GET /api/divisi-onedrive - Menarik data dari file OneDrive
router.get("/", async (req, res) => {
  try {
    const dataLogs = await fetchOnedriveLogs();

    if (dataLogs.length === 0) {
      return res.json({ analitik_onedrive: {}, dataLogs: [] });
    }

    res.json({
      status: "Berhasil 📝",
      analitik_onedrive: hitungAnalitikOnedrive(dataLogs),
      dataLogs,
    });
  } catch (error) {
    console.error("Waduh, error membaca file OneDrive:", error);
    res
      .status(500)
      .json({ pesan: "Gagal menarik data dari OneDrive", error: error.message });
  }
});

module.exports = router;