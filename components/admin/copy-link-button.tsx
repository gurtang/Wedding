"use client";

import { useState } from "react";

export function CopyLinkButton({ token, guestName }: { token: string; guestName?: string }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function copyText(text: string) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!success) {
      throw new Error("Copy command failed");
    }
  }

  async function onCopy() {
    const url = `${window.location.origin}/rsvp/${token}?share=1`;
    const guestLine = `Za: ${guestName?.trim() || "-"}`;
    const message = `${url}\n\n${guestLine}`;

    try {
      await copyText(message);
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={onCopy} className="rounded-full border border-[#b4945a] px-3 py-1 text-xs font-semibold text-[#7a5c2c] transition hover:bg-[#fff2de]">
        Kopiraj poruku
      </button>
      {status === "ok" ? <span className="text-[11px] text-green-700">Kopirano</span> : null}
      {status === "error" ? <span className="text-[11px] text-red-700">Kopiranje nije uspelo</span> : null}
    </div>
  );
}
