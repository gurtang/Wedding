"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { saveSeatingAction } from "@/app/admin/actions";
import type { Guest, HallColumn, HallTable, SeatingPerson, Side } from "@/lib/types";

type Props = {
  initialGuests: Guest[];
  initialPeople: SeatingPerson[];
  tables: HallTable[];
  columns: HallColumn[];
};

type SeatableEntity = {
  id: string;
  partyId: string;
  personIds: string[];
  personNames: string[];
  displayName: string;
  group: string;
  side: Side;
  tableId: string;
  isDetached: boolean;
};

type TableNote = {
  guestName: string;
  note: string;
};

const sideLabel: Record<Side, string> = {
  mlada: "Mladina strana",
  mladozenja: "Mladoženjina strana",
  zajednicki: "Zajednički",
};

function countBy<T extends string>(values: T[]): Map<T, number> {
  const result = new Map<T, number>();
  for (const value of values) {
    result.set(value, (result.get(value) ?? 0) + 1);
  }
  return result;
}

function mostFrequent(values: string[]): string {
  if (values.length === 0) return "";
  const counts = countBy(values);
  let best = values[0];
  let bestCount = counts.get(best) ?? 0;
  for (const [value, count] of counts.entries()) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

function nextSeatOrder(people: SeatingPerson[], tableId: string): number {
  const used = people.filter((person) => person.table_id === tableId).map((person) => person.seat_order);
  if (used.length === 0) return 1;
  return Math.max(...used) + 1;
}

function tableLoadColor(used: number, optimal: number, max: number): string {
  if (used > max) return "bg-red-100 text-red-700 border-red-300";
  if (used > optimal) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-emerald-100 text-emerald-700 border-emerald-300";
}

function tableCircleClass(kind: HallTable["kind"]): string {
  if (kind === "head") return "border-2 border-[#9a6c2f] bg-[#fff5e5]";
  if (kind === "music") return "border border-dashed border-[#b7925d] bg-[#faf4ea]";
  return "border border-[#b7925d] bg-white";
}

function tableDiameter(kind: HallTable["kind"]): number {
  if (kind === "head") return 58;
  if (kind === "music") return 64;
  if (kind === "inner") return 70;
  return 78;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function groupPeopleByTable(people: SeatingPerson[]): Map<string, SeatingPerson[]> {
  const map = new Map<string, SeatingPerson[]>();
  for (const person of people) {
    if (!person.table_id) continue;
    const list = map.get(person.table_id) ?? [];
    list.push(person);
    map.set(person.table_id, list);
  }
  for (const [tableId, list] of map.entries()) {
    map.set(
      tableId,
      [...list].sort((a, b) => {
        if (a.seat_order !== b.seat_order) return a.seat_order - b.seat_order;
        return a.person_name.localeCompare(b.person_name, "sr");
      }),
    );
  }
  return map;
}

function buildEntities(people: SeatingPerson[]): SeatableEntity[] {
  const byParty = new Map<string, SeatingPerson[]>();
  for (const person of people) {
    const list = byParty.get(person.party_id) ?? [];
    list.push(person);
    byParty.set(person.party_id, list);
  }

  const entities: SeatableEntity[] = [];
  for (const [partyId, members] of byParty.entries()) {
    const linked = members.filter((member) => !member.is_detached);
    const detached = members.filter((member) => member.is_detached);

    if (linked.length > 0) {
      const primary = linked.find((member) => member.is_primary) ?? linked[0];
      const displayName = linked.length > 1 ? `${primary.person_name} +${linked.length - 1}` : primary.person_name;
      entities.push({
        id: `party:${partyId}`,
        partyId,
        personIds: linked.map((member) => member.person_id),
        personNames: linked.map((member) => member.person_name),
        displayName,
        group: primary.group,
        side: primary.side,
        tableId: linked.find((member) => member.table_id)?.table_id ?? "",
        isDetached: false,
      });
    }

    for (const person of detached) {
      entities.push({
        id: `person:${person.person_id}`,
        partyId,
        personIds: [person.person_id],
        personNames: [person.person_name],
        displayName: person.person_name,
        group: person.group,
        side: person.side,
        tableId: person.table_id,
        isDetached: true,
      });
    }
  }

  return entities.sort((a, b) => a.displayName.localeCompare(b.displayName, "sr"));
}

export function SeatingPlanner({ initialGuests, initialPeople, tables, columns }: Props) {
  const [people, setPeople] = useState<SeatingPerson[]>(initialPeople);
  const [tableNames, setTableNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(tables.map((table) => [table.id, table.name ?? ""]).filter(([, name]) => name)),
  );
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<Side | "">("");
  const [groupFilter, setGroupFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [focusedTableId, setFocusedTableId] = useState<string>("");
  const [swapTargetTableId, setSwapTargetTableId] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const entities = useMemo(() => buildEntities(people), [people]);
  const entitiesById = useMemo(() => new Map(entities.map((entity) => [entity.id, entity] as const)), [entities]);
  const personToEntity = useMemo(() => {
    const map = new Map<string, string>();
    for (const entity of entities) {
      for (const personId of entity.personIds) {
        map.set(personId, entity.id);
      }
    }
    return map;
  }, [entities]);
  const tableById = useMemo(() => new Map(tables.map((table) => [table.id, table] as const)), [tables]);
  const tablePeople = useMemo(() => groupPeopleByTable(people), [people]);
  const guestById = useMemo(() => new Map(initialGuests.map((guest) => [guest.guest_id, guest] as const)), [initialGuests]);
  const primaryNameByParty = useMemo(() => {
    const map = new Map<string, string>();
    for (const person of people) {
      if (person.is_primary) {
        map.set(person.party_id, person.person_name);
      }
    }
    return map;
  }, [people]);

  const usedByTable = useMemo(() => {
    const result = new Map<string, number>();
    for (const person of people) {
      if (!person.table_id) continue;
      result.set(person.table_id, (result.get(person.table_id) ?? 0) + 1);
    }
    return result;
  }, [people]);

  const regularHasSpace = useMemo(() => {
    return tables
      .filter((table) => table.kind !== "music")
      .some((table) => (usedByTable.get(table.id) ?? 0) < table.maxCapacity);
  }, [tables, usedByTable]);

  const selectedEntity = selectedEntityId ? entitiesById.get(selectedEntityId) : undefined;
  const selectedTablePeople = focusedTableId ? tablePeople.get(focusedTableId) ?? [] : [];
  const focusedTable = focusedTableId ? tableById.get(focusedTableId) : undefined;
  const swapTargetTable = swapTargetTableId ? tableById.get(swapTargetTableId) : undefined;
  const notesByTable = useMemo(() => {
    const result = new Map<string, TableNote[]>();

    for (const table of tables) {
      const tableRows = tablePeople.get(table.id) ?? [];
      const seenGuestIds = new Set<string>();
      const notes: TableNote[] = [];

      for (const person of tableRows) {
        if (seenGuestIds.has(person.guest_id)) continue;
        seenGuestIds.add(person.guest_id);

        const guest = guestById.get(person.guest_id);
        const note = guest?.note?.trim();
        if (note) {
          notes.push({ guestName: guest?.display_name || person.person_name, note });
        }
      }

      if (notes.length > 0) {
        result.set(table.id, notes);
      }
    }

    return result;
  }, [guestById, tablePeople, tables]);
  const groupOptions = useMemo(() => {
    return [
      ...new Set(
        initialGuests
          .filter((guest) => !sideFilter || guest.side === sideFilter)
          .map((guest) => guest.group.trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, "sr"));
  }, [initialGuests, sideFilter]);

  useEffect(() => {
    if (groupFilter && !groupOptions.includes(groupFilter)) {
      setGroupFilter("");
    }
  }, [groupFilter, groupOptions]);

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      if (!showAll && entity.tableId) return false;
      if (sideFilter && entity.side !== sideFilter) return false;
      if (groupFilter && entity.group !== groupFilter) return false;
      if (query) {
        const haystack = `${entity.displayName} ${entity.group} ${sideLabel[entity.side]} ${entity.personNames.join(" ")}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [entities, showAll, sideFilter, groupFilter, query]);

  const setPeopleWithDirty = (updater: (prev: SeatingPerson[]) => SeatingPerson[]) => {
    setPeople((prev) => {
      const next = updater(prev);
      return next;
    });
    setDirty(true);
    setMessage("");
  };

  const setTableNamesWithDirty = (updater: (prev: Record<string, string>) => Record<string, string>) => {
    setTableNames((prev) => updater(prev));
    setDirty(true);
    setMessage("");
  };

  const updateTableName = (tableId: string, name: string) => {
    setTableNamesWithDirty((prev) => {
      const next = { ...prev };
      const normalized = name.replace(/\s+/g, " ").trimStart().slice(0, 80);

      if (normalized.trim()) {
        next[tableId] = normalized;
      } else {
        delete next[tableId];
      }

      return next;
    });
  };

  const assignEntityToTable = (entityId: string, tableId: string) => {
    const entity = entitiesById.get(entityId);
    const table = tableById.get(tableId);
    if (!entity || !table) return;

    if (table.kind === "music" && regularHasSpace) {
      const confirmed = window.confirm("Regularni stolovi još nisu popunjeni. Da li želiš ipak da koristiš pomoćni sto kod muzike?");
      if (!confirmed) return;
    }

    const movingIds = new Set(entity.personIds);
    const base = people.map((person) => {
      if (!movingIds.has(person.person_id)) return person;
      return { ...person, table_id: "", seat_order: 0 };
    });
    const startOrder = nextSeatOrder(base, tableId);
    const orderByPersonId = new Map<string, number>();
    entity.personIds.forEach((personId, index) => {
      orderByPersonId.set(personId, startOrder + index);
    });

    const withSeatOrder = base.map((person) => {
      if (!movingIds.has(person.person_id)) return person;
      return {
        ...person,
        table_id: tableId,
        seat_order: orderByPersonId.get(person.person_id) ?? startOrder,
      };
    });

    const used = withSeatOrder.filter((person) => person.table_id === tableId).length;
    if (used > table.maxCapacity) {
      window.alert(`Sto ${table.label} prima maksimalno ${table.maxCapacity} gostiju.`);
      return;
    }

    setPeopleWithDirty(() => withSeatOrder);
    setFocusedTableId(tableId);
    setSelectedEntityId("");
  };

  const unassignEntity = (entityId: string) => {
    const entity = entitiesById.get(entityId);
    if (!entity) return;

    setPeopleWithDirty((prev) =>
      prev.map((person) => {
        if (!entity.personIds.includes(person.person_id)) return person;
        return { ...person, table_id: "", seat_order: 0 };
      }),
    );
  };

  const splitParty = (partyId: string) => {
    setPeopleWithDirty((prev) =>
      prev.map((person) => {
        if (person.party_id !== partyId || person.is_primary) return person;
        return { ...person, is_detached: true };
      }),
    );
  };

  const mergeParty = (partyId: string) => {
    setPeopleWithDirty((prev) => {
      const partyPeople = prev.filter((person) => person.party_id === partyId);
      const primary = partyPeople.find((person) => person.is_primary);
      const sharedTable = primary?.table_id || partyPeople.find((person) => person.table_id)?.table_id || "";

      return prev.map((person) => {
        if (person.party_id !== partyId) return person;
        if (person.is_primary) return { ...person, is_detached: false };
        return { ...person, is_detached: false, table_id: sharedTable };
      });
    });
  };

  const swapTables = () => {
    if (!focusedTableId || !swapTargetTableId || focusedTableId === swapTargetTableId) return;

    setPeopleWithDirty((prev) => {
      const sourcePeople = prev.filter((person) => person.table_id === focusedTableId);
      const targetPeople = prev.filter((person) => person.table_id === swapTargetTableId);
      const sourceOrder = new Map(sourcePeople.map((person, index) => [person.person_id, index + 1] as const));
      const targetOrder = new Map(targetPeople.map((person, index) => [person.person_id, index + 1] as const));

      return prev.map((person) => {
        if (person.table_id === focusedTableId) {
          return {
            ...person,
            table_id: swapTargetTableId,
            seat_order: sourceOrder.get(person.person_id) ?? person.seat_order,
          };
        }

        if (person.table_id === swapTargetTableId) {
          return {
            ...person,
            table_id: focusedTableId,
            seat_order: targetOrder.get(person.person_id) ?? person.seat_order,
          };
        }

        return person;
      });
    });

    setTableNamesWithDirty((prev) => {
      const next = { ...prev };
      const sourceName = next[focusedTableId] ?? "";
      const targetName = next[swapTargetTableId] ?? "";

      if (targetName) {
        next[focusedTableId] = targetName;
      } else {
        delete next[focusedTableId];
      }

      if (sourceName) {
        next[swapTargetTableId] = sourceName;
      } else {
        delete next[swapTargetTableId];
      }

      return next;
    });

    setSwapTargetTableId("");
  };

  const autoAssign = () => {
    const unassigned = entities.filter((entity) => !entity.tableId).sort((a, b) => b.personIds.length - a.personIds.length);
    if (unassigned.length === 0) return;

    setPeopleWithDirty((prev) => {
      let next = [...prev];
      for (const entity of unassigned) {
        const candidates = [...tables].sort((a, b) => {
          if (a.kind === "music" && b.kind !== "music") return 1;
          if (b.kind === "music" && a.kind !== "music") return -1;
          return (usedByTable.get(a.id) ?? 0) - (usedByTable.get(b.id) ?? 0);
        });

        const target = candidates.find((table) => {
          if (table.kind === "music") {
            const regularSpace = tables
              .filter((item) => item.kind !== "music")
              .some((item) => (next.filter((p) => p.table_id === item.id).length) < item.maxCapacity);
            if (regularSpace) return false;
          }
          const used = next.filter((person) => person.table_id === table.id).length;
          return used + entity.personIds.length <= table.maxCapacity;
        });

        if (!target) continue;
        const moving = new Set(entity.personIds);
        const base = next.map((person) => (moving.has(person.person_id) ? { ...person, table_id: "", seat_order: 0 } : person));
        const startOrder = nextSeatOrder(base, target.id);
        const orderByPersonId = new Map<string, number>();
        entity.personIds.forEach((personId, index) => {
          orderByPersonId.set(personId, startOrder + index);
        });
        next = base.map((person) => {
          if (!moving.has(person.person_id)) return person;
          return {
            ...person,
            table_id: target.id,
            seat_order: orderByPersonId.get(person.person_id) ?? startOrder,
          };
        });
      }

      return next;
    });
  };

  const save = () => {
    startTransition(async () => {
      try {
        await saveSeatingAction(JSON.stringify({ people, tableNames }));
        setDirty(false);
        setMessage("Raspored je sačuvan.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Greška pri čuvanju rasporeda.");
      }
    });
  };

  const exportHallPdf = () => {
    const printWindow = window.open("", "_blank", "width=1400,height=900");
    if (!printWindow) {
      window.alert("Browser je blokirao otvaranje PDF prozora.");
      return;
    }

    const tableMarkup = tables
      .map((table) => {
        const used = usedByTable.get(table.id) ?? 0;
        const diameter = table.kind === "head" ? 22 : table.kind === "music" ? 24 : table.kind === "inner" ? 26 : 29;

        return `
          <div class="table table-${table.kind}" style="left:${table.x}%;top:${table.y}%;width:${diameter}mm;height:${diameter}mm;">
            <div class="table-number">${escapeHtml(table.label)}</div>
            <div class="guest-count">${used}/${table.maxCapacity}</div>
          </div>
        `;
      })
      .join("");

    const notesMarkup = tables
      .flatMap((table) => {
        const notes = notesByTable.get(table.id) ?? [];
        if (notes.length === 0) return [];

        return [
          `<section class="note-group">
            <h2>Sto ${escapeHtml(table.label)}</h2>
            <ul>
              ${notes.map((item) => `<li><strong>${escapeHtml(item.guestName)}:</strong> ${escapeHtml(item.note)}</li>`).join("")}
            </ul>
          </section>`,
        ];
      })
      .join("");

    const tableGuestListMarkup = (["mlada", "mladozenja", "zajednicki"] as Side[])
      .map((side) => {
        const tableSections = tables
          .flatMap((table) => {
            const tableRows = (tablePeople.get(table.id) ?? []).filter((person) => person.side === side);
            if (tableRows.length === 0) return [];

            const tableTitle = tableNames[table.id]?.trim()
              ? `Sto ${escapeHtml(table.label)} - ${escapeHtml(tableNames[table.id])}`
              : `Sto ${escapeHtml(table.label)}`;

            return [
              `<article class="guest-table-card">
                <h2>${tableTitle}</h2>
                <ol>
                  ${tableRows
                    .map((person) => {
                      const partyOwner = person.is_primary ? "" : ` <span>(${escapeHtml(primaryNameByParty.get(person.party_id) ?? "dodatni gost")})</span>`;
                      const group = person.group ? ` <em>${escapeHtml(person.group)}</em>` : "";
                      return `<li>${escapeHtml(person.person_name)}${partyOwner}${group}</li>`;
                    })
                    .join("")}
                </ol>
              </article>`,
            ];
          })
          .join("");

        if (!tableSections) return "";

        return `
          <section class="side-section">
            <h1>${escapeHtml(sideLabel[side])}</h1>
            <div class="guest-table-grid">
              ${tableSections}
            </div>
          </section>
        `;
      })
      .join("");

    const columnMarkup = columns
      .map((column) => `<div class="column" style="left:${column.x}%;top:${column.y}%;"></div>`)
      .join("");

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Raspored stolova</title>
          <style>
            @page { size: A3 landscape; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #fff;
              color: #2f2415;
              font-family: Arial, Helvetica, sans-serif;
            }
            .hall {
              position: relative;
              width: 404mm;
              height: 281mm;
              border: 1.2mm solid #caa96a;
              background: #fffdf8;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .table {
              position: absolute;
              transform: translate(-50%, -50%);
              border-radius: 999px;
              border: 0.7mm solid #8c672f;
              background: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .table-head {
              border-width: 0.9mm;
              background: #fff4df;
            }
            .table-music {
              border-style: dashed;
              background: #fbf5ec;
            }
            .table-number {
              font-size: 14pt;
              font-weight: 700;
              line-height: 1;
            }
            .guest-count {
              margin-top: 1.5mm;
              font-size: 9pt;
              font-weight: 700;
              line-height: 1;
            }
            .notes-panel {
              position: absolute;
              left: 31%;
              top: 24%;
              width: 18%;
              max-height: 52%;
              overflow: hidden;
              border: 0.35mm solid #d5bd8c;
              background: rgba(255, 255, 255, 0.96);
              padding: 2.2mm 2.4mm;
              font-size: 6.6pt;
              line-height: 1.22;
            }
            .notes-panel h1 {
              margin: 0 0 1.8mm;
              font-size: 7.5pt;
              font-weight: 700;
              text-transform: uppercase;
            }
            .note-group {
              margin: 0 0 2mm;
            }
            .note-group h2 {
              margin: 0 0 0.8mm;
              font-size: 6.8pt;
              font-weight: 700;
            }
            .note-group ul {
              margin: 0;
              padding-left: 3.2mm;
            }
            .note-group li {
              margin: 0 0 0.8mm;
            }
            .column {
              position: absolute;
              width: 8mm;
              height: 8mm;
              transform: translate(-50%, -50%);
              border: 0.7mm solid #c18d36;
              background: #f8dfaf;
            }
            .guest-list-page {
              page-break-before: always;
              padding: 5mm;
              padding-bottom: 0;
              color: #2f2415;
              break-after: avoid;
              page-break-after: avoid;
            }
            .guest-list-header {
              margin-bottom: 4mm;
              border-bottom: 0.35mm solid #d6bd8d;
              padding-bottom: 2.5mm;
            }
            .guest-list-header h1 {
              margin: 0;
              font-size: 18pt;
              line-height: 1.1;
            }
            .guest-list-header p {
              margin: 1.5mm 0 0;
              color: #6b5636;
              font-size: 8.5pt;
            }
            .side-section {
              margin-bottom: 5mm;
            }
            .side-section:last-child {
              margin-bottom: 0;
              break-after: avoid;
              page-break-after: avoid;
            }
            .side-section > h1 {
              break-after: avoid;
              margin: 0 0 2.5mm;
              border-left: 1.2mm solid #b89458;
              padding-left: 3mm;
              color: #4d3718;
              font-size: 14pt;
              line-height: 1.2;
            }
            .guest-table-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 3mm;
            }
            .guest-table-card {
              break-inside: avoid;
              break-after: avoid;
              border: 0.28mm solid #e0c99d;
              background: #fffdf8;
              padding: 3mm;
            }
            .guest-table-card h2 {
              margin: 0;
              color: #4d3718;
              font-size: 12pt;
              line-height: 1.2;
            }
            .guest-table-card ol {
              margin: 2mm 0 0;
              padding-left: 5mm;
              font-size: 9pt;
              line-height: 1.32;
            }
            .guest-table-card li {
              margin: 0 0 0.9mm;
            }
            .guest-table-card span,
            .guest-table-card em {
              color: #765f3d;
              font-size: 7.5pt;
              font-style: normal;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body > *:last-child {
                break-after: avoid;
                page-break-after: avoid;
              }
            }
          </style>
        </head>
        <body>
          <main class="hall">
            ${columnMarkup}
            ${tableMarkup}
            ${notesMarkup ? `<aside class="notes-panel"><h1>Napomene</h1>${notesMarkup}</aside>` : ""}
          </main>
          ${tableGuestListMarkup ? `
            <section class="guest-list-page">
              <header class="guest-list-header">
                <h1>Raspored gostiju po stolovima</h1>
                <p>Prvo su prikazani stolovi sa mladine strane, zatim stolovi sa mladoženjine strane.</p>
              </header>
              ${tableGuestListMarkup}
            </section>
          ` : ""}
          <script>
            window.addEventListener("load", () => {
              window.print();
            });
          </script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  return (
    <section className="space-y-4">
      <article className="admin-card">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))))} className="rounded-full border border-[#c8a86e] px-3 py-1 text-sm text-[#6f5126] hover:bg-[#fff4e2]">-</button>
          <span className="text-sm text-neutral-600">Zoom {(zoom * 100).toFixed(0)}%</span>
          <button onClick={() => setZoom((prev) => Math.min(1.8, Number((prev + 0.1).toFixed(2))))} className="rounded-full border border-[#c8a86e] px-3 py-1 text-sm text-[#6f5126] hover:bg-[#fff4e2]">+</button>
          <button onClick={autoAssign} className="ml-2 rounded-full border border-[#c8a86e] px-3 py-1 text-sm text-[#6f5126] hover:bg-[#fff4e2]">Auto popuni</button>
          <button onClick={exportHallPdf} className="rounded-full border border-[#c8a86e] px-3 py-1 text-sm text-[#6f5126] hover:bg-[#fff4e2]">Export PDF</button>
          <button onClick={save} disabled={isPending || !dirty} className="ml-auto rounded-full bg-[#a68149] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#8f6936]">Sačuvaj raspored</button>
        </div>
        {message ? <p className="mt-2 text-sm text-[#6e552b]">{message}</p> : null}
      </article>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="admin-card space-y-3">
          <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#463316]">Lista gostiju</h2>
          <div className="grid gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pretraga imena / grupe" className="rounded-xl border border-[#d7c4a4] px-3 py-2 text-sm" />
            <select value={sideFilter} onChange={(event) => setSideFilter(event.target.value as Side | "")} className="rounded-xl border border-[#d7c4a4] px-3 py-2 text-sm">
              <option value="">Sve strane</option>
              <option value="mlada">Mlada</option>
              <option value="mladozenja">Mladoženja</option>
              <option value="zajednicki">Zajednički</option>
            </select>
            <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} className="rounded-xl border border-[#d7c4a4] px-3 py-2 text-sm">
              <option value="">Sve grupe</option>
              {groupOptions.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input checked={showAll} onChange={(event) => setShowAll(event.target.checked)} type="checkbox" />
              Prikaži i već raspoređene
            </label>
          </div>

          <div className="max-h-[56vh] space-y-2 overflow-auto pr-1">
            {filteredEntities.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#d8c6a8] p-3 text-sm text-neutral-600">Nema gostiju za izabrane filtere.</p>
            ) : (
              filteredEntities.map((entity) => {
                const membersCount = entity.personIds.length;
                const isSelected = selectedEntityId === entity.id;
                const partyMembers = people.filter((person) => person.party_id === entity.partyId);
                const canSplit = partyMembers.some((person) => !person.is_primary);
                const allDetached = partyMembers.filter((person) => !person.is_primary).every((person) => person.is_detached);

                return (
                  <article key={entity.id} className={clsx("rounded-xl border p-3", isSelected ? "border-[#a68149] bg-[#fff5e7]" : "border-[#e9dbc2] bg-white")}>
                    <button onClick={() => setSelectedEntityId(entity.id)} className="w-full text-left">
                      <p className="font-medium text-[#4c3617]">{entity.displayName}</p>
                      {entity.personNames.length > 1 ? (
                        <p className="mt-1 text-xs text-neutral-600">
                          Dodatni: {entity.personNames.slice(1).join(", ")}
                        </p>
                      ) : null}
                      <p className="text-xs text-neutral-600">{entity.group || "Bez grupe"} · {sideLabel[entity.side]} · {membersCount} osoba</p>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {canSplit && !allDetached ? (
                        <button onClick={() => splitParty(entity.partyId)} className="rounded-full border border-[#cfb180] px-3 py-1 text-xs text-[#6c5026] hover:bg-[#fff4e2]">Raspari</button>
                      ) : null}
                      {canSplit && allDetached ? (
                        <button onClick={() => mergeParty(entity.partyId)} className="rounded-full border border-[#cfb180] px-3 py-1 text-xs text-[#6c5026] hover:bg-[#fff4e2]">Spoji</button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>

        <section className="space-y-4">
          <article className="admin-card overflow-auto">
            <div className="min-h-[860px] min-w-[980px] rounded-2xl border border-[#eadbc3] bg-[#fffdf9] p-4">
              <div className="relative h-[920px] w-[980px] origin-top-left transition-transform" style={{ transform: `scale(${zoom})` }}>
                <div className="absolute inset-0 border-2 border-[#d9bf8f] bg-[radial-gradient(circle_at_20%_20%,rgba(250,240,220,0.55),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(240,230,210,0.45),transparent_40%),linear-gradient(180deg,#fffdf9_0%,#fdf4e7_100%)]" />
                <div className="absolute bottom-[4%] left-[35%] z-20 -translate-x-1/2 rounded-xl border border-[#b7925d] bg-[#f2dfc0] px-8 py-3 text-center text-sm font-semibold text-[#6f5126]">BINA</div>
                <div className="absolute bottom-[1.5%] right-[2.5%] z-20 flex items-center gap-1">
                  <span className="rounded-md border border-[#b7925d] bg-[#fff0d8] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#6f5126]">ULAZ</span>
                  <span className="rounded-md border border-[#b7925d] bg-white px-2 py-1 text-xs font-semibold text-[#6f5126]">&uarr;</span>
                </div>

                {columns.map((column) => (
                  <div
                    key={column.id}
                    aria-label="Stub"
                    className="absolute z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-[#c18d36] bg-[#f8dfaf] shadow-sm"
                    style={{ left: `${column.x}%`, top: `${column.y}%` }}
                  />
                ))}

                {tables.map((table) => {
                  const used = usedByTable.get(table.id) ?? 0;
                  const groupName = mostFrequent((tablePeople.get(table.id) ?? []).map((person) => person.group).filter(Boolean));
                  const tableName = tableNames[table.id] ?? "";
                  const active = focusedTableId === table.id;
                  const diameter = tableDiameter(table.kind);
                  return (
                    <button
                      key={table.id}
                      onClick={() => {
                        if (selectedEntity) {
                          assignEntityToTable(selectedEntity.id, table.id);
                        } else {
                          setFocusedTableId(table.id);
                        }
                      }}
                      className={clsx("absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center shadow-sm transition", tableCircleClass(table.kind), active ? "ring-2 ring-[#a68149]" : "hover:ring-2 hover:ring-[#ccb386]")}
                      style={{
                        left: `${table.x}%`,
                        top: `${table.y}%`,
                        width: diameter,
                        height: diameter,
                      }}
                    >
                      <span className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-[#4f3818]">{table.label}</span>
                        <span className={clsx("rounded-full border px-2 py-0.5 text-[11px]", tableLoadColor(used, table.optimalCapacity, table.maxCapacity))}>{used}/{table.maxCapacity}</span>
                        {tableName ? <span className="mt-1 max-w-[86px] truncate text-[10px] font-medium text-[#4f3818]">{tableName}</span> : null}
                        {!tableName && groupName ? <span className="mt-1 max-w-[86px] truncate text-[10px] text-[#6b5028]">{groupName}</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="admin-card">
            <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#463316]">Detalji stola {focusedTable?.label || "-"}</h3>
            {!focusedTableId ? (
              <p className="mt-2 text-sm text-neutral-600">Klikni na sto da vidiš ko sedi i da premestiš goste.</p>
            ) : (
              <div className="mt-3 space-y-2">
                <label className="block rounded-lg border border-[#eedfc7] bg-[#fffaf1] p-2 text-sm text-[#4c3617]">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#7a5b2c]">Ime stola</span>
                  <input
                    value={tableNames[focusedTableId] ?? ""}
                    onChange={(event) => updateTableName(focusedTableId, event.target.value)}
                    placeholder="Npr. Familija, Kumovi..."
                    maxLength={80}
                    className="w-full rounded-lg border border-[#d7c4a4] bg-white px-3 py-2 text-sm text-[#4c3617]"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#eedfc7] bg-[#fffaf1] p-2">
                  <select
                    value={swapTargetTableId}
                    onChange={(event) => setSwapTargetTableId(event.target.value)}
                    className="min-w-[180px] rounded-lg border border-[#d7c4a4] bg-white px-3 py-2 text-sm text-[#4c3617]"
                  >
                    <option value="">Zameni sa stolom...</option>
                    {tables
                      .filter((table) => table.id !== focusedTableId)
                      .map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.label} ({tablePeople.get(table.id)?.length ?? 0}/{table.maxCapacity})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={swapTables}
                    disabled={!swapTargetTable}
                    className="rounded-full border border-[#c8a86e] px-3 py-2 text-xs font-semibold text-[#6f5126] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#fff4e2]"
                  >
                    Swap
                  </button>
                </div>
                {selectedTablePeople.length === 0 ? (
                  <p className="text-sm text-neutral-600">Sto je prazan.</p>
                ) : (
                  selectedTablePeople.map((person) => {
                    const entityId = personToEntity.get(person.person_id) ?? "";
                    const entity = entitiesById.get(entityId);
                    return (
                      <div key={person.person_id} className="flex items-center justify-between rounded-lg border border-[#eedfc7] px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-[#4c3617]">{person.person_name}</p>
                          <p className="text-xs text-neutral-600">
                            {person.group || "Bez grupe"} ·{" "}
                            {person.is_primary ? "Nosilac" : `Dodatni gost - Nosilac ${primaryNameByParty.get(person.party_id) ?? "-"}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => entityId && setSelectedEntityId(entityId)} className="rounded-full border border-[#c8a86e] px-3 py-1 text-xs text-[#6f5126] hover:bg-[#fff4e2]">Premesti</button>
                          <button onClick={() => entity && unassignEntity(entity.id)} className="rounded-full border border-[#c8a86e] px-3 py-1 text-xs text-[#6f5126] hover:bg-[#fff4e2]">Vrati na listu</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </article>
        </section>
      </div>
    </section>
  );
}
