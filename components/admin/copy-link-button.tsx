"use client";

export function CopyLinkButton({ token, guestName }: { token: string; guestName?: string }) {
  async function onCopy() {
    const url = `${window.location.origin}/rsvp/${token}?share=1`;
    const guestLine = guestName?.trim() ? `Za: ${guestName.trim()}` : "";
    const message = [url, guestLine].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(message);
  }

  return (
    <button type="button" onClick={onCopy} className="rounded-full border border-[#b4945a] px-3 py-1 text-xs font-semibold text-[#7a5c2c] transition hover:bg-[#fff2de]">
      Kopiraj poruku
    </button>
  );
}
