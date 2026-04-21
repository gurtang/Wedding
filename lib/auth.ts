import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "wedding_admin_session";

function getSessionSecret(): string | undefined {
  return process.env.SESSION_SECRET;
}

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionValue(username: string): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is missing.");
  }
  const payload = `${username}:${Date.now()}`;
  return `${payload}:${sign(payload, secret)}`;
}

export function verifySessionValue(raw: string | undefined): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;
  if (!raw) return false;
  const parts = raw.split(":");
  if (parts.length < 3) return false;
  const signature = parts.pop() as string;
  const payload = parts.join(":");
  return signature === sign(payload, secret);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  return verifySessionValue(cookie);
}

export async function setAdminSession(username: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: createSessionValue(username),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;


