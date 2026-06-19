// backend/realtime/firebaseWatcher.js
const { db } = require("../config/firebase");
const { hitungAnalitikPlanner } = require("../services/firestoreService");

// Mendengarkan perubahan real-time di koleksi divisi_p_logs
// dan memancarkan data terbaru ke seluruh client via socket.io
function watchFirebaseChanges(io) {
  try {
    db.collection("divisi_p_logs").onSnapshot((snapshot) => {
      try {
        const logs = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          logs.push({
            id: data.id || doc.id || "",
            area: data.area || "",
            deskripsi: data.deskripsi || "",
            prioritas: data.prioritas || "",
            tanggal: data.tanggal || "",
            status: data.status || "",
            kategori: data.kategori || "Umum",
            status_sparepart: data.status_sparepart || "Belum Dicek"
          });
        });
        io.emit("updateDataPlanner", {
          analitik_planner: hitungAnalitikPlanner(logs),
          dataLogs: logs,
        });
      }
      catch (innerError) {
        console.error("Error processing Firestore snapshot:", innerError);
      }
    },
    (error) => {
      console.error("Firebase watch Error:", error);
    });
  }
  catch (error) {
    console.error("Failed to setup Firebase watcher:", error);
  }
}

module.exports = { watchFirebaseChanges };