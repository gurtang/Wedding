import type { Language } from "./types";

type TranslationTree = Record<string, string>;

const sr: TranslationTree = {
  invitationFor: "Pozivnica za",
  save: "Sacuvaj odgovor",
  choose: "Da li dolazite?",
  chooseHint: "Izaberite opciju pa kliknite na \"Sacuvaj odgovor\" ispod.",
  attending: "Dolazim",
  notAttending: "Ne dolazim",
  note: "Napomena (opciono)",
  declineReason: "Razlog (opciono)",
  addGuest: "Dodaj osobu",
  additionalGuests: "Dodatni gosti",
  map: "Otvori mapu",
  viewMap: "Pogledaj mapu",
  confirmArrival: "Potvrdi dolazak",
  agenda: "Agenda",
  arrival: "Dolazak gostiju",
  ceremony: "Vencanje",
  weddingDetails: "Detalji vencanja",
  rsvpCardTitle: "RSVP potvrda",
  confirmBy: "Molimo vas da svoj dolazak potvrdite do",
  deadlineDateText: "29. maja 2026.",
  deadlinePassed: "Rok za potvrdu je istekao. Za izmene se obratite domacinima.",
  deadlineExpiredElegant: "Rok za potvrdu dolaska je istekao.",
  saved: "Odgovor je uspesno sacuvan.",
  saveError: "Doslo je do greske. Pokusajte ponovo.",
  footerNote: "Radujemo se da ovaj dan podelimo sa vama.",
  days: "dana",
  hours: "sati",
  minutes: "min",
  seconds: "sek",
  expired: "Rok je istekao",
  loading: "Ucitavanje...",
  language: "Jezik",
};

const en: TranslationTree = {
  invitationFor: "Invitation for",
  save: "Save response",
  choose: "Will you attend?",
  chooseHint: "Choose an option, then click \"Save response\" below.",
  attending: "Attending",
  notAttending: "Not attending",
  note: "Note (optional)",
  declineReason: "Reason (optional)",
  addGuest: "Add person",
  additionalGuests: "Additional guests",
  map: "Open map",
  viewMap: "View map",
  confirmArrival: "Confirm attendance",
  agenda: "Agenda",
  arrival: "Guest arrival",
  ceremony: "Ceremony",
  weddingDetails: "Wedding details",
  rsvpCardTitle: "RSVP confirmation",
  confirmBy: "Please confirm your attendance by",
  deadlineDateText: "May 29, 2026",
  deadlinePassed: "RSVP deadline has passed. Contact the hosts for changes.",
  deadlineExpiredElegant: "The RSVP deadline has passed.",
  saved: "Response saved successfully.",
  saveError: "Something went wrong. Please try again.",
  footerNote: "We look forward to sharing this day with you.",
  days: "days",
  hours: "hours",
  minutes: "min",
  seconds: "sec",
  expired: "Deadline passed",
  loading: "Loading...",
  language: "Language",
};

const dictionary: Record<Language, TranslationTree> = { sr, en };

export function t(language: Language, key: keyof typeof sr): string {
  return dictionary[language][key] ?? key;
}
