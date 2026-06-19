// backend/realtime/sheetsPoller.js
const { fetchSheetLogs } = require("../services/sheetsService");

const POLL_INTERVAL_MS = 5000; // Cek setiap 5 detik

// Polling Google Sheets secara berkala.
// Jika ada perubahan dibanding data sebelumnya, pancarkan ke channel 'updateDataIP'
function startSheetsPolling(io) {
  let lastSheetData = ""; // Memori untuk menyimpan status data terakhir

  setInterval(async () => {
    try {
      const dataLogs = await fetchSheetLogs();
      const currentDataString = JSON.stringify(dataLogs);

      // Bandingkan: Apakah isi excel sekarang berbeda dengan sebelumnya?
      if (lastSheetData !== "" && lastSheetData !== currentDataString) {
        console.log(
          "[Socket.io] Ada perubahan di Google Sheets Divisi IP! Memancarkan ke Frontend...",
        );

        io.emit("updateDataIP", {
          status: "Berhasil",
          dataLogs,
        });
      }

      lastSheetData = currentDataString;
    }
    catch (error) {
      console.error("Gagal melakukan polling ke Google Sheets:", error.message);
    }
  }, POLL_INTERVAL_MS);
}

module.exports = { startSheetsPolling };