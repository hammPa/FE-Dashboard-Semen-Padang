// backend/routes/divisiP.js
const express = require("express");
const router = express.Router();
const {
  fetchPlannerLogs,
  hitungAnalitikPlanner,
} = require("../services/firestoreService");

// GET /api/divisi-p - Menarik data dari Firestore
router.get("/", async (req, res) => {
  try {
    const logs = await fetchPlannerLogs();

    res.json({
      analitik_planner: hitungAnalitikPlanner(logs),
      dataLogs: logs,
    });
  } catch (error) {
    console.log("error woi: ", error);
    
    res.status(500).json({ pesan: "Gagal", error: error.message });
  }
});

module.exports = router;