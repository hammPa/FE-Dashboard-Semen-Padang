// backend/config/sheets.js
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "./sources.json");

function getSpreadsheetId() {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw).spreadsheet_id || "";
}

const auth = new google.auth.GoogleAuth({
  keyFile: "./firebase-key.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

module.exports = { sheets, getSpreadsheetId };