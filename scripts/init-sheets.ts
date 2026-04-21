import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { google } from "googleapis";
import { DEFAULT_SETTINGS, SETTINGS_KEYS } from "../lib/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(root, ".env.local") });

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!spreadsheetId) {
  throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID in .env.local");
}

if (!clientEmail || !clientEmail.includes("iam.gserviceaccount.com")) {
  throw new Error("GOOGLE_CLIENT_EMAIL must be a Service Account email (ends with iam.gserviceaccount.com)");
}

if (!privateKey || !privateKey.includes("BEGIN PRIVATE KEY")) {
  throw new Error("GOOGLE_PRIVATE_KEY is invalid. Use private_key from Service Account JSON.");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const GUEST_HEADERS = [
  "guest_id",
  "token",
  "display_name",
  "custom_greeting",
  "side",
  "group",
  "phone",
  "invite_status",
  "invite_sent_at",
  "invite_channel",
  "default_language",
  "max_guests",
  "rsvp_status",
  "attending_count",
  "additional_guest_names",
  "note",
  "decline_reason",
  "response_updated_at",
  "first_opened_at",
  "last_opened_at",
  "is_locked_manual",
];

async function ensureSheetsExist() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set((meta.data.sheets ?? []).map((s) => s.properties?.title).filter(Boolean));

  const toCreate = ["Guests", "Settings"].filter((name) => !existing.has(name));
  if (toCreate.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: toCreate.map((title) => ({ addSheet: { properties: { title } } })),
    },
  });
}

async function writeGuestsHeader() {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Guests!A1:U1",
    valueInputOption: "RAW",
    requestBody: { values: [GUEST_HEADERS] },
  });
}

async function writeSettingsDefaults() {
  const values = [["key", "value"], ...SETTINGS_KEYS.map((key) => [key, DEFAULT_SETTINGS[key]])];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Settings!A1:B${values.length}`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

async function main() {
  await ensureSheetsExist();
  await writeGuestsHeader();
  await writeSettingsDefaults();
  console.log("Google Sheet initialized: Guests and Settings are ready.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
