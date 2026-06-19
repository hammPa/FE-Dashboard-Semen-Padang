const { db } = require("../config/firebase"); // hanya ambil data

// Ambil semua dataLogs dari koleksi divisi_p_logs
async function fetchPlannerLogs() {
  const snapshot = await db.collection("divisi_p_logs").get();
  const logs = [];
  snapshot.forEach((doc) => logs.push(doc.data()));
  return logs;
}

// Hitung analitik untuk Divisi P berdasarkan array logs
function hitungAnalitikPlanner(logs) {
  let readyToExecute = 0,
    waitingSparepart = 0,
    delayed = 0;

  logs.forEach((data) => {
    const status = (data.status || "").trim();
    if (status === "Ready to Execute") readyToExecute += 1;
    else if (status === "Waiting Sparepart") waitingSparepart += 1;
    else if (status === "Delayed") delayed += 1;
  });

  return {
    totalWorkOrder: logs.length,
    siapEksekusi: readyToExecute,
    menungguSparepart: waitingSparepart,
    tertunda: delayed,
    persentaseKesiapan:
      logs.length > 0
        ? Math.round((readyToExecute / logs.length) * 100) + "%"
        : "0%",
  };
}

module.exports = { fetchPlannerLogs, hitungAnalitikPlanner };