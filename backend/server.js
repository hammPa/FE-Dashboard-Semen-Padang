const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const divisiIpRouter = require("./routes/divisiIp");
const divisiPRouter = require("./routes/divisiP");
const divisiKSRouter = require("./routes/divisiKs");
const dashboardRouter = require("./routes/dashboard");
const geminiRouter = require("./routes/gemini");
const configRouter = require("./routes/link");
// const { watchFirebaseChanges } = require("./realtime/firebaseWatcher");
// const { startSheetsPolling } = require("./realtime/sheetsPoller");
// const { startOnedrivePolling } = require("./realtime/onedrivePoller");

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

app.use("/api/config", configRouter);
app.use("/api/divisi-ip", divisiIpRouter);
app.use("/api/divisi-p", divisiPRouter);
app.use("/api/divisi-ks", divisiKSRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", geminiRouter);


// --- RADAR REAL-TIME ---
// watchFirebaseChanges(io); // Firestore: Divisi P
// startSheetsPolling(io); // Google Sheets (polling): Divisi IP
// startOnedrivePolling(io); // OneDrive (polling): Divisi Ks

server.listen(PORT, () => {
  console.log(
    `Server Backend & Mesin Socket.io menyala di http://localhost:${PORT}`,
  );
});