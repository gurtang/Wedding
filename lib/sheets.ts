import crypto from "node:crypto";
import { google } from "googleapis";
import { adminGuestUpdateSchema, responsePayloadSchema, settingsUpdateSchema } from "./validation";
import { computeAttendingCount, isDeadlinePassed, normalizeSettings } from "./date";
import { DEFAULT_SETTINGS, SETTINGS_KEYS, type Guest, type Language, type RSVPStatus, type Settings } from "./types";
import { safeJsonParse } from "./utils";

type GuestListParams = {
  filter?: string;
  side?: Guest["side"] | "";
  group?: string;
  search?: string;
};

type SheetGuestRow = { guest: Guest; rowNumber: number };

const GUEST_SHEET = "Guests";
const SETTINGS_SHEET = "Settings";

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

function spreadsheetId(): string {
  return requiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
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

async function readGuestRows(): Promise<SheetGuestRow[]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
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
      spreadsheetId: spreadsheetId(),
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

async function updateGuestRow(rowNumber: number, guest: Guest): Promise<void> {
  const sheets = getSheetsClient();
  const values = GUEST_COLUMNS.map((key) => serializeGuestField(key, guest[key]));
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${GUEST_SHEET}!A${rowNumber}:U${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

export async function getGuestByToken(token: string): Promise<Guest | null> {
  const rows = await readGuestRows();
  const found = rows.find((item) => item.guest.token === token.trim());
  return found?.guest ?? null;
}

export async function getGuestById(guestId: string): Promise<Guest | null> {
  const rows = await readGuestRows();
  const found = rows.find((item) => item.guest.guest_id === guestId.trim());
  return found?.guest ?? null;
}

export async function listGuests(params?: GuestListParams): Promise<Guest[]> {
  const rows = await readGuestRows();
  return rows.map((r) => r.guest).filter((guest) => matchGuestFilter(guest, params));
}

export async function listGuestsWithStats(params?: GuestListParams): Promise<{ guests: Guest[]; stats: ReturnType<typeof getGuestStats> }> {
  const allRows = await readGuestRows();
  const allGuests = allRows.map((r) => r.guest);
  const guests = allGuests.filter((guest) => matchGuestFilter(guest, params));
  return { guests, stats: getGuestStats(allGuests) };
}

export async function trackGuestOpen(token: string): Promise<void> {
  const rows = await readGuestRows();
  const item = rows.find((entry) => entry.guest.token === token.trim());
  if (!item) return;

  const now = toIsoNow();
  const guest = { ...item.guest };
  if (!guest.first_opened_at) guest.first_opened_at = now;
  guest.last_opened_at = now;
  if (guest.invite_status === "nije_poslata" || guest.invite_status === "poslata") {
    guest.invite_status = "otvorena";
  }

  await updateGuestRow(item.rowNumber, guest);
}

export async function updateGuestResponse(
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
  const rows = await readGuestRows();
  const item = rows.find((entry) => entry.guest.token === token.trim());

  if (!item) {
    throw new Error("Guest token not found.");
  }

  const settings = await getSettings();
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

  await updateGuestRow(item.rowNumber, guest);
  return guest;
}

export async function updateGuestAdmin(guestId: string, input: unknown): Promise<Guest> {
  const parsed = adminGuestUpdateSchema.parse(input);
  const rows = await readGuestRows();
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

  await updateGuestRow(item.rowNumber, guest);
  return guest;
}

export async function markInviteSent(guestId: string, channel: string): Promise<void> {
  const rows = await readGuestRows();
  const item = rows.find((entry) => entry.guest.guest_id === guestId.trim());
  if (!item) throw new Error("Guest not found.");

  const guest = { ...item.guest };
  guest.invite_status = "poslata";
  guest.invite_sent_at = toIsoNow();
  guest.invite_channel = channel || guest.invite_channel || "whatsapp";

  await updateGuestRow(item.rowNumber, guest);
}

export async function getSettings(): Promise<Settings> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
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
    acc[key] = map.get(key) ?? DEFAULT_SETTINGS[key];
    return acc;
  }, {} as Settings);

  return normalizeSettings(settings);
}

export async function updateSettings(input: unknown): Promise<Settings> {
  const parsed = settingsUpdateSchema.parse(input);
  const sheets = getSheetsClient();
  const values = [["key", "value"], ...SETTINGS_KEYS.map((key) => [key, parsed[key]])];

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${SETTINGS_SHEET}!A1:B${values.length}`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  return normalizeSettings(parsed);
}


