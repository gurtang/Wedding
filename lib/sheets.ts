import crypto from "node:crypto";
import { google } from "googleapis";
import { adminGuestUpdateSchema, responsePayloadSchema, seatingSaveSchema, settingsUpdateSchema } from "./validation";
import { computeAttendingCount, isDeadlinePassed, normalizeSettings } from "./date";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  type Guest,
  type HallColumn,
  type HallTable,
  type Language,
  type RSVPStatus,
  type SeatingPerson,
  type Side,
  type Settings,
} from "./types";
import { safeJsonParse } from "./utils";
import { getWeddingSpreadsheetIds } from "./weddings";

type GuestListParams = {
  filter?: string;
  side?: Guest["side"] | "";
  group?: string;
  search?: string;
};

type SheetGuestRow = { guest: Guest; rowNumber: number };

const GUEST_SHEET = "Guests";
const SETTINGS_SHEET = "Settings";
const SEATING_SHEET = "Seating";

const GUEST_COLUMNS = [
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
] as const;

const SEATING_COLUMNS = [
  "person_id",
  "guest_id",
  "party_id",
  "person_name",
  "group",
  "side",
  "is_primary",
  "is_detached",
  "table_id",
  "seat_order",
  "updated_at",
] as const;

const TABLE_NAME_ROW_MARKER = "__table_name__";
const TABLE_NAME_PERSON_PREFIX = "__table_name::";

const HALL_TABLES: HallTable[] = [
  { id: "1", label: "3", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 8 },
  { id: "2", label: "1", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 24, y: 8 },
  { id: "3", label: "2A", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 54, y: 8 },
  { id: "4", label: "2", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 66, y: 8 },
  { id: "5", label: "4", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 78, y: 8 },
  { id: "6", label: "6", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 8 },
  { id: "7", label: "25", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 86 },
  { id: "8", label: "8", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 21 },
  { id: "9", label: "10", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 34 },
  { id: "10", label: "12", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 47 },
  { id: "11", label: "14", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 60 },
  { id: "12", label: "16", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 73 },
  { id: "13", label: "18", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 90, y: 86 },
  { id: "14", label: "5", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 21 },
  { id: "15", label: "15", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 24, y: 27 },
  { id: "16", label: "15A", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 24, y: 39 },
  { id: "17", label: "17", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 24, y: 59 },
  { id: "18", label: "17A", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 24, y: 71 },
  { id: "19", label: "19", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 56, y: 27 },
  { id: "20", label: "19A", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 56, y: 39 },
  { id: "21", label: "21", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 56, y: 59 },
  { id: "22", label: "21A", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 56, y: 71 },
  { id: "23", label: "26", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 68, y: 24 },
  { id: "24", label: "27", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 68, y: 40 },
  { id: "25", label: "28", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 68, y: 56 },
  { id: "26", label: "29", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 68, y: 72 },
  { id: "27", label: "20", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 80, y: 27 },
  { id: "28", label: "20A", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 80, y: 39 },
  { id: "29", label: "22", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 80, y: 59 },
  { id: "30", label: "22A", kind: "inner", maxCapacity: 10, optimalCapacity: 8, x: 80, y: 71 },
  { id: "31", label: "7", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 34 },
  { id: "32", label: "9", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 47 },
  { id: "33", label: "11", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 60 },
  { id: "34", label: "13", kind: "outer", maxCapacity: 12, optimalCapacity: 11, x: 10, y: 73 },
  { id: "12A", label: "A", kind: "head", maxCapacity: 4, optimalCapacity: 4, x: 32, y: 8 },
  { id: "12B", label: "B", kind: "head", maxCapacity: 4, optimalCapacity: 4, x: 40, y: 8 },
  { id: "M", label: "M", kind: "music", maxCapacity: 12, optimalCapacity: 11, x: 48, y: 94, hiddenUntilRegularTablesFull: true },
  { id: "M1", label: "23", kind: "music", maxCapacity: 12, optimalCapacity: 11, x: 58, y: 94, hiddenUntilRegularTablesFull: true },
  { id: "M2", label: "24", kind: "music", maxCapacity: 12, optimalCapacity: 11, x: 68, y: 94, hiddenUntilRegularTablesFull: true },
  { id: "M3", label: "30", kind: "music", maxCapacity: 12, optimalCapacity: 11, x: 78, y: 94, hiddenUntilRegularTablesFull: true },
];

