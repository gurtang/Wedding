import WeddingInvitation from "@/components/wedding/WeddingInvitation";
import { findGuestByToken, getGuestTableLabels, getSettings, trackGuestOpen } from "@/lib/sheets";
import { isDeadlinePassed, parseDateInput } from "@/lib/date";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

type PageProps = { params: Promise<{ token: string }> };

const getInvitationData = cache(async (token: string) => {
  const result = await findGuestByToken(token);
  if (!result) return null;
  const settings = await getSettings(result.spreadsheetId);
  return { ...result, settings };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getInvitationData(token);
  if (!data) return {};

  const coupleNames = data.settings.couple_names_sr;
  const imageNames = data.settings.couple_names_en || coupleNames;
  const title = `${coupleNames} – Pozivnica za venčanje`;
  const description = `Pozivnica za venčanje – ${coupleNames}`;
  const imageUrl = `/api/og/${encodeURIComponent(token)}/${encodeURIComponent(imageNames)}`;

  return {
    title,
    description,
    alternates: { canonical: `/rsvp/${encodeURIComponent(token)}` },
    openGraph: {
      type: "website",
      locale: "sr_RS",
      title,
      description,
      url: `/rsvp/${encodeURIComponent(token)}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

function formatDeadlineLabel(deadlineRaw: string): string {
  const deadline = parseDateInput(deadlineRaw);
  if (Number.isNaN(deadline.getTime())) return deadlineRaw;
  return deadline.toLocaleDateString("sr-RS", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RsvpPage({ params }: PageProps) {
  const { token } = await params;
  const data = await getInvitationData(token);
  if (!data) notFound();
  const { spreadsheetId, guest, settings } = data;
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
