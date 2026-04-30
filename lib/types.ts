export type InviteStatus = "nije_poslata" | "poslata" | "otvorena";
export type RSVPStatus = "nije_odgovorio" | "dolazi" | "ne_dolazi";
export type Language = "sr" | "en";
export type Side = "mlada" | "mladozenja" | "zajednicki";

export interface Guest {
  guest_id: string;
  token: string;
  display_name: string;
  custom_greeting: string;
  side: Side;
  group: string;
  phone: string;
  invite_status: InviteStatus;
  invite_sent_at: string;
  invite_channel: string;
  default_language: Language;
  max_guests: number;
  rsvp_status: RSVPStatus;
  attending_count: number;
  additional_guest_names: string[];
  note: string;
  decline_reason: string;
  response_updated_at: string;
  first_opened_at: string;
  last_opened_at: string;
  is_locked_manual: boolean;
}

export interface Settings {
  couple_names_sr: string;
  couple_names_en: string;
  event_date: string;
  venue_name: string;
  venue_address: string;
  map_url: string;
  guest_arrival_time: string;
  ceremony_time: string;
  rsvp_deadline: string;
  intro_text_sr: string;
  intro_text_en: string;
  agenda_sr: string;
  agenda_en: string;
}

export interface DashboardStats {
  totalGuests: number;
  unsent: number;
  sentNotOpened: number;
  openedNoResponse: number;
  attending: number;
  notAttending: number;
  totalAttendingCount: number;
}

export const SETTINGS_KEYS: (keyof Settings)[] = [
  "couple_names_sr",
  "couple_names_en",
  "event_date",
  "venue_name",
  "venue_address",
  "map_url",
  "guest_arrival_time",
  "ceremony_time",
  "rsvp_deadline",
  "intro_text_sr",
  "intro_text_en",
  "agenda_sr",
  "agenda_en",
];

export const DEFAULT_SETTINGS: Settings = {
  couple_names_sr: "Slobodan Miloševic i Milena Ðordevic",
  couple_names_en: "Slobodan Milosevic & Milena Djordjevic",
  event_date: "2026-06-12",
  venue_name: "Bolji Život 2, Elektronska industrija Niš",
  venue_address: "Bolji Život 2, Elektronska industrija Niš",
  map_url: "https://maps.app.goo.gl/Nn5DEWVZpCoYY6Qw7",
  guest_arrival_time: "17:00",
  ceremony_time: "18:00",
  rsvp_deadline: "2026-05-29",
  intro_text_sr: "Sa velikom radošću vas pozivamo da svojim prisustvom uveličate naše venčanje.",
  intro_text_en: "With great joy, we invite you to honor our wedding with your presence.",
  agenda_sr: "Dolazak gostiju u 17:00\nVenčanje u dvorištu restorana u 18:00",
  agenda_en: "Guest arrival at 17:00\nWedding ceremony in the restaurant garden at 18:00",
};