const HALL_COLUMNS: HallColumn[] = [
  { id: "C15-top", x: 24, y: 18 },
  { id: "C16-bottom", x: 24, y: 49 },
  { id: "C18-bottom", x: 24, y: 80 },
  { id: "C19-top", x: 56, y: 18 },
  { id: "C20-21", x: 56, y: 49 },
  { id: "C22-bottom", x: 56, y: 80 },
  { id: "C27-top", x: 80, y: 18 },
  { id: "C28-29", x: 80, y: 49 },
  { id: "C30-bottom", x: 80, y: 80 },
];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getSheetsClient() {
  const email = requiredEnv("GOOGLE_CLIENT_EMAIL");
  const privateKey = requiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

function toIsoNow(): string {
  return new Date().toISOString();
}

function parseGuestValue(key: (typeof GUEST_COLUMNS)[number], raw: string | undefined): Guest[keyof Guest] {
  const value = (raw ?? "").trim();

  switch (key) {
    case "max_guests": {
      const parsed = Number.parseInt(value || "1", 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    }
    case "attending_count": {
      const parsed = Number.parseInt(value || "0", 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }
    case "additional_guest_names":
      if (!value) return [];
      return safeJsonParse<string[]>(value, value.split("|").map((v) => v.trim()).filter(Boolean));
    case "is_locked_manual":
      return value.toLowerCase() === "true";
    case "default_language":
      return value === "en" ? "en" : "sr";
    case "side":
      if (value === "mlada" || value === "mladozenja" || value === "zajednicki") return value;
      return "zajednicki";
    case "invite_status":
      if (value === "nije_poslata" || value === "poslata" || value === "otvorena") return value;
      return "nije_poslata";
    case "rsvp_status":
      if (value === "dolazi" || value === "ne_dolazi" || value === "nije_odgovorio") return value;
      return "nije_odgovorio";
    default:
      return value;
  }
}

function serializeGuestField(key: keyof Guest, value: Guest[keyof Guest]): string {
  if (key === "additional_guest_names") {
    return JSON.stringify(value as string[]);
  }
  if (key === "is_locked_manual") {
    return String(value);
  }
  return String(value ?? "");
}

function mapGuest(headers: string[], row: string[]): Guest {
  const result: Partial<Guest> = {};

  for (const key of GUEST_COLUMNS) {
    const idx = headers.indexOf(key);
    result[key] = parseGuestValue(key, idx >= 0 ? row[idx] : "") as never;
  }

  return result as Guest;
}

function generateGuestId(): string {
  return `guest_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function generateGuestToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

async function readGuestRows(spreadsheetId: string): Promise<SheetGuestRow[]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${GUEST_SHEET}!A1:Z`,
  });

  const values = response.data.values ?? [];
  if (values.length === 0) {
    return [];
  }

  const headers = values[0].map((h) => h.trim());
  const rows = values.slice(1);

  const mapped = rows
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row, index) => ({ guest: mapGuest(headers, row), rowNumber: index + 2 }));

  const usedIds = new Set(mapped.map((item) => item.guest.guest_id.trim()).filter(Boolean));
  const usedTokens = new Set(mapped.map((item) => item.guest.token.trim()).filter(Boolean));
  const toFix = mapped.filter((item) => !item.guest.guest_id.trim() || !item.guest.token.trim());

  if (toFix.length > 0) {
    for (const item of toFix) {
      if (!item.guest.guest_id.trim()) {
        let nextId = generateGuestId();
        while (usedIds.has(nextId)) nextId = generateGuestId();
        item.guest.guest_id = nextId;
        usedIds.add(nextId);
      }

      if (!item.guest.token.trim()) {
        let nextToken = generateGuestToken();
        while (usedTokens.has(nextToken)) nextToken = generateGuestToken();
        item.guest.token = nextToken;
        usedTokens.add(nextToken);
      }
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: toFix.map((item) => ({
          range: `${GUEST_SHEET}!A${item.rowNumber}:U${item.rowNumber}`,
          values: [GUEST_COLUMNS.map((key) => serializeGuestField(key, item.guest[key]))],
        })),
      },
    });
  }

  return mapped;
}

