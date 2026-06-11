"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

export type GuestTableSearchItem = {
  id: string;
  name: string;
  tableLabel: string;
  tableName: string;
  side: string;
  group: string;
};

const sideLabels: Record<string, string> = {
  mlada: "Mladina strana",
  mladozenja: "Mladoženjina strana",
  zajednicki: "Zajednički",
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("sr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "dj")
    .replace(/\s+/g, " ")
    .trim();
}

export function GuestTableSearch({ guests }: { guests: GuestTableSearchItem[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return guests
      .filter((guest) => normalize(`${guest.name} ${guest.group}`).includes(normalizedQuery))
      .slice(0, 12);
  }, [guests, normalizedQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-[28px] border border-[#d8bf94] bg-white/95 p-5 shadow-[0_18px_70px_rgba(75,55,25,0.12)] sm:p-7">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          placeholder="Unesite ime gosta"
          className="min-h-12 flex-1 rounded-full border border-[#d8bf94] bg-[#fffaf2] px-5 text-base text-[#332c24] outline-none transition focus:border-[#a68149] focus:bg-white"
        />
        <button
          type="submit"
          className="min-h-12 rounded-full bg-[#a68149] px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#8f6936]"
        >
          Pretraži
        </button>
      </form>

      <div className="mt-6">
        {!normalizedQuery ? (
          <p className="rounded-2xl border border-dashed border-[#dcc8a8] bg-[#fffaf2] px-4 py-5 text-center text-sm text-[#7b6a54]">
            Počnite da kucate ime i broj stola će se prikazati odmah.
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#dcc8a8] bg-[#fffaf2] px-4 py-5 text-center text-sm text-[#7b6a54]">
            Nema rezultata za uneto ime.
          </p>
        ) : (
          <div className="grid gap-3">
            {results.map((guest) => (
              <article
                key={guest.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#eadbc2] bg-[#fffdf8] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl leading-tight text-[#463518]">
                    {guest.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#7b6a54]">
                    {sideLabels[guest.side] ?? "Gost"}{guest.group ? ` · ${guest.group}` : ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d8bf94] bg-white px-5 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7440]">Broj stola</p>
                  <p className="mt-1 font-[family-name:var(--font-cormorant)] text-4xl leading-none text-[#332c24]">
                    {guest.tableLabel || "-"}
                  </p>
                  {guest.tableName ? <p className="mt-1 text-xs text-[#7b6a54]">{guest.tableName}</p> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
