const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const CONFIG_PATH = path.join(__dirname, "../config/sources.json");
const { invalidateCache, cleanupIfNoUrl } = require("../services/onedriveService");


router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: "Gagal membaca config" });
  }
});

router.post("/", (req, res) => {
  try {
    // Baca yang sudah ada dulu
    let existing = {};
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    } catch {
      // file belum ada, mulai kosong
    }

    // Merge — hanya timpa field yang dikirim
    const { spreadsheet_id, onedrive_url } = req.body;
    const config = {
      ...existing,
      ...(spreadsheet_id !== undefined && { spreadsheet_id }),
      ...(onedrive_url   !== undefined && { onedrive_url }),
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    if (onedrive_url !== undefined) {
      if (!onedrive_url) {
        cleanupIfNoUrl(); // URL dikosongkan → hapus file lokal
      } else {
        invalidateCache(); // URL berubah → paksa download ulang
      }
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Gagal menyimpan config" });
  }
});

module.exports = router;