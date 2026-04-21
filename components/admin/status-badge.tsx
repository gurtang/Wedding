import { cn } from "@/lib/utils";

const statusClass: Record<string, string> = {
  nije_poslata: "bg-slate-100 text-slate-700 border border-slate-200",
  poslata: "bg-amber-100 text-amber-700 border border-amber-200",
  otvorena: "bg-sky-100 text-sky-700 border border-sky-200",
  nije_odgovorio: "bg-slate-100 text-slate-700 border border-slate-200",
  dolazi: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  ne_dolazi: "bg-rose-100 text-rose-700 border border-rose-200",
};

const statusLabel: Record<string, string> = {
  nije_poslata: "Nije poslata",
  poslata: "Poslata",
  otvorena: "Otvorena",
  nije_odgovorio: "Nije odgovorio",
  dolazi: "Dolazi",
  ne_dolazi: "Ne dolazi",
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={cn("badge", statusClass[value] ?? "bg-slate-100 text-slate-700 border border-slate-200")}>{statusLabel[value] ?? value}</span>;
}


