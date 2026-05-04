import WeddingInvitation from "@/components/wedding/WeddingInvitation";
import { getGuestByToken } from "@/lib/sheets";
import { notFound } from "next/navigation";

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  if (!guest) {
    notFound();
  }
  return (
    <WeddingInvitation
      guestId={token}
      guestName={guest.display_name}
      maxAdditionalGuests={Math.max(0, guest.max_guests - 1)}
      initialRsvpStatus={guest.rsvp_status}
      initialAdditionalGuestNames={guest.additional_guest_names}
      initialNote={guest.note}
      initialDeclineReason={guest.decline_reason}
    />
  );
}
