import WeddingInvitation from "@/components/wedding/WeddingInvitation";
import { findGuestByToken, getGuestTableLabels, getSettings, trackGuestOpen } from "@/lib/sheets";
import { isDeadlinePassed, parseDateInput } from "@/lib/date";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

function formatDeadlineLabel(deadlineRaw: string): string {
  const deadline = parseDateInput(deadlineRaw);
  if (Number.isNaN(deadline.getTime())) return deadlineRaw;
  return deadline.toLocaleDateString("sr-RS", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await findGuestByToken(token);
  if (!result) notFound();
  const { spreadsheetId, guest } = result;
  const settings = await getSettings(spreadsheetId);
  const showDeadlineCard = !isDeadlinePassed(settings);
  const rsvpDeadlineLabel = formatDeadlineLabel(settings.rsvp_deadline);
  const userAgent = (await headers()).get("user-agent")?.toLowerCase() ?? "";
  const isMetaCrawler =
    userAgent.includes("facebookexternalhit") ||
    userAgent.includes("facebot") ||
    userAgent.includes("meta-externalagent");

  if (isMetaCrawler) {
    return (
      <WeddingInvitation
        settings={settings}
        guestId={token}
        maxAdditionalGuests={0}
        showDeadlineCard={showDeadlineCard}
        rsvpDeadlineLabel={rsvpDeadlineLabel}
      />
    );
  }

  const tableLabels = await getGuestTableLabels(spreadsheetId, guest.guest_id);

  try {
    await trackGuestOpen(spreadsheetId, token);
  } catch (error) {
    console.error("trackGuestOpen failed:", error);
  }
  return (
    <WeddingInvitation
      guestId={token}
      guestName={guest.display_name}
      maxAdditionalGuests={Math.max(0, guest.max_guests - 1)}
      showDeadlineCard={showDeadlineCard}
      rsvpDeadlineLabel={rsvpDeadlineLabel}
      initialRsvpStatus={guest.rsvp_status}
      initialAdditionalGuestNames={Array.isArray(guest.additional_guest_names) ? guest.additional_guest_names : []}
      initialNote={typeof guest.note === 'string' ? guest.note : ''}
      initialDeclineReason={typeof guest.decline_reason === 'string' ? guest.decline_reason : ''}
      tableLabels={tableLabels}
      settings={settings}
    />
  );
}
