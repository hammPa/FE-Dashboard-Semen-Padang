const { fetchSheetLogs }    = require("./sheetsService");
const { fetchPlannerLogs }  = require("./firestoreService");
const { fetchOnedriveLogs } = require("./onedriveService");

const SOURCES = [
  { key: "ip", divisi: "IP", label: "Google Sheets", color: "#10B981", fetch: fetchSheetLogs,    dateField: "tanggal" },
  { key: "p",  divisi: "P",  label: "Firebase",      color: "#F59E0B", fetch: fetchPlannerLogs,  dateField: "tanggal" },
  { key: "ks", divisi: "KS", label: "OneDrive",      color: "#3B82F6", fetch: fetchOnedriveLogs, dateField: "tanggal" },
];

function buildTrendData(allResults) {
  const getWeekStart = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const day  = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  };

  let minDate = new Date();
  let maxDate = new Date("2000-01-01");
  const dateMap = {};

  allResults.forEach(({ source, logs }) => {
    logs.forEach((log) => {
      const weekKey = getWeekStart(log[source.dateField]);
      if (!weekKey) return;
      const d = new Date(weekKey);
      if (d < minDate) minDate = d;
      if (d > maxDate) maxDate = d;
      if (!dateMap[weekKey]) dateMap[weekKey] = { date: weekKey, IP: 0, P: 0, KS: 0 };
      dateMap[weekKey][source.divisi] = (dateMap[weekKey][source.divisi] || 0) + 1;
    });
  });

  const trendData = [];
  let current = new Date(minDate);
  while (current <= maxDate) {
    const key = current.toISOString().split("T")[0];
    trendData.push(dateMap[key] || { date: key, IP: 0, P: 0, KS: 0 });
    current.setDate(current.getDate() + 7);
  }
  return trendData;
}

function buildAlerts(allResults) {
  const alerts = [];
  let idCounter = 1;

  allResults.forEach(({ source, logs, error }) => {
    if (error) {
      alerts.push({
        id:     `A-${String(idCounter++).padStart(3, "0")}`,
        title:  `Gagal Sinkronisasi ${source.label}`,
        level:  "error",
        time:   new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        divisi: source.divisi,
      });
    }

    if (!error && logs.length === 0) {
      alerts.push({
        id:     `A-${String(idCounter++).padStart(3, "0")}`,
        title:  `Tidak Ada Data Baru dari ${source.label}`,
        level:  "warning",
        time:   new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        divisi: source.divisi,
      });
    }

    const failedLogs = logs.filter((l) => l.status === "Gagal");
    if (failedLogs.length > 0) {
      alerts.push({
        id:     `A-${String(idCounter++).padStart(3, "0")}`,
        title:  `${failedLogs.length} Log Gagal di ${source.label}`,
        level:  "warning",
        time:   new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        divisi: source.divisi,
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      id:     "A-001",
      title:  "Semua Sumber Data Berhasil Disinkronisasi",
      level:  "success",
      time:   new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      divisi: "Semua",
    });
  }

  return alerts;
}

async function buildDashboardData() {
  const allResults = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const logs = await source.fetch();
        console.log(`✅ [${source.key}] ${logs.length} logs`);
        if (logs.length > 0) {
          console.log(`   tanggal sample:`, logs[0][source.dateField]);
        } else {
          console.warn(`⚠️  [${source.key}] kosong`);
        }
        return { source, logs, error: false };
      } catch (err) {
        console.error(`❌ [${source.key}] GAGAL:`, err.message);
        return { source, logs: [], error: true };
      }
    })
  );

  // syncSuccess
  // 1. Hitung total log dan log yang berstatus "Gagal"
  const totalLogs   = allResults.reduce((acc, { logs }) => acc + logs.length, 0);
  const totalGagal  = allResults.reduce((acc, { logs }) => 
    acc + logs.filter((l) => l.status === "Gagal").length, 0);

  // 2. Hitung jumlah sumber data yang gagal di-fetch (error koneksi/API)
  const totalSources  = allResults.length;
  const failedSources = allResults.filter(r => r.error).length;

  // 3. Kalkulasi syncSuccess yang lebih akurat
  let syncSuccess = 100;

  if (totalSources > 0) {
    // Penalti jika ada koneksi sumber yang gagal (Misal: 1 dari 3 gagal = maks success 66%)
    const sourceSuccessRate = (totalSources - failedSources) / totalSources;

    // Rasio sukses dari data yang berhasil masuk
    let logSuccessRate = 1;
    if (totalLogs > 0) {
      logSuccessRate = (totalLogs - totalGagal) / totalLogs;
    } else if (failedSources > 0) {
      // Jika tidak ada data sama sekali DAN ada error fetch, artinya murni gagal total
      logSuccessRate = 0; 
    }

    // Kalikan rasio koneksi sumber dengan rasio kelayakan data
    syncSuccess = Math.round(sourceSuccessRate * logSuccessRate * 100);
  }

  // ✅ Tidak ada baris redundant forEach di sini
  const summary = {
    lastUpdate:  new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB",
    ip:          allResults.find((r) => r.source.key === "ip")?.logs.length ?? 0,
    p:           allResults.find((r) => r.source.key === "p")?.logs.length  ?? 0,
    ks:          allResults.find((r) => r.source.key === "ks")?.logs.length ?? 0,
    syncSuccess
  };

  const sourceData = allResults.map(({ source, logs }) => ({
    name:  source.label,
    value: logs.length,
    color: source.color,
  }));

  const trendData = buildTrendData(allResults);

  const recentLogs = allResults
    .flatMap(({ source, logs }) =>
      logs.map((log) => ({
        id:      log.id               || "-",
        divisi:  source.divisi,
        sumber:  source.label,
        tanggal: log[source.dateField] || "-",
        status:  log.status           || "Sukses",
      }))
    )
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const alerts = buildAlerts(allResults);

  // ✅ Return bersih — tanpa uptimeBySource, tanpa avgLatency
  return { summary, trendData, sourceData, recentLogs, alerts };
}

module.exports = { buildDashboardData };