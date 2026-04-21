"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, setAdminSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/guards";
import { markInviteSent, updateGuestAdmin, updateSettings } from "@/lib/sheets";

export async function loginAction(_: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Pogresno korisnicko ime ili lozinka." };
  }

  await setAdminSession(username);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  await updateSettings({
    couple_names_sr: String(formData.get("couple_names_sr") ?? ""),
    couple_names_en: String(formData.get("couple_names_en") ?? ""),
    event_date: String(formData.get("event_date") ?? ""),
    venue_name: String(formData.get("venue_name") ?? ""),
    venue_address: String(formData.get("venue_address") ?? ""),
    map_url: String(formData.get("map_url") ?? ""),
    guest_arrival_time: String(formData.get("guest_arrival_time") ?? ""),
    ceremony_time: String(formData.get("ceremony_time") ?? ""),
    rsvp_deadline: String(formData.get("rsvp_deadline") ?? ""),
    intro_text_sr: String(formData.get("intro_text_sr") ?? ""),
    intro_text_en: String(formData.get("intro_text_en") ?? ""),
    agenda_sr: String(formData.get("agenda_sr") ?? ""),
    agenda_en: String(formData.get("agenda_en") ?? ""),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/rsvp/[token]", "page");
}

export async function saveGuestAction(guestId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const rawAdditional = String(formData.get("additional_guest_names") ?? "");
  const additional = rawAdditional
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

  await updateGuestAdmin(guestId, {
    display_name: String(formData.get("display_name") ?? ""),
    custom_greeting: String(formData.get("custom_greeting") ?? ""),
    side: String(formData.get("side") ?? "zajednicki"),
    group: String(formData.get("group") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    default_language: String(formData.get("default_language") ?? "sr"),
    max_guests: Number(formData.get("max_guests") ?? 1),
    invite_status: String(formData.get("invite_status") ?? "nije_poslata"),
    invite_sent_at: String(formData.get("invite_sent_at") ?? ""),
    invite_channel: String(formData.get("invite_channel") ?? ""),
    rsvp_status: String(formData.get("rsvp_status") ?? "nije_odgovorio"),
    additional_guest_names: additional,
    note: String(formData.get("note") ?? ""),
    decline_reason: String(formData.get("decline_reason") ?? ""),
    is_locked_manual: String(formData.get("is_locked_manual") ?? "false") === "true",
  });

  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath("/admin");
}

export async function markAsSentAction(guestId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const channel = String(formData.get("invite_channel") ?? "whatsapp").trim();
  await markInviteSent(guestId, channel);
  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath("/admin");
}
