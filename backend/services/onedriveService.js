// backend/services/onedriveService.js
const axios = require("axios");
const XLSX = require("xlsx");

// Link share OneDrive yang sudah di-set "Anyone with the link can view"
// Ditaruh di .env, contoh: ONEDRIVE_FILE_URL=https://1drv.ms/x/s!Axxxxx...
const ONEDRIVE_FILE_URL = process.env.ONEDRIVE_FILE_URL || "";

// Ubah link share OneDrive (1drv.ms / onedrive.live.com) menjadi link download langsung
function toDirectDownloadUrl(shareUrl) {
  if (!shareUrl) return shareUrl;

  // Format lama: https://onedrive.live.com/...redir?resid=...
  if (shareUrl.includes("onedrive.live.com")) {
    return shareUrl.includes("?")
      ? `${shareUrl}&download=1`
      : `${shareUrl}?download=1`;
  }

  // Format short link: https://1drv.ms/x/s!xxxxxxx
  if (shareUrl.includes("1drv.ms")) {
    return shareUrl.includes("?")
      ? `${shareUrl}&download=1`
      : `${shareUrl}?download=1`;
  }

  return shareUrl;
}

// Download file dari OneDrive lalu ubah jadi array of rows (mentah, belum mapping)
async function downloadAndParse() {
  if (!ONEDRIVE_FILE_URL) {
    throw new Error("ONEDRIVE_FILE_URL belum diatur di .env");
  }

  const directUrl = toDirectDownloadUrl(ONEDRIVE_FILE_URL);

  const response = await axios.get(directUrl, {
    responseType: "arraybuffer",
    // OneDrive sering melakukan redirect, axios sudah follow secara default
  });

  // XLSX.read bisa baca buffer Excel (.xlsx/.xls) maupun CSV
  const workbook = XLSX.read(response.data, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  // Hasil: array of array, sama seperti format Google Sheets values.get
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
  return rows;
}

// Ambil & mapping data dari OneDrive menjadi array dataLogs
// Struktur kolom disamakan dengan Divisi IP: id, area, deskripsi, prioritas, tanggal, status
async function fetchOnedriveLogs() {
  const rows = await downloadAndParse();
  if (!rows || rows.length <= 1) return [];

  return rows
    .slice(1) // baris pertama dianggap header
    .map((row) => ({
      id: row[0] || "",
      area: row[1] || "",
      deskripsi: row[2] || "",
      prioritas: row[3] || "",
      tanggal: row[4] || "",
      status: row[5] || "",
    }))
    .filter((log) => log.id !== "");
}

// Hitung analitik untuk Divisi OneDrive (sama pola dengan Divisi IP)
function hitungAnalitikOnedrive(dataLogs) {
  const totalData = dataLogs.length;
  const prioritasTinggi = dataLogs.filter(
    (log) => log.prioritas === "High",
  ).length;
  const menungguAnalisa = dataLogs.filter(
    (log) => log.status === "Menunggu Analisa",
  ).length;

  return { totalData, prioritasTinggi, menungguAnalisa };
}

module.exports = { fetchOnedriveLogs, hitungAnalitikOnedrive };