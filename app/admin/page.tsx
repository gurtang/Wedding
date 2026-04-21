import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/guards";
import { listGuestsWithStats } from "@/lib/sheets";

type SearchParams = {
  filter?: string;
  side?: string;
  group?: string;
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const filters = ["sve", "nije_poslata", "poslata", "otvorena", "nije_odgovorio", "dolazi", "ne_dolazi"];

function qp(current: SearchParams, patch: Record<string, string>) {
  const params = new URLSearchParams();
  if (current.filter) params.set("filter", current.filter);
  if (current.side) params.set("side", current.side);
  if (current.group) params.set("group", current.group);
  if (current.q) params.set("q", current.q);
  for (const [k, v] of Object.entries(patch)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const result = params.toString();
  return result ? `?${result}` : "?";
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="admin-card">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#453316]">{value}</p>
    </article>
  );
}

export default async function AdminDashboard({ searchParams }: Props) {
  await requireAdmin();
  const current = (await searchParams) ?? {};
  const activeFilter = current.filter && current.filter !== "sve" ? current.filter : undefined;

  const { guests, stats } = await listGuestsWithStats({
    filter: activeFilter,
    side: (current.side as "mlada" | "mladozenja" | "zajednicki" | "") ?? "",
    group: current.group,
    search: current.q,
  });

  return (
    <main className="space-y-6">
      <AdminHeader />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ukupno gostiju" value={stats.totalGuests} />
        <StatCard label="Nije poslata" value={stats.unsent} />
        <StatCard label="Poslata nije otvorena" value={stats.sentNotOpened} />
        <StatCard label="Otvorena bez odgovora" value={stats.openedNoResponse} />
        <StatCard label="Dolaze" value={stats.attending} />
        <StatCard label="Ne dolaze" value={stats.notAttending} />
        <article className="admin-card sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Ukupan attending_count</p>
          <p className="mt-2 text-2xl font-semibold text-[#453316]">{stats.totalAttendingCount}</p>
        </article>
      </section>

      <section className="admin-card space-y-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f}
              href={qp(current, { filter: f === "sve" ? "" : f })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${((current.filter ?? "sve") === f) ? "bg-[#b4945a] text-white" : "bg-[#f6efe3] text-[#6f542b] hover:bg-[#f0e4d0]"}`}
            >
              {f}
            </Link>
          ))}
        </div>

        <form className="grid gap-2 lg:grid-cols-4">
          <input type="text" name="q" defaultValue={current.q} placeholder="Pretraga ime/telefon/grupa" className="rounded-xl border border-[#d7c4a4] px-3 py-2 text-sm focus:border-[#b4945a] focus:outline-none" />
          <select name="side" defaultValue={current.side ?? ""} className="rounded-xl border border-[#d7c4a4] px-3 py-2 text-sm focus:border-[#b4945a] focus:outline-none">
            <option value="">Sve strane</option>
            <option value="mlada">Mlada</option>
            <option value="mladozenja">Mladozenja</option>
            <option value="zajednicki">Zajednicki</option>
          </select>
          <input type="text" name="group" defaultValue={current.group} placeholder="Grupa" className="rounded-xl border border-[#d7c4a4] px-3 py-2 text-sm focus:border-[#b4945a] focus:outline-none" />
          <button className="rounded-xl bg-[#a68149] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8e6d3a]">Primeni</button>
        </form>

        {guests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ddccab] bg-[#fffcf7] p-6 text-center text-sm text-neutral-600">
            Nema rezultata za izabrane filtere.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#eadbc2]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fbf6ee]">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-[#755c32]">
                  <th className="px-3 py-3">Ime</th>
                  <th className="px-3 py-3">Strana</th>
                  <th className="px-3 py-3">Grupa</th>
                  <th className="px-3 py-3">Telefon</th>
                  <th className="px-3 py-3">Status pozivnice</th>
                  <th className="px-3 py-3">Datum slanja</th>
                  <th className="px-3 py-3">Kanal</th>
                  <th className="px-3 py-3">RSVP status</th>
                  <th className="px-3 py-3">Broj dolazaka</th>
                  <th className="px-3 py-3">Napomena / Razlog</th>
                  <th className="px-3 py-3">Jezik</th>
                  <th className="px-3 py-3">Poslednja izmena</th>
                  <th className="px-3 py-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest, index) => {
                  const rowKey = guest.guest_id?.trim() || guest.token?.trim() || `${guest.display_name}-${guest.phone}-${index}`;

                  return (
                    <tr key={rowKey} className="border-t border-[#f1e5d3] align-top text-neutral-700 hover:bg-[#fffdf9]">
                      <td className="px-3 py-3 font-medium text-[#463316]">{guest.display_name}</td>
                      <td className="px-3 py-3">{guest.side}</td>
                      <td className="px-3 py-3">{guest.group}</td>
                      <td className="px-3 py-3">{guest.phone}</td>
                      <td className="px-3 py-3"><StatusBadge value={guest.invite_status} /></td>
                      <td className="px-3 py-3">{guest.invite_sent_at || "-"}</td>
                      <td className="px-3 py-3">{guest.invite_channel || "-"}</td>
                      <td className="px-3 py-3"><StatusBadge value={guest.rsvp_status} /></td>
                      <td className="px-3 py-3">{guest.attending_count}</td>
                      <td className="max-w-[280px] px-3 py-3">
                        <span className="line-clamp-2 break-words text-xs text-neutral-700">
                          {guest.rsvp_status === "ne_dolazi" ? guest.decline_reason || "-" : guest.note || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-3">{guest.default_language}</td>
                      <td className="px-3 py-3">{guest.response_updated_at || "-"}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/guests/${guest.guest_id}`} className="rounded-full border border-[#c7a66d] px-3 py-1 text-xs font-semibold text-[#6c5127] hover:bg-[#fff4e2]">Detalji</Link>
                          <CopyLinkButton token={guest.token} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
