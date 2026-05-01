import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wedding-container py-16">
      <div className="info-card text-center">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">Pozivnica za venčanje</h1>
        <p className="mt-4 text-sm text-neutral-700">Aplikacija je spremna. Otvorite admin panel ili personalizovani RSVP link.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/admin/login" className="rounded-full bg-[#a68149] px-5 py-2 text-sm font-semibold text-white">Admin prijava</Link>
        </div>
      </div>
    </main>
  );
}