function matchGuestFilter(guest: Guest, params?: GuestListParams): boolean {
  if (!params) return true;

  if (params.side && guest.side !== params.side) return false;
  if (params.group && guest.group.toLowerCase() !== params.group.toLowerCase()) return false;

  if (params.search) {
    const q = params.search.toLowerCase();
    const haystack = `${guest.display_name} ${guest.phone} ${guest.group}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  switch (params.filter) {
    case "nije_poslata":
      return guest.invite_status === "nije_poslata";
    case "poslata":
      return guest.invite_status === "poslata";
    case "otvorena":
      return guest.invite_status === "otvorena";
    case "nije_odgovorio":
      return guest.rsvp_status === "nije_odgovorio";
    case "dolazi":
      return guest.rsvp_status === "dolazi";
    case "ne_dolazi":
      return guest.rsvp_status === "ne_dolazi";
    default:
      return true;
  }
}

function getGuestStats(guests: Guest[]) {
  return {
    totalGuests: guests.length,
    unsent: guests.filter((g) => g.invite_status === "nije_poslata").length,
    sentNotOpened: guests.filter((g) => g.invite_status === "poslata").length,
    openedNoResponse: guests.filter((g) => g.invite_status === "otvorena" && g.rsvp_status === "nije_odgovorio").length,
    attending: guests.filter((g) => g.rsvp_status === "dolazi").length,
    notAttending: guests.filter((g) => g.rsvp_status === "ne_dolazi").length,
    totalAttendingCount: guests.reduce((sum, g) => sum + g.attending_count, 0),
  };
}

async function updateGuestRow(spreadsheetId: string, rowNumber: number, guest: Guest): Promise<void> {
  const sheets = getSheetsClient();
  const values = GUEST_COLUMNS.map((key) => serializeGuestField(key, guest[key]));
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${GUEST_SHEET}!A${rowNumber}:U${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

export async function getGuestByToken(spreadsheetId: string, token: string): Promise<Guest | null> {
  const rows = await readGuestRows(spreadsheetId);
  const found = rows.find((item) => item.guest.token === token.trim());
  return found?.guest ?? null;
}

export async function findGuestByToken(token: string): Promise<{ spreadsheetId: string; guest: Guest } | null> {
  const results = await Promise.all(
    getWeddingSpreadsheetIds().map(async (spreadsheetId) => ({
      spreadsheetId,
      guest: await getGuestByToken(spreadsheetId, token),
    })),
  );
  return results.find((result): result is { spreadsheetId: string; guest: Guest } => Boolean(result.guest)) ?? null;
}

export async function getGuestById(spreadsheetId: string, guestId: string): Promise<Guest | null> {
  const rows = await readGuestRows(spreadsheetId);
  const found = rows.find((item) => item.guest.guest_id === guestId.trim());
  return found?.guest ?? null;
}

export async function listGuests(spreadsheetId: string, params?: GuestListParams): Promise<Guest[]> {
  const rows = await readGuestRows(spreadsheetId);
  return rows.map((r) => r.guest).filter((guest) => matchGuestFilter(guest, params));
}

export async function listGuestsWithStats(spreadsheetId: string, params?: GuestListParams): Promise<{ guests: Guest[]; stats: ReturnType<typeof getGuestStats> }> {
  const allRows = await readGuestRows(spreadsheetId);
  const allGuests = allRows.map((r) => r.guest);
  const guests = allGuests.filter((guest) => matchGuestFilter(guest, params));
  return { guests, stats: getGuestStats(allGuests) };
}

export async function trackGuestOpen(spreadsheetId: string, token: string): Promise<void> {
  const rows = await readGuestRows(spreadsheetId);
  const item = rows.find((entry) => entry.guest.token === token.trim());
  if (!item) return;

  const now = toIsoNow();
  const guest = { ...item.guest };
  if (!guest.first_opened_at) guest.first_opened_at = now;
  guest.last_opened_at = now;
  if (guest.invite_status === "nije_poslata" || guest.invite_status === "poslata") {
    guest.invite_status = "otvorena";
  }

  await updateGuestRow(spreadsheetId, item.rowNumber, guest);
}

export async function updateGuestResponse(
  spreadsheetId: string,
  token: string,
  payload: {
    rsvp_status: RSVPStatus | "dolazi" | "ne_dolazi";
    additional_guest_names?: string[];
    note?: string;
    decline_reason?: string;
    language?: Language;
  },
): Promise<Guest> {
  const parsed = responsePayloadSchema.parse(payload);
  const rows = await readGuestRows(spreadsheetId);
  const item = rows.find((entry) => entry.guest.token === token.trim());

  if (!item) {
    throw new Error("Guest token not found.");
  }

  const settings = await getSettings(spreadsheetId);
  if (isDeadlinePassed(settings) || item.guest.is_locked_manual) {
    throw new Error("RSVP is locked for this guest.");
  }

  const guest = { ...item.guest };
  const maxAdditional = Math.max(0, guest.max_guests - 1);
  if (parsed.additional_guest_names.length > maxAdditional) {
    throw new Error("Additional guests exceed allowed limit.");
  }

  guest.rsvp_status = parsed.rsvp_status;
  guest.additional_guest_names = parsed.rsvp_status === "dolazi" ? parsed.additional_guest_names : [];
  guest.note = parsed.rsvp_status === "dolazi" ? parsed.note ?? "" : "";
  guest.decline_reason = parsed.rsvp_status === "ne_dolazi" ? parsed.decline_reason ?? "" : "";
  guest.attending_count = computeAttendingCount(guest.rsvp_status, guest.additional_guest_names);
  guest.response_updated_at = toIsoNow();

  if (payload.language) {
    guest.default_language = payload.language;
  }

  await updateGuestRow(spreadsheetId, item.rowNumber, guest);
  return guest;
}

export async function updateGuestAdmin(spreadsheetId: string, guestId: string, input: unknown): Promise<Guest> {
  const parsed = adminGuestUpdateSchema.parse(input);
  const rows = await readGuestRows(spreadsheetId);
  const item = rows.find((entry) => entry.guest.guest_id === guestId.trim());

  if (!item) {
    throw new Error("Guest not found.");
  }

  const additionalGuestNames = parsed.additional_guest_names;
  const maxAdditional = Math.max(0, parsed.max_guests - 1);

  if (additionalGuestNames.length > maxAdditional) {
    throw new Error("Additional guests exceed allowed limit.");
  }

  const guest: Guest = {
    ...item.guest,
    ...parsed,
    attending_count: computeAttendingCount(parsed.rsvp_status, additionalGuestNames),
    response_updated_at: toIsoNow(),
  };

  if (guest.rsvp_status === "ne_dolazi") {
    guest.additional_guest_names = [];
  }

  await updateGuestRow(spreadsheetId, item.rowNumber, guest);
  return guest;
}

export async function markInviteSent(spreadsheetId: string, guestId: string, channel: string): Promise<void> {
  const rows = await readGuestRows(spreadsheetId);
  const item = rows.find((entry) => entry.guest.guest_id === guestId.trim());
  if (!item) throw new Error("Guest not found.");

  const guest = { ...item.guest };
  guest.invite_status = "poslata";
  guest.invite_sent_at = toIsoNow();
  guest.invite_channel = channel || guest.invite_channel || "whatsapp";

  await updateGuestRow(spreadsheetId, item.rowNumber, guest);
}

export async function getSettings(spreadsheetId: string): Promise<Settings> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SETTINGS_SHEET}!A1:B200`,
  });

  const values = response.data.values ?? [];
  const map = new Map<string, string>();

  for (const row of values.slice(1)) {
    const key = String(row[0] ?? "").trim();
    const value = String(row[1] ?? "").trim();
    if (key) map.set(key, value);
  }

  const settings = SETTINGS_KEYS.reduce((acc, key) => {
    const value = map.get(key) ?? DEFAULT_SETTINGS[key];
    if (key === "design_template") {
      acc.design_template = value === "white_gold" ? "white_gold" : "classic";
    } else if (
      key === "show_event_details" ||
      key === "show_countdown" ||
      key === "show_agenda" ||
      key === "show_rsvp" ||
      key === "show_table" ||
      key === "show_location" ||
      key === "show_photos"
    ) {
      acc[key] = (value === true || String(value).toLowerCase() === "true") as never;
    } else {
      acc[key] = value as never;
    }
    return acc;
  }, {} as Settings);

  return normalizeSettings(settings);
}

