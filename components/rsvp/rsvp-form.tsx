"use client";

import { useMemo, useState } from "react";
import { t } from "@/lib/translations";
import type { Guest, Language, Settings } from "@/lib/types";
import { LanguageSwitch } from "./language-switch";
import { Countdown } from "./countdown";

type Props = {
  guest: Guest;
  settings: Settings;
  initialLanguage: Language;
  isLocked: boolean;
};

function formatDateSr(value: string, language: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (language === "en") {
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
}

function normalizeSerbianText(value: string): string {
  return value
    .replace(/\bradoscu\b/gi, "radošću")
    .replace(/\buvelicate\b/gi, "uveličate")
    .replace(/\bvencanje\b/gi, "venčanje")
    .replace(/\bvencanja\b/gi, "venčanja");
}

export function RsvpForm({ guest, settings, initialLanguage, isLocked }: Props) {
  const initialStatus = guest.rsvp_status === "nije_odgovorio" ? "" : guest.rsvp_status;
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [status, setStatus] = useState<"" | "dolazi" | "ne_dolazi">(initialStatus);
  const [additionalGuests, setAdditionalGuests] = useState<string[]>(guest.additional_guest_names);
  const [note, setNote] = useState(guest.note ?? "");
  const [declineReason, setDeclineReason] = useState(guest.decline_reason ?? "");
  const [message, setMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const maxAdditional = Math.max(0, guest.max_guests - 1);
  const canAddMore = additionalGuests.length < maxAdditional;

  const greeting = guest.custom_greeting || `${t(language, "invitationFor")}: ${guest.display_name}`;

  const agendaItems = useMemo(() => {
    const raw = language === "sr" ? settings.agenda_sr : settings.agenda_en;
    const normalized = language === "sr" ? normalizeSerbianText(raw) : raw;
    return normalized
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [language, settings.agenda_en, settings.agenda_sr]);

  const eventDateLabel = useMemo(() => formatDateSr(settings.event_date, language), [settings.event_date, language]);

  const detailsItems = [
    {
      title: eventDateLabel,
      text: t(language, "weddingDetails"),
    },
    {
      title: settings.venue_name,
      text:
        settings.venue_address.trim() && settings.venue_address.trim() !== settings.venue_name.trim()
          ? settings.venue_address
          : "",
    },
    {
      title: `${t(language, "arrival")} ${settings.guest_arrival_time}`,
      text: `${t(language, "ceremony")} ${settings.ceremony_time}`,
    },
  ];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLocked || status === "") return;

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/rsvp/${guest.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvp_status: status,
          additional_guest_names: status === "dolazi" ? additionalGuests.filter(Boolean) : [],
          note: status === "dolazi" ? note : "",
          decline_reason: status === "ne_dolazi" ? declineReason : "",
          language,
        }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error || t(language, "saveError"));
      }

      setMessage(t(language, "saved"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t(language, "saveError"));
    } finally {
      setSaving(false);
    }
  }

  function scrollToForm() {
    const node = document.getElementById("rsvp-form-card");
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8 pb-24 md:space-y-12 md:pb-10">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-[#e7d7bb] bg-[#f8efe0] shadow-soft"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255,250,243,0.92), rgba(247,237,222,0.8)), url('/images/wedding-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/70" />
        <div className="relative wedding-container flex min-h-[450px] flex-col justify-between py-8 sm:min-h-[520px] sm:py-12">
          <div className="flex items-center justify-between">
            <div className="rounded-full border border-[#d7c19e] bg-white/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#745932] backdrop-blur">
              {language === "sr" ? "Pozivnica za svadbu" : "Wedding Invitation"}
            </div>
            <LanguageSwitch value={language} onChange={setLanguage} />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex h-24 w-24 items-center justify-center whitespace-nowrap rounded-full border border-[#caa978] bg-white/70 font-[family-name:var(--font-serif)] text-[2rem] leading-none text-[#6d5228] shadow-sm">
              S & M
            </div>

            <h1 className="font-[family-name:var(--font-serif)] text-4xl leading-tight text-[#4d3718] sm:text-6xl">
              {language === "sr" ? settings.couple_names_sr : settings.couple_names_en}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#5d4f39] sm:text-lg">
              {language === "sr" ? normalizeSerbianText(settings.intro_text_sr) : settings.intro_text_en}
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#81643a]">{eventDateLabel}</p>
            <p className="mt-2 text-sm text-[#69543a] sm:text-base">{settings.venue_name}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={scrollToForm} className="w-full sm:w-auto wedding-button-primary">
                {t(language, "confirmArrival")}
              </button>
              <a href={settings.map_url} target="_blank" rel="noreferrer" className="w-full sm:w-auto wedding-button-secondary">
                {t(language, "viewMap")}
              </a>
              <a
                href={`/api/calendar/${guest.token}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto wedding-button-secondary"
              >
                {t(language, "addToCalendar")}
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#6f5b3c]">{greeting}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {detailsItems.map((item) => (
          <article key={`${item.title}-${item.text}`} className="info-card transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#503d21]">{item.title}</h3>
            {item.text ? <p className="mt-2 text-sm text-[#6b5940]">{item.text}</p> : null}
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <article className="info-card space-y-4">
          <h2 className="section-title text-[1.75rem]">{t(language, "agenda")}</h2>
          <div className="wedding-divider !mx-0" />
          <ul className="space-y-3 text-sm text-[#5f4e38]">
            {agendaItems.map((item) => (
              <li key={item} className="rounded-xl border border-[#ead9bf] bg-white/70 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <a href={settings.map_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold text-[#7b5e31] hover:text-[#5d4522]">
            {t(language, "map")}
          </a>
        </article>

        <article className="info-card space-y-4">
          <Countdown deadline={settings.rsvp_deadline} language={language} />
        </article>
      </section>

      <section id="rsvp-form-card" className="info-card scroll-mt-8 space-y-5 border-[#d8c09b] bg-white/95 p-6 sm:p-7">
        <div>
          <h2 className="section-title text-[1.8rem]">{t(language, "rsvpCardTitle")}</h2>
          <p className="mt-2 text-sm text-[#6d5a3f]">{t(language, "chooseHint")}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {isLocked ? <p className="rounded-2xl border border-[#ead9ba] bg-[#fff9ef] p-4 text-sm text-[#7a5a2a]">{t(language, "deadlinePassed")}</p> : null}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#5a4524]">{t(language, "choose")}</p>
            <div className="space-y-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${status === "dolazi" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-[#dbc9a9] bg-white text-neutral-700"} ${isLocked ? "cursor-not-allowed opacity-60" : "hover:border-emerald-300"}`}>
                <input
                  type="radio"
                  name="rsvp_choice"
                  className="h-4 w-4 accent-emerald-600"
                  disabled={isLocked}
                  checked={status === "dolazi"}
                  onChange={() => setStatus("dolazi")}
                />
                {t(language, "attending")}
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${status === "ne_dolazi" ? "border-rose-500 bg-rose-50 text-rose-800" : "border-[#dbc9a9] bg-white text-neutral-700"} ${isLocked ? "cursor-not-allowed opacity-60" : "hover:border-rose-300"}`}>
                <input
                  type="radio"
                  name="rsvp_choice"
                  className="h-4 w-4 accent-rose-600"
                  disabled={isLocked}
                  checked={status === "ne_dolazi"}
                  onChange={() => setStatus("ne_dolazi")}
                />
                {t(language, "notAttending")}
              </label>
            </div>
          </div>

          {status === "dolazi" && maxAdditional > 0 ? (
            <div className="space-y-3 rounded-2xl border border-[#e8d7bb] bg-[#fffdfa] p-4">
              <p className="text-sm font-semibold text-[#5a4524]">
                {t(language, "additionalGuests")} ({additionalGuests.length}/{maxAdditional})
              </p>
              {additionalGuests.map((name, index) => (
                <input
                  key={`additional-guest-${index}`}
                  value={name}
                  disabled={isLocked}
                  onChange={(event) => {
                    const next = [...additionalGuests];
                    next[index] = event.target.value;
                    setAdditionalGuests(next);
                  }}
                  className="w-full rounded-xl border border-[#dac8a8] bg-white px-3 py-2 text-sm focus:border-[#b5945f] focus:outline-none focus:ring-2 focus:ring-[#ecd9b7]"
                  placeholder={`Ime i prezime #${index + 1}`}
                />
              ))}
              {canAddMore ? (
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setAdditionalGuests((prev) => [...prev, ""])}
                  className="wedding-button-secondary px-4 py-2 text-xs"
                >
                  + {t(language, "addGuest")}
                </button>
              ) : null}
            </div>
          ) : null}

          {status === "ne_dolazi" ? (
            <label className="block text-sm text-[#5a4524]">
              {t(language, "declineReason")}
              <textarea
                disabled={isLocked}
                value={declineReason}
                onChange={(event) => setDeclineReason(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dac8a8] bg-white px-3 py-2 focus:border-[#b5945f] focus:outline-none focus:ring-2 focus:ring-[#ecd9b7]"
                rows={3}
              />
            </label>
          ) : null}

          {status === "dolazi" ? (
            <label className="block text-sm text-[#5a4524]">
              {t(language, "note")}
              <textarea
                disabled={isLocked}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dac8a8] bg-white px-3 py-2 focus:border-[#b5945f] focus:outline-none focus:ring-2 focus:ring-[#ecd9b7]"
                rows={3}
              />
            </label>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-[#d8c19f] bg-[#fff8ec] p-3 text-sm text-[#6f552d]">{message}</p>
          ) : null}

          <button disabled={isLocked || saving || status === ""} className="w-full wedding-button-primary disabled:opacity-60">
            {saving ? t(language, "loading") : t(language, "save")}
          </button>
        </form>
      </section>

      <footer className="pb-4 text-center">
        <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d3bb95] bg-white/80 font-[family-name:var(--font-serif)] text-lg text-[#6d5228]">
          S&M
        </div>
        <p className="text-sm text-[#6f5d43]">{t(language, "footerNote")}</p>
      </footer>

      <button
        type="button"
        onClick={scrollToForm}
        className="fixed bottom-4 right-4 z-20 rounded-full bg-[#b5945f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg lg:hidden"
      >
        RSVP
      </button>
    </div>
  );
}
