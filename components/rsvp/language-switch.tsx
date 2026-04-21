"use client";

import type { Language } from "@/lib/types";

export function LanguageSwitch({ value, onChange }: { value: Language; onChange: (lang: Language) => void }) {
  return (
    <div className="inline-flex rounded-full border border-[#d9c4a1] bg-white/80 p-1 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={() => onChange("sr")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === "sr" ? "bg-[#b5945f] text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
      >
        SR
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${value === "en" ? "bg-[#b5945f] text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
      >
        EN
      </button>
    </div>
  );
}


