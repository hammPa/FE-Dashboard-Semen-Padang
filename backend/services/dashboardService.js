const { fetchSheetLogs }    = require("./sheetsService");
const { fetchPlannerLogs }  = require("./firestoreService");
const { fetchOnedriveLogs } = require("./onedriveService");

const SOURCES = [
  { key: "ip", divisi: "IP", label: "Google Sheets", color: "#10B981", fetch: fetchSheetLogs,    dateField: "tanggal" },
  { key: "p",  divisi: "P",  label: "Firebase",      color: "#F59E0B", fetch: fetchPlannerLogs,  dateField: "tanggal" },
  { key: "ks", divisi: "KS", label: "OneDrive",      color: "#3B82F6", fetch: fetchOnedriveLogs, dateField: "exp" },
];

function buildTrendData(allResults) {
  // 1. Helper untuk mendapatkan tanggal awal minggu (Senin)
  const getWeekStart = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0]; // Format YYYY-MM-DD
  };

  let minDate = new Date();
  let maxDate = new Date("2000-01-01");

  const dateMap = {};

  // 2. Kumpulkan data
  allResults.forEach(({ source, logs }) => {
    logs.forEach((log) => {
      const weekKey = getWeekStart(log[source.dateField]);
      if (!weekKey) return;

      const d = new Date(weekKey);
      if (d < minDate) minDate = d;
      if (d > maxDate) maxDate = d;

      if (!dateMap[weekKey]) {
        dateMap[weekKey] = { date: weekKey, IP: 0, P: 0, KS: 0 };
      }
      dateMap[weekKey][source.divisi] = (dateMap[weekKey][source.divisi] || 0) + 1;
    });
  });

  // 3. Zero-filling: isi minggu yang kosong dengan 0
  const trendData = [];
  let current = new Date(minDate);
  while (current <= maxDate) {
    const key = current.toISOString().split("T")[0];
    trendData.push(dateMap[key] || { date: key, IP: 0, P: 0, KS: 0 });
    current.setDate(current.getDate() + 7);
  }

  return trendData;
}

async function buildDashboardData() {
  const allResults = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const logs = await source.fetch();

        // ── DEBUG ──────────────────────────────────────────────
        console.log(`✅ [${source.key}] ${logs.length} logs`);
        if (logs.length > 0) {
          console.log(`   field tanggal ("${source.dateField}"):`, logs[0][source.dateField]);
          console.log(`   sample log:`, JSON.stringify(logs[0]));
        } else {
          console.warn(`⚠️  [${source.key}] array kosong!`);
        }
        // ───────────────────────────────────────────────────────

        return { source, logs, error: false };
      } catch (err) {
        console.error(`❌ [${source.key}] GAGAL:`, err.message);
        return { source, logs: [], error: true };
      }
    })
  );

  const summary = { lastUpdate: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB" };
  allResults.forEach(({ source, logs }) => { summary[source.key] = logs.length; });

  const sourceData = allResults.map(({ source, logs }) => ({ name: source.label, value: logs.length, color: source.color }));
  const trendData  = buildTrendData(allResults);

  // ── DEBUG trendData ────────────────────────────────────────
  console.log("\n📊 trendData result:");
  console.log(JSON.stringify(trendData, null, 2));
  // ──────────────────────────────────────────────────────────

  const recentLogs = allResults
    .flatMap(({ source, logs }) =>
      logs.map((log) => ({ id: log.id || "-", divisi: source.divisi, sumber: source.label, tanggal: log[source.dateField] || "-", status: log.status || "Sukses" }))
    )
    .slice(0, 12);

  return { summary, trendData, sourceData, recentLogs };
}

module.exports = { buildDashboardData };