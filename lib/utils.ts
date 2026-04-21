import clsx from "clsx";

export function cn(...parts: Array<string | undefined | null | false>): string {
  return clsx(parts);
}

export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}


