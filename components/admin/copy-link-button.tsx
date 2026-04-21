"use client";

export function CopyLinkButton({ token }: { token: string }) {
  async function onCopy() {
    const url = `${window.location.origin}/rsvp/${token}`;
    await navigator.clipboard.writeText(url);
  }

  return (
    <button type="button" onClick={onCopy} className="rounded-full border border-[#b4945a] px-3 py-1 text-xs font-semibold text-[#7a5c2c] transition hover:bg-[#fff2de]">
      Kopiraj link
    </button>
  );
}


