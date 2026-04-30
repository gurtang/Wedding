import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/guards";
import { getSettings } from "@/lib/sheets";
import { saveSettingsAction } from "../actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm text-neutral-700">
      <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <main className="space-y-4">
      <AdminHeader />

      <form action={saveSettingsAction} className="admin-card space-y-4">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#463316]">Settings</h2>

        <section className="grid gap-4 xl:grid-cols-2">
          <Field label="Imena mladenaca (SR)"><input name="couple_names_sr" defaultValue={settings.couple_names_sr} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Couple names (EN)"><input name="couple_names_en" defaultValue={settings.couple_names_en} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Datum dogadjaja"><input name="event_date" defaultValue={settings.event_date} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Naziv lokacije"><input name="venue_name" defaultValue={settings.venue_name} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Adresa/opis lokacije"><input name="venue_address" defaultValue={settings.venue_address} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Mapa URL"><input name="map_url" defaultValue={settings.map_url} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Vreme dolaska gostiju"><input name="guest_arrival_time" defaultValue={settings.guest_arrival_time} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Vreme venčanja"><input name="ceremony_time" defaultValue={settings.ceremony_time} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="RSVP deadline"><input name="rsvp_deadline" defaultValue={settings.rsvp_deadline} className="w-full rounded-xl border px-3 py-2" /></Field>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Field label="Uvodni tekst SR"><textarea name="intro_text_sr" defaultValue={settings.intro_text_sr} rows={4} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Uvodni tekst EN"><textarea name="intro_text_en" defaultValue={settings.intro_text_en} rows={4} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Agenda SR"><textarea name="agenda_sr" defaultValue={settings.agenda_sr} rows={5} className="w-full rounded-xl border px-3 py-2" /></Field>
          <Field label="Agenda EN"><textarea name="agenda_en" defaultValue={settings.agenda_en} rows={5} className="w-full rounded-xl border px-3 py-2" /></Field>
        </section>

        <button className="rounded-full bg-[#a68149] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8f6936]">Sačuvaj podešavanja</button>
      </form>
    </main>
  );
}
