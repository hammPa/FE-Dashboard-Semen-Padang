const express = require("express");
const router  = express.Router();
const { buildDashboardData } = require("../services/dashboardService");

router.get("/", async (req, res) => {
  try {
    const data = await buildDashboardData();
    res.json(data);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ pesan: "Gagal build dashboard", error: error.message });
  }
});

module.exports = router;