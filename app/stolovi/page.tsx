import type { Metadata } from "next";
import { GuestTableSearch, type GuestTableSearchItem } from "@/components/tables/guest-table-search";
import { requireAdmin } from "@/lib/guards";
import { getSeatingPlanData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pretraga stola | Milena & Slobodan",
  description: "Pretraga gostiju po imenu i prikaz broja stola.",
};

export default async function TableSearchPage() {
  await requireAdmin();
  const { people, tables } = await getSeatingPlanData();
  const tableById = new Map(tables.map((table) => [table.id, table] as const));

  const guests: GuestTableSearchItem[] = people
    .filter((person) => person.table_id)
    .map((person) => {
      const table = tableById.get(person.table_id);

      return {
        id: person.person_id,
        name: person.person_name,
        tableLabel: table?.label ?? person.table_id,
        tableName: table?.name ?? "",
        side: person.side,
        group: person.group,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "sr"));

  return (
    <main className="min-h-screen bg-[#fbf5eb] px-5 py-10 text-[#332c24]">
      <section className="mx-auto mb-8 max-w-3xl text-center">
        <p className="font-[family-name:var(--font-montserrat)] text-[11px] uppercase tracking-[0.34em] text-[#a68149]">
          Milena & Slobodan
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-great-vibes)] text-[62px] leading-none text-[#9d5f61] sm:text-[84px]">
          Pronađite svoj sto
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#463518] sm:text-3xl">
          Upišite ime gosta i odmah ćete videti broj stola.
        </p>
      </section>

      <GuestTableSearch guests={guests} />
    </main>
  );
}
