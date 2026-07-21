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

function Toggle({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-[#eadbc2] bg-[#fffcf7] px-4 py-3 text-sm text-[#463316]">
      <input type="checkbox" name={name} value="true" defaultChecked={checked} className="h-4 w-4 accent-[#9a8141]" />
      <span>{label}</span>
    </label>
  );
}

export default async function AdminSettingsPage() {
  const account = await requireAdmin();
  const settings = await getSettings(account.spreadsheetId);

  return (
    <main className="space-y-4">
      <AdminHeader />

      <form action={saveSettingsAction} className="admin-card space-y-4">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#463316]">Settings</h2>

        <section className="grid gap-4 xl:grid-cols-2">
          <Field label="Dizajn pozivnice">
            <select name="design_template" defaultValue={settings.design_template} className="w-full rounded-xl border px-3 py-2">
              <option value="classic">Originalni romantični dizajn</option>
              <option value="white_gold">Belo-zlatni cvetni dizajn</option>
            </select>
          </Field>
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

        <section>
          <h3 className="mb-3 font-semibold text-[#5b4320]">Vidljivost sekcija</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Toggle name="show_event_details" label="Datum, vreme i sala" checked={settings.show_event_details} />
            <Toggle name="show_countdown" label="Odbrojavanje" checked={settings.show_countdown} />
            <Toggle name="show_agenda" label="Program / agenda" checked={settings.show_agenda} />
            <Toggle name="show_rsvp" label="RSVP forma" checked={settings.show_rsvp} />
            <Toggle name="show_table" label="Broj stola" checked={settings.show_table} />
            <Toggle name="show_location" label="Mapa i kalendar" checked={settings.show_location} />
            <Toggle name="show_photos" label="Deljenje fotografija" checked={settings.show_photos} />
          </div>
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