export async function updateSettings(spreadsheetId: string, input: unknown): Promise<Settings> {
  const parsed = settingsUpdateSchema.parse(input);
  const sheets = getSheetsClient();
  const values = [["key", "value"], ...SETTINGS_KEYS.map((key) => [key, parsed[key]])];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SETTINGS_SHEET}!A1:B${values.length}`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  return normalizeSettings(parsed);
}

function parseSeatingValue(key: (typeof SEATING_COLUMNS)[number], raw: string | undefined): SeatingPerson[keyof SeatingPerson] {
  const value = (raw ?? "").trim();

  switch (key) {
    case "seat_order": {
      const parsed = Number.parseInt(value || "0", 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }
    case "is_primary":
    case "is_detached":
      return value.toLowerCase() === "true";
    case "side":
      if (value === "mlada" || value === "mladozenja" || value === "zajednicki") return value;
      return "zajednicki";
    default:
      return value;
  }
}

function serializeSeatingField(key: keyof SeatingPerson, value: SeatingPerson[keyof SeatingPerson]): string {
  if (key === "is_primary" || key === "is_detached") {
    return String(Boolean(value));
  }
  return String(value ?? "");
}

function mapSeatingPerson(headers: string[], row: string[]): SeatingPerson {
  const result: Partial<SeatingPerson> = {};

  for (const key of SEATING_COLUMNS) {
    const idx = headers.indexOf(key);
    result[key] = parseSeatingValue(key, idx >= 0 ? row[idx] : "") as never;
  }

  return result as SeatingPerson;
}

type SheetSeatingRow = { person: SeatingPerson; rowNumber: number };

function readTableNamesFromSeatingRows(rows: SheetSeatingRow[]): Record<string, string> {
  const tableNames: Record<string, string> = {};

  for (const row of rows) {
    if (row.person.guest_id !== TABLE_NAME_ROW_MARKER) continue;

    const tableId = normalizeTableId(row.person.table_id || row.person.party_id);
    const name = row.person.person_name.trim();
    if (tableId && name) {
      tableNames[tableId] = name;
    }
  }

  return tableNames;
}

function tableLabelById(tableId: string): string {
  return HALL_TABLES.find((table) => table.id === tableId)?.label ?? tableId;
}

async function readSeatingRows(spreadsheetId: string): Promise<SheetSeatingRow[]> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SEATING_SHEET}!A1:K5000`,
    });

    const values = response.data.values ?? [];
    if (values.length === 0) {
      return [];
    }

    const headers = values[0].map((h) => h.trim());
    const rows = values.slice(1);

    return rows
      .filter((row) => row.some((cell) => String(cell).trim() !== ""))
      .map((row, index) => ({
        person: mapSeatingPerson(headers, row),
        rowNumber: index + 2,
      }));
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unable to parse range")) {
      return [];
    }
    throw error;
  }
}

