const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const divisiIpRouter = require("./routes/divisiIp");
const divisiPRouter = require("./routes/divisiP");
const divisiOnedriveRouter = require("./routes/divisiKs");
const { watchFirebaseChanges } = require("./realtime/firebaseWatcher");
const { startSheetsPolling } = require("./realtime/sheetsPoller");
const { startOnedrivePolling } = require("./realtime/onedrivePoller");

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Server API Dashboard Industri Berjalan Normal!");
});

app.use("/api/divisi-ip", divisiIpRouter);
app.use("/api/divisi-p", divisiPRouter);
app.use("/api/divisi-onedrive", divisiOnedriveRouter);

app.get("/api/dashboard", async (requestAnimationFrame, res) => {
  try {
    const { fetchSheetLogs, hitungAnalitikIP } = require("./services/sheetsService");
    const { fetchPlannerLogs, hitungAnalitikPlanner } = require("./services/firestoreService");
    const { fetchOnedriveLogs, hitungAnalitikOnedrive } = require("./services/onedriveService");

    const [ipLogs, pLogs, ksLogs] = await Promise.all([
      fetchSheetLogs().catch(() => []),
      fetchPlannerLogs().catch(() => []),
      fetchOnedriveLogs().catch(() => [])
    ]);

    const { summaryData, trendData, sourceData, recentLogs } = require("../frontend/src/data/mockdata");

    res.json({
      summary: {
        ip: hitungAnalitikIP(ipLogs).totalInspeksi || summaryData.ip,
        ks: hitungAnalitikOnedrive(ksLogs).totalData || summaryData.ks,
        p: hitungAnalitikPlanner(pLogs).totalWorkOrder || summaryData.p,
        lastUpdate: summaryData.lastUpdate
      },
      trendData,
      sourceData,
      recentLogs
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    const { summaryData, trendData, sourceData, recentLogs } = require("../frontend/src/data/mockdata");
    res.json({
      summary: summaryData,
      trendData,
      sourceData,
      recentLogs
    });
  }
})

// --- RADAR REAL-TIME ---
watchFirebaseChanges(io); // Firestore: Divisi P
startSheetsPolling(io); // Google Sheets (polling): Divisi IP
startOnedrivePolling(io); // OneDrive (polling): Divisi Ks

server.listen(PORT, () => {
  console.log(
    `Server Backend & Mesin Socket.io menyala di http://localhost:${PORT}`,
  );
});