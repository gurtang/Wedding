import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { requireAdmin } from "@/lib/guards";
import { getGuestById } from "@/lib/sheets";
import { markAsSentAction, saveGuestAction } from "../../actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm text-neutral-700">
      <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export default async function GuestDetailPage({ params }: { params: Promise<{ guestId: string }> }) {
  await requireAdmin();
  const { guestId } = await params;
  const guest = await getGuestById(guestId);

  if (!guest) {
    notFound();
  }

  const saveAction = saveGuestAction.bind(null, guestId);
  const sentAction = markAsSentAction.bind(null, guestId);

  return (
    <main className="space-y-4">
      <AdminHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="text-sm font-medium text-[#7a5c2c] hover:underline">Nazad na dashboard</Link>
        <CopyLinkButton token={guest.token} />
      </div>

      <form action={saveAction} className="space-y-4">
        <section className="admin-card">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#463316]">{guest.display_name}</h2>
          <p className="mt-1 text-sm text-neutral-600">ID: {guest.guest_id} | Token: {guest.token}</p>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="admin-card space-y-3">
            <h3 className="font-semibold text-[#5b4320]">Osnovni podaci</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display name"><input name="display_name" defaultValue={guest.display_name} className="w-full rounded-xl border px-3 py-2" /></Field>
              <Field label="Custom greeting"><input name="custom_greeting" defaultValue={guest.custom_greeting} className="w-full rounded-xl border px-3 py-2" /></Field>
              <Field label="Side"><select name="side" defaultValue={guest.side} className="w-full rounded-xl border px-3 py-2"><option value="mlada">mlada</option><option value="mladozenja">mladozenja</option><option value="zajednicki">zajednicki</option></select></Field>
              <Field label="Group"><input name="group" defaultValue={guest.group} className="w-full rounded-xl border px-3 py-2" /></Field>
              <Field label="Phone"><input name="phone" defaultValue={guest.phone} className="w-full rounded-xl border px-3 py-2" /></Field>
              <Field label="Default language"><select name="default_language" defaultValue={guest.default_language} className="w-full rounded-xl border px-3 py-2"><option value="sr">sr</option><option value="en">en</option></select></Field>
            </div>
          </article>

          <article className="admin-card space-y-3">
            <h3 className="font-semibold text-[#5b4320]">Pozivnica / slanje</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Invite status"><select name="invite_status" defaultValue={guest.invite_status} className="w-full rounded-xl border px-3 py-2"><option value="nije_poslata">nije_poslata</option><option value="poslata">poslata</option><option value="otvorena">otvorena</option></select></Field>
              <Field label="Invite channel"><input name="invite_channel" defaultValue={guest.invite_channel} className="w-full rounded-xl border px-3 py-2" /></Field>
              <Field label="Invite sent at"><input name="invite_sent_at" defaultValue={guest.invite_sent_at} className="w-full rounded-xl border px-3 py-2" /></Field>
              <Field label="Manual lock"><select name="is_locked_manual" defaultValue={String(guest.is_locked_manual)} className="w-full rounded-xl border px-3 py-2"><option value="false">false</option><option value="true">true</option></select></Field>
            </div>
          </article>

          <article className="admin-card space-y-3">
            <h3 className="font-semibold text-[#5b4320]">RSVP odgovor</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="RSVP status"><select name="rsvp_status" defaultValue={guest.rsvp_status} className="w-full rounded-xl border px-3 py-2"><option value="nije_odgovorio">nije_odgovorio</option><option value="dolazi">dolazi</option><option value="ne_dolazi">ne_dolazi</option></select></Field>
              <Field label="Max guests"><input name="max_guests" type="number" min={1} defaultValue={guest.max_guests} className="w-full rounded-xl border px-3 py-2" /></Field>
            </div>
            <Field label="Additional guest names (one per line)">
              <textarea name="additional_guest_names" defaultValue={guest.additional_guest_names.join("\n")} rows={4} className="w-full rounded-xl border px-3 py-2" />
            </Field>
          </article>

          <article className="admin-card space-y-3">
            <h3 className="font-semibold text-[#5b4320]">Napomena i razlog</h3>
            <Field label="Note"><textarea name="note" defaultValue={guest.note} rows={3} className="w-full rounded-xl border px-3 py-2" /></Field>
            <Field label="Decline reason"><textarea name="decline_reason" defaultValue={guest.decline_reason} rows={3} className="w-full rounded-xl border px-3 py-2" /></Field>
          </article>
        </section>

        <section className="admin-card flex flex-wrap gap-3">
          <button className="rounded-full bg-[#a68149] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8f6936]">Sačuvaj izmene</button>
        </section>
      </form>

      <form action={sentAction} className="admin-card flex flex-wrap items-center gap-3">
        <input name="invite_channel" defaultValue={guest.invite_channel || "whatsapp"} className="rounded-xl border px-3 py-2 text-sm" />
        <button className="rounded-full border border-[#b4945a] px-4 py-2 text-sm font-semibold text-[#6d5228] hover:bg-[#fff4e2]">Oznaci kao poslatu</button>
      </form>

      <section className="admin-card grid gap-1 text-xs text-neutral-600">
        <p>first_opened_at: {guest.first_opened_at || "-"}</p>
        <p>last_opened_at: {guest.last_opened_at || "-"}</p>
        <p>response_updated_at: {guest.response_updated_at || "-"}</p>
      </section>
    </main>
  );
}
