import { NextResponse } from "next/server";
import { ADMIN_SESSION_MAX_AGE, SESSION_COOKIE_NAME, createSessionValue } from "@/lib/auth";

export async function POST(req: Request) {
  const formData = await req.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }

  const response = NextResponse.redirect(new URL("/admin", req.url));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionValue(username),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
