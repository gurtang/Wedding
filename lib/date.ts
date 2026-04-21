import { DEFAULT_SETTINGS, type Guest, type Settings } from "./types";

export function parseDateInput(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59`);
  }
  return new Date(value);
}

export function isDeadlinePassed(settings: Settings): boolean {
  const deadline = parseDateInput(settings.rsvp_deadline);
  return Number.isNaN(deadline.getTime()) ? false : new Date() > deadline;
}

export function getCountdown(deadlineRaw: string): {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const deadline = parseDateInput(deadlineRaw).getTime();
  const diff = deadline - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired: false, days, hours, minutes, seconds };
}

export function computeAttendingCount(rsvpStatus: Guest["rsvp_status"], additionalGuestNames: string[]): number {
  if (rsvpStatus !== "dolazi") return 0;
  return 1 + additionalGuestNames.length;
}

export function normalizeSettings(input: Partial<Settings>): Settings {
  return { ...DEFAULT_SETTINGS, ...input };
}


