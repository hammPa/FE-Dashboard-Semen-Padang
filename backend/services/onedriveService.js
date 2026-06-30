// backend/services/onedriveService.js

const { firefox } = require("playwright");
const XLSX = require("xlsx");
const fs   = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../config/sources.json");

function getShareUrl() {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw).onedrive_url || "";
}

const SAVE_PATH = path.join(__dirname, "../download/Hasil_Download_Log.xlsx");

let _cache        = null;
let _fetchPromise = null;

// ── Baca file lokal kalau sudah ada ──────────────────────────────────────────
function readLocalFile() {
  if (fs.existsSync(SAVE_PATH)) {
    console.log("📂 File lokal ditemukan, membaca dari disk...");
    return fs.readFileSync(SAVE_PATH);
  }
  return null;
}

// ── Download via Playwright (hanya kalau file belum ada) ─────────────────────
async function downloadFromOnedrive() {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page    = await context.newPage();

  console.log("🌐 Membuka link sharing OneDrive...");
  try {
    await page.goto(getShareUrl(), { waitUntil: "networkidle", timeout: 40000 });
  } catch {
    console.log("⚠️ Navigasi awal melewati batas waktu, menganalisis URL saat ini...");
  }

  let buffer = null;
  try {
    console.log("⏳ Menunggu stabilitas URL OneDrive...");
    await page.waitForURL(/onedrive\.live\.com/, { timeout: 10000 });

    const currentUrl = page.url();
    console.log("📍 URL Terdeteksi:", currentUrl.substring(0, 80) + "...");

    let downloadUrl = currentUrl
      .replace("Doc.aspx", "download.aspx")
      .replace("action=default", "action=download");

    if (downloadUrl === currentUrl) {
      downloadUrl += (downloadUrl.includes("?") ? "&" : "?") + "download=1";
    }

    console.log("📥 Memicu unduhan via internal stream...");
    const downloadPromise = page.waitForEvent("download", { timeout: 25000 });
    await page.goto(downloadUrl).catch(() => {});

    const download = await downloadPromise;
    const tempPath = await download.path();
    buffer = fs.readFileSync(tempPath);

    fs.mkdirSync(path.dirname(SAVE_PATH), { recursive: true });
    fs.writeFileSync(SAVE_PATH, buffer);
    console.log("💾 File disimpan ke disk:", SAVE_PATH);

  } catch (err) {
    console.error("❌ Gagal mendownload file:", err.message);
  } finally {
    await browser.close();
  }

  return buffer;
}

// ── Parse buffer → array of KS objects ───────────────────────────────────────
function parseBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

  if (!rows || rows.length <= 1) return [];

  return rows
    .slice(1)
    .map((row) => {
      const s = (v) => (v != null ? String(v).trim() : "");
      return {
        id:     s(row[0]),
        vendor: s(row[1]),
        jenis:  s(row[2]),
        nilai:  parseFloat(String(row[3]).replace(/[^0-9.]/g, "")) || 0,
        tanggal: s(row[6]),
        exp:    s(row[4]),
        status: s(row[5]),
      };
    })
    .filter((log) => log.id !== "");
}

// ── Public: fetch dengan cache + fallback ke file lokal ──────────────────────
async function fetchOnedriveLogs() {
  if (cleanupIfNoUrl()) {
    throw new Error("OneDrive URL kosong di konfigurasi.");
  }
  // 1. Sudah ada di memory? Langsung return
  if (_cache !== null) {
    console.log("📦 Data dari cache memory, skip semua.");
    return _cache;
  }

  // 2. Sedang proses? Tunggu
  if (_fetchPromise) {
    console.log("⏳ Proses sedang berjalan, menunggu hasil...");
    return _fetchPromise;
  }

  _fetchPromise = (async () => {
    try {
      // 3. File lokal sudah ada? Baca dari disk, skip Playwright
      let buffer = readLocalFile();

      // 4. Belum ada? Baru download via Playwright
      if (!buffer) {
        console.log("📡 File belum ada, memulai download via Playwright...");
        buffer = await downloadFromOnedrive();
      }

      if (!buffer) {
        console.error("⚠️ Buffer kosong, parsing dibatalkan.");
        _cache = null;
        throw new Error("Gagal mengunduh file OneDrive (Buffer kosong).");
      }

      _cache = parseBuffer(buffer);
      console.log(`✅ Cache terisi: ${_cache.length} baris.`);
      return _cache;

    } catch (error) {
      console.error("❌ Error:", error.message);
      _cache = null;
      throw _cache;
    } finally {
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
}

// ── Force refresh: hapus file lokal + clear cache → download ulang ────────────
function invalidateCache() {
  _cache = null;
  if (fs.existsSync(SAVE_PATH)) {
    fs.unlinkSync(SAVE_PATH);
    console.log("🗑️ File lokal dihapus.");
  }
  console.log("🗑️ Cache dibersihkan. Download ulang saat request berikutnya.");
}



// ── Hapus file lokal kalau URL dikosongkan ────────────────────────────────
function cleanupIfNoUrl() {
  const url = getShareUrl();
  if (!url) {
    if (fs.existsSync(SAVE_PATH)) {
      fs.unlinkSync(SAVE_PATH);
      console.log("🗑️ URL kosong → file lokal dihapus.");
    }
    _cache = null;
    return true; // sinyal "tidak ada URL"
  }
  return false;
}

module.exports = { fetchOnedriveLogs, invalidateCache, cleanupIfNoUrl };