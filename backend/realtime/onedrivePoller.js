const { fetchOnedriveLogs } = require("../services/onedriveService");

const POLL_INTERVAL_MS = 5000;

function startOnedrivePolling(io) {
  let lastDataString = "";

  setInterval(async () => {
    try {
      // fetchOnedriveLogs() sudah handle cache sendiri:
      // - Pertama kali → download via Playwright (berat, sekali saja)
      // - Selanjutnya  → return _cache langsung (ringan)
      const dataLogs = await fetchOnedriveLogs();
      const currentDataString = JSON.stringify(dataLogs);

      if (lastDataString !== "" && lastDataString !== currentDataString) {
        console.log("📡 [Socket.io] Perubahan data terdeteksi, memancarkan...");
        io.emit("updateDataOnedrive", {
          status: "Berhasil 📝",
          dataLogs,
        });
      }

      lastDataString = currentDataString;
    } catch (error) {
      console.error("Gagal polling:", error.message);
    }
  }, POLL_INTERVAL_MS);
}

module.exports = { startOnedrivePolling };