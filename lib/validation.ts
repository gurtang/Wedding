import { z } from "zod";

export const responsePayloadSchema = z
  .object({
    rsvp_status: z.enum(["dolazi", "ne_dolazi"]),
    additional_guest_names: z.array(z.string().trim().min(2).max(120)).default([]),
    note: z.string().trim().max(1000).optional().default(""),
    decline_reason: z.string().trim().max(500).optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.rsvp_status === "dolazi" && value.decline_reason) {
      ctx.addIssue({ code: "custom", message: "Decline reason must be empty for attending guests." });
    }
  });

export const adminGuestUpdateSchema = z.object({
  display_name: z.string().trim().min(1).max(120),
  custom_greeting: z.string().trim().max(300),
  side: z.enum(["mlada", "mladozenja", "zajednicki"]),
  group: z.string().trim().max(120),
  phone: z.string().trim().max(50),
  default_language: z.enum(["sr", "en"]),
  max_guests: z.coerce.number().int().min(1).max(20),
  invite_status: z.enum(["nije_poslata", "poslata", "otvorena"]),
  invite_sent_at: z.string().trim().max(50),
  invite_channel: z.string().trim().max(50),
  rsvp_status: z.enum(["nije_odgovorio", "dolazi", "ne_dolazi"]),
  additional_guest_names: z.array(z.string().trim().min(2).max(120)),
  note: z.string().trim().max(1000),
  decline_reason: z.string().trim().max(500),
  is_locked_manual: z.boolean(),
});

export const settingsUpdateSchema = z.object({
  couple_names_sr: z.string().trim().min(1),
  couple_names_en: z.string().trim().min(1),
  event_date: z.string().trim().min(1),
  venue_name: z.string().trim().min(1),
  venue_address: z.string().trim().min(1),
  map_url: z.string().trim().url(),
  guest_arrival_time: z.string().trim().min(1),
  ceremony_time: z.string().trim().min(1),
  rsvp_deadline: z.string().trim().min(1),
  intro_text_sr: z.string().trim().min(1),
  intro_text_en: z.string().trim().min(1),
  agenda_sr: z.string().trim().min(1),
  agenda_en: z.string().trim().min(1),
});


