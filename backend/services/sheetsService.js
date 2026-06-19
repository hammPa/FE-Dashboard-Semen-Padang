const { sheets, SPREADSHEET_ID } = require("../config/sheets");

// Ambil & mapping data dari Google Sheets menjadi array dataLogs
async function fetchSheetLogs() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "A:F",
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return [];

  return rows
    .slice(1)
    .map((row) => ({
      id: row[0] || "",
      area: row[1] || "",
      deskripsi: row[2] || "",
      prioritas: row[3] || "",
      tanggal: row[4] || "",
      status: row[5] || "",
    }))
    .filter((log) => log.id !== ""); // Singkirkan baris yang tidak sengaja kosong
}

// Hitung analitik untuk Divisi IP
function hitungAnalitikIP(dataLogs) {
  const totalInspeksi = dataLogs.length;
  const prioritasTinggi = dataLogs
    .filter(log => log.prioritas === "High").length;
  const menungguAnalisa = dataLogs
    .filter(log => log.status === "Menunggu Analisa").length;

  return { totalInspeksi, prioritasTinggi, menungguAnalisa };
}

module.exports = { fetchSheetLogs, hitungAnalitikIP };