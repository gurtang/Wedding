import { notFound } from "next/navigation";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { isDeadlinePassed } from "@/lib/date";
import { getGuestByToken, getSettings, trackGuestOpen } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let guest: Awaited<ReturnType<typeof getGuestByToken>> = null;
  let settings: Awaited<ReturnType<typeof getSettings>> | null = null;

  try {
    [guest, settings] = await Promise.all([getGuestByToken(token), getSettings()]);
  } catch (error) {
    console.error("RSVP page load failed:", error);
    return (
      <main className="wedding-container py-6 sm:py-10">
        <section className="info-card rounded-3xl border border-[#e5cfaa] bg-[#fffaf2] p-6 text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#4a3618]">Trenutno nije dostupno</h1>
          <p className="mt-3 text-sm text-[#6b593f]">
            Doslo je do problema pri ucitavanju pozivnice. Pokusajte ponovo za nekoliko minuta ili kontaktirajte domacine.
          </p>
        </section>
      </main>
    );
  }

  if (!guest || !settings) {
    notFound();
  }

  try {
    await trackGuestOpen(token);
  } catch (error) {
    // Non-fatal: RSVP page should still render even if open tracking fails.
    console.error("trackGuestOpen failed:", error);
  }

  const locked = isDeadlinePassed(settings) || guest.is_locked_manual;

  return (
    <main className="wedding-container py-6 sm:py-10">
      <RsvpForm guest={guest} settings={settings} initialLanguage={guest.default_language} isLocked={locked} />
    </main>
  );
}


