// backend/config/sheets.js
const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: "./firebase-key.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

module.exports = { sheets, SPREADSHEET_ID };