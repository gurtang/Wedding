import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export function AdminHeader() {
  return (
    <header className="mb-6 rounded-2xl border border-[#eadcc6] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#463518]">Wedding Admin</h1>
          <p className="text-sm text-neutral-600">Upravljanje pozivnicama i RSVP odgovorima</p>
      </div>
        <nav className="flex items-center gap-2">
          <Link href="/admin" className="rounded-full border border-[#b4945a] px-4 py-2 text-sm font-medium text-[#6c5228] transition hover:bg-[#fff7ea]">Dashboard</Link>
          <Link href="/admin/settings" className="rounded-full border border-[#b4945a] px-4 py-2 text-sm font-medium text-[#6c5228] transition hover:bg-[#fff7ea]">Settings</Link>
        <form action={logoutAction}>
            <button className="rounded-full bg-[#a68149] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8f6936]">Logout</button>
        </form>
        </nav>
      </div>
    </header>
  );
}
