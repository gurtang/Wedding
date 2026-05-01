import { NextResponse } from "next/server";
import { getGuestByToken, getSettings } from "@/lib/sheets";

export const dynamic = "force-dynamic";

function escapeIcsText(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function foldIcsLine(line: string): string {
  const limit = 74;
  if (line.length <= limit) return line;

  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += limit) {
    chunks.push(line.slice(i, i + limit));
  }

  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join("\r\n");
}

function buildIcs(lines: string[]): string {
  return `${lines.map((line) => foldIcsLine(line)).join("\r\n")}\r\n`;
}

function toIcsDateTimeLocal(date: string, time: string): string {
  const normalized = `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  return normalized;
}

function addHours(date: string, time: string, hoursToAdd: number): { date: string; time: string } {
  const base = new Date(`${date}T${time}:00`);
  const next = new Date(base.getTime() + hoursToAdd * 60 * 60 * 1000);
  const yyyy = String(next.getFullYear());
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  const hh = String(next.getHours()).padStart(2, "0");
  const min = String(next.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
}

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const [guest, settings] = await Promise.all([getGuestByToken(token), getSettings()]);

    if (!guest) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    const startDate = settings.event_date;
    const startTime = "17:00";
    const end = addHours(startDate, startTime, 6);

    const title = settings.couple_names_sr || "Svadba";
    const description = `${settings.intro_text_sr}\n\nPozivnica za: ${guest.display_name}`;
    const location = settings.venue_address || settings.venue_name;
    const uid = `wedding-${token}@wedding-invite`;
    const dtStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    const ics = buildIcs([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invite//RSVP//SR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Svadba",
      "BEGIN:VTIMEZONE",
      "TZID:Europe/Belgrade",
      "X-LIC-LOCATION:Europe/Belgrade",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:+0100",
      "TZOFFSETTO:+0200",
      "TZNAME:CEST",
      "DTSTART:19700329T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0200",
      "TZOFFSETTO:+0100",
      "TZNAME:CET",
      "DTSTART:19701025T030000",
      "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
      "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=Europe/Belgrade:${toIcsDateTimeLocal(startDate, startTime)}`,
      `DTEND;TZID=Europe/Belgrade:${toIcsDateTimeLocal(end.date, end.time)}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "TRANSP:OPAQUE",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Podsetnik - svadba je za 7 dana",
      "TRIGGER:-P7D",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Podsetnik - svadba je sutra",
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ]);

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="svadba-${token}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate calendar event." },
      { status: 500 },
    );
  }
}
