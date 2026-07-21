import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config({ path: ".env.local" });

const targetSpreadsheetId = process.env.TARGET_SPREADSHEET_ID;
const sourceSpreadsheetId = process.env.SOURCE_SPREADSHEET_ID;
const coupleNamesSr = process.env.WEDDING_COUPLE_NAMES_SR;
const coupleNamesEn = process.env.WEDDING_COUPLE_NAMES_EN;
const eventDate = process.env.WEDDING_EVENT_DATE;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!targetSpreadsheetId || !sourceSpreadsheetId || !coupleNamesSr || !coupleNamesEn || !eventDate) {
  throw new Error("Missing target, source, couple names or event date configuration.");
}
if (!clientEmail || !privateKey) throw new Error("Missing Google credentials.");

const config = {
  targetSpreadsheetId,
  sourceSpreadsheetId,
  coupleNamesSr,
  coupleNamesEn,
  eventDate,
};

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: clientEmail, private_key: privateKey },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

async function readSettings(spreadsheetId: string) {
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Settings!A1:B200" });
  return new Map<string, string>(
    (response.data.values ?? []).slice(1).map((row) => [String(row[0] ?? "").trim(), String(row[1] ?? "").trim()]),
  );
}

async function main() {
  const [source, target] = await Promise.all([readSettings(config.sourceSpreadsheetId), readSettings(config.targetSpreadsheetId)]);
  const values = new Map(target);

  values.set("couple_names_sr", config.coupleNamesSr);
  values.set("couple_names_en", config.coupleNamesEn);
  values.set("event_date", config.eventDate);
  for (const key of ["venue_name", "venue_address", "map_url"]) {
    values.set(key, source.get(key) ?? "");
  }
  const overrides: Record<string, string | undefined> = {
    design_template: process.env.WEDDING_DESIGN_TEMPLATE,
    show_event_details: process.env.WEDDING_SHOW_EVENT_DETAILS,
    show_countdown: process.env.WEDDING_SHOW_COUNTDOWN,
    show_agenda: process.env.WEDDING_SHOW_AGENDA,
    show_rsvp: process.env.WEDDING_SHOW_RSVP,
    show_table: process.env.WEDDING_SHOW_TABLE,
    show_location: process.env.WEDDING_SHOW_LOCATION,
    show_photos: process.env.WEDDING_SHOW_PHOTOS,
    venue_name: process.env.WEDDING_VENUE_NAME,
    venue_address: process.env.WEDDING_VENUE_ADDRESS,
    guest_arrival_time: process.env.WEDDING_GUEST_ARRIVAL_TIME,
    ceremony_time: process.env.WEDDING_CEREMONY_TIME,
    rsvp_deadline: process.env.WEDDING_RSVP_DEADLINE,
    intro_text_sr: process.env.WEDDING_INTRO_TEXT_SR,
    intro_text_en: process.env.WEDDING_INTRO_TEXT_EN,
    agenda_sr: process.env.WEDDING_AGENDA_SR,
    agenda_en: process.env.WEDDING_AGENDA_EN,
  };
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) values.set(key, value);
  }

  const rows = [["key", "value"], ...values.entries()];
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.targetSpreadsheetId,
    range: `Settings!A1:B${rows.length}`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
  console.log("Wedding names, date and venue updated.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
