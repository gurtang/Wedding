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
  design_template: "classic" | "white_gold";
  show_event_details: boolean;
  show_countdown: boolean;
  show_agenda: boolean;
  show_rsvp: boolean;
  show_table: boolean;
  show_location: boolean;
  show_photos: boolean;
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
  "design_template",
  "show_event_details",
  "show_countdown",
  "show_agenda",
  "show_rsvp",
  "show_table",
  "show_location",
  "show_photos",
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
  design_template: "classic",
  show_event_details: true,
  show_countdown: true,
  show_agenda: true,
  show_rsvp: true,
  show_table: true,
  show_location: true,
  show_photos: true,
  couple_names_sr: "",
  couple_names_en: "",
  event_date: "",
  venue_name: "",
  venue_address: "",
  map_url: "",
  guest_arrival_time: "",
  ceremony_time: "",
  rsvp_deadline: "",
  intro_text_sr: "",
  intro_text_en: "",
  agenda_sr: "",
  agenda_en: "",
};

export type TableKind = "outer" | "inner" | "head" | "music";

export interface HallTable {
  id: string;
  label: string;
  name?: string;
  kind: TableKind;
  maxCapacity: number;
  optimalCapacity: number;
  x: number;
  y: number;
  hiddenUntilRegularTablesFull?: boolean;
}

export interface HallColumn {
  id: string;
  x: number;
  y: number;
}

export interface SeatingPerson {
  person_id: string;
  guest_id: string;
  party_id: string;
  person_name: string;
  group: string;
  side: Side;
  is_primary: boolean;
  is_detached: boolean;
  table_id: string;
  seat_order: number;
  updated_at: string;
}

export interface SeatingPlanSnapshot {
  people: SeatingPerson[];
  tables: HallTable[];
  columns: HallColumn[];
}

