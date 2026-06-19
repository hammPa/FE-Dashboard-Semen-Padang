// backend/realtime/onedrivePoller.js
const { fetchOnedriveLogs } = require("../services/onedriveService");

const POLL_INTERVAL_MS = 5000; // Cek setiap 5 detik

// Polling file OneDrive secara berkala.
// Jika ada perubahan dibanding data sebelumnya, pancarkan ke channel 'updateDataOnedrive'
function startOnedrivePolling(io) {
  let lastOnedriveData = ""; // Memori untuk menyimpan status data terakhir

  setInterval(async () => {
    try {
      const dataLogs = await fetchOnedriveLogs();
      const currentDataString = JSON.stringify(dataLogs);

      // Bandingkan: Apakah isi file sekarang berbeda dengan sebelumnya?
      if (lastOnedriveData !== "" && lastOnedriveData !== currentDataString) {
        console.log(
          "📡 [Socket.io] Ada perubahan di file OneDrive! Memancarkan ke Frontend...",
        );

        io.emit("updateDataOnedrive", {
          status: "Berhasil 📝",
          dataLogs,
        });
      }

      lastOnedriveData = currentDataString;
    } catch (error) {
      console.error("Gagal melakukan polling ke OneDrive:", error.message);
    }
  }, POLL_INTERVAL_MS);
}

module.exports = { startOnedrivePolling };