function normalizePersonName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildPeopleFromGuests(guests: Guest[], savedRows: SheetSeatingRow[]): SeatingPerson[] {
  const now = toIsoNow();
  const savedByPersonId = new Map(savedRows.map((row) => [row.person.person_id, row.person] as const));

  const people: SeatingPerson[] = [];
  for (const guest of guests) {
    const partyId = guest.guest_id;
    const primaryPersonId = `${guest.guest_id}::p`;
    const savedPrimary = savedByPersonId.get(primaryPersonId);

    people.push({
      person_id: primaryPersonId,
      guest_id: guest.guest_id,
      party_id: partyId,
      person_name: normalizePersonName(guest.display_name),
      group: guest.group,
      side: guest.side,
      is_primary: true,
      is_detached: false,
      table_id: savedPrimary?.table_id ?? "",
      seat_order: savedPrimary?.seat_order ?? 0,
      updated_at: savedPrimary?.updated_at ?? now,
    });

    const additionalNames = guest.additional_guest_names.map(normalizePersonName).filter(Boolean);
    additionalNames.forEach((name, index) => {
      const personId = `${guest.guest_id}::a${index + 1}`;
      const saved = savedByPersonId.get(personId);

      people.push({
        person_id: personId,
        guest_id: guest.guest_id,
        party_id: partyId,
        person_name: name,
        group: guest.group,
        side: guest.side,
        is_primary: false,
        is_detached: saved?.is_detached ?? false,
        table_id: saved?.table_id ?? savedPrimary?.table_id ?? "",
        seat_order: saved?.seat_order ?? index + 1,
        updated_at: saved?.updated_at ?? now,
      });
    });
  }

  return people;
}

function enforceLinkedParties(people: SeatingPerson[]): SeatingPerson[] {
  const byParty = new Map<string, SeatingPerson[]>();
  for (const person of people) {
    const list = byParty.get(person.party_id) ?? [];
    list.push(person);
    byParty.set(person.party_id, list);
  }

  const result: SeatingPerson[] = [];
  for (const partyPeople of byParty.values()) {
    const linked = partyPeople.filter((p) => !p.is_detached);
    const linkedTableId =
      linked.find((p) => p.is_primary && p.table_id)?.table_id ||
      linked.find((p) => p.table_id)?.table_id ||
      "";

    for (const person of partyPeople) {
      if (!person.is_detached) {
        result.push({ ...person, table_id: linkedTableId });
      } else {
        result.push({ ...person });
      }
    }
  }

  return result;
}

function normalizeTableId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return HALL_TABLES.some((table) => table.id === trimmed) ? trimmed : "";
}

function normalizeTableNames(input: Record<string, string>): Record<string, string> {
  const tableNames: Record<string, string> = {};

  for (const [rawTableId, rawName] of Object.entries(input)) {
    const tableId = normalizeTableId(rawTableId);
    const name = rawName.trim().replace(/\s+/g, " ");
    if (tableId && name) {
      tableNames[tableId] = name;
    }
  }

  return tableNames;
}

function normalizeSeatingPeople(
  inputPeople: Array<Omit<SeatingPerson, "updated_at"> & { updated_at?: string }>,
): SeatingPerson[] {
  const now = toIsoNow();
  const normalized = inputPeople.map((person, index) => ({
    ...person,
    person_name: normalizePersonName(person.person_name),
    group: person.group.trim(),
    side: (person.side || "zajednicki") as Side,
    table_id: normalizeTableId(person.table_id),
    seat_order: Number.isFinite(person.seat_order) ? person.seat_order : index,
    updated_at: now,
    is_primary: Boolean(person.is_primary),
    is_detached: person.is_primary ? false : Boolean(person.is_detached),
  }));

  return enforceLinkedParties(normalized);
}

export async function getSeatingPlanData(spreadsheetId: string): Promise<{ guests: Guest[]; people: SeatingPerson[]; tables: HallTable[]; columns: HallColumn[] }> {
  const [guests, savedRows] = await Promise.all([listGuests(spreadsheetId), readSeatingRows(spreadsheetId)]);
  const attendingGuests = guests.filter((guest) => guest.rsvp_status === "dolazi");
  const people = buildPeopleFromGuests(attendingGuests, savedRows);
  const tableNames = readTableNamesFromSeatingRows(savedRows);
  const tables = HALL_TABLES.map((table) => ({ ...table, name: tableNames[table.id] ?? "" }));

  return { guests: attendingGuests, people: enforceLinkedParties(people), tables, columns: HALL_COLUMNS };
}

export async function getGuestTableLabels(spreadsheetId: string, guestId: string): Promise<string[]> {
  const normalizedGuestId = guestId.trim();
  if (!normalizedGuestId) return [];

  const rows = await readSeatingRows(spreadsheetId);
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    if (row.person.guest_id !== normalizedGuestId) continue;

    const tableId = normalizeTableId(row.person.table_id);
    if (!tableId || seen.has(tableId)) continue;

    labels.push(tableLabelById(tableId));
    seen.add(tableId);
  }

  return labels;
}

export async function saveSeatingPlan(spreadsheetId: string, input: unknown): Promise<SeatingPerson[]> {
  const parsed = seatingSaveSchema.parse(input);
  const people = normalizeSeatingPeople(parsed.people);
  const tableNames = normalizeTableNames(parsed.tableNames);
  const now = toIsoNow();
  const tableNameRows: SeatingPerson[] = Object.entries(tableNames).map(([tableId, name]) => ({
    person_id: `${TABLE_NAME_PERSON_PREFIX}${tableId}`,
    guest_id: TABLE_NAME_ROW_MARKER,
    party_id: tableId,
    person_name: name,
    group: "",
    side: "zajednicki",
    is_primary: false,
    is_detached: false,
    table_id: tableId,
    seat_order: 0,
    updated_at: now,
  }));

  const sheets = getSheetsClient();
  const rows = [...people, ...tableNameRows];
  const values = [SEATING_COLUMNS as unknown as string[], ...rows.map((person) => SEATING_COLUMNS.map((key) => serializeSeatingField(key, person[key])))];

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${SEATING_SHEET}!A2:K5000`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SEATING_SHEET}!A1:K${values.length}`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  return people;
}


