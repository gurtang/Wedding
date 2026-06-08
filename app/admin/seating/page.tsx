import { AdminHeader } from "@/components/admin/admin-header";
import { SeatingPlanner } from "@/components/admin/seating-planner";
import { requireAdmin } from "@/lib/guards";
import { getSeatingPlanData } from "@/lib/sheets";

export default async function SeatingPage() {
  await requireAdmin();
  const { guests, people, tables, columns } = await getSeatingPlanData();

  return (
    <main className="space-y-4">
      <AdminHeader />
      <article className="admin-card">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#463316]">Raspored gostiju u hali</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Klikni gosta sa leve strane, pa klikni sto na mapi. Kod povezanih gostiju premešta se cela grupa, osim ako ne odabereš opciju "Raspari".
        </p>
      </article>
      <SeatingPlanner initialGuests={guests} initialPeople={people} tables={tables} columns={columns} />
    </main>
  );
}
