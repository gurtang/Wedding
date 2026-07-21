import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getWeddingAccountByUsername, type WeddingAccount } from "./weddings";

const SESSION_COOKIE = "wedding_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

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
  return Boolean(readSessionUsername(raw));
}

function readSessionUsername(raw: string | undefined): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length < 3) return null;
  const signature = parts.pop() as string;
  const payload = parts.join(":");
  if (signature !== sign(payload, secret)) return null;
  return parts[0] || null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return Boolean(await getAdminWeddingAccount());
}

export async function getAdminWeddingAccount(): Promise<WeddingAccount | null> {
  const store = await cookies();
  const username = readSessionUsername(store.get(SESSION_COOKIE)?.value);
  return username ? getWeddingAccountByUsername(username) : null;
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
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;


