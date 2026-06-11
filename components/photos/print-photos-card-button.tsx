"use client";

export function PrintPhotosCardButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-8 rounded-full bg-[#a68149] px-7 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#8f6936] print:hidden"
    >
      Export PDF
    </button>
  );
}
