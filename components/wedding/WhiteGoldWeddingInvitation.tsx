'use client'

import type { WeddingInvitationProps } from './WeddingInvitation'
import RsvpSection from './RsvpSection'
import CountdownTimer from './CountdownTimer'
import AgendaSection from './AgendaSection'
import { guestPhotosUrl } from '@/lib/photos'

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
}

function splitNames(value: string) {
  return value.split(/\s+(?:i|&)\s+/i).map((name) => name.trim()).filter(Boolean)
}

function parseAgenda(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const match = line.match(/^(\d{1,2}:\d{2})\s*[-–:]?\s*(.*)$/)
    return { time: match?.[1] || '', name: match?.[2] || line, desc: '' }
  })
}

function GoldGeometry({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 360"
      className={`pointer-events-none absolute h-80 w-40 text-[#b89a4a] opacity-55 ${side === 'left' ? '-left-20 top-10' : '-right-20 bottom-24 rotate-180'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <ellipse cx="90" cy="180" rx="78" ry="170" />
      <path d="M13 180 90 10l77 170-77 170L13 180Zm0 0h154M90 10v340M28 90l124 180M152 90 28 270" />
    </svg>
  )
}

function DovesAndRings() {
  return (
    <svg viewBox="0 0 360 170" className="mx-auto w-64 sm:w-80" aria-label="Dva bela goluba i burme">
      <defs>
        <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f7e8ae" />
          <stop offset=".45" stopColor="#a9852f" />
          <stop offset=".72" stopColor="#fff3bf" />
          <stop offset="1" stopColor="#8e6f25" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".18" />
        </filter>
      </defs>
      <g fill="#fff" stroke="#d7d7d3" strokeWidth="2" filter="url(#softShadow)">
        <path d="M166 61c-18-21-43-31-77-27 16 9 28 19 37 31-29-13-55-11-78-1 28 4 48 13 65 29-21-7-42-4-59 8 37 3 66 14 89 35 16-12 23-29 23-50 0-11 0-18 0-25Z" />
        <path d="M194 61c18-21 43-31 77-27-16 9-28 19-37 31 29-13 55-11 78-1-28 4-48 13-65 29 21-7 42-4 59 8-37 3-66 14-89 35-16-12-23-29-23-50 0-11 0-18 0-25Z" />
        <path d="M166 61c-3-22-20-37-42-36 10 7 16 17 18 30-10-5-19-4-28 2 18 4 31 14 40 29" />
        <path d="M194 61c3-22 20-37 42-36-10 7-16 17-18 30 10-5 19-4 28 2-18 4-31 14-40 29" />
      </g>
      <circle cx="159" cy="64" r="2.6" fill="#343434" /><circle cx="201" cy="64" r="2.6" fill="#343434" />
      <path d="m171 69 9 4-10 4m19-8-9 4 10 4" fill="#caa43f" stroke="#a88631" />
      <g fill="none" stroke="url(#ringGold)" strokeWidth="10" filter="url(#softShadow)">
        <ellipse cx="164" cy="125" rx="42" ry="25" transform="rotate(-18 164 125)" />
        <ellipse cx="200" cy="124" rx="42" ry="25" transform="rotate(18 200 124)" />
      </g>
    </svg>
  )
}

function CoupleIllustration() {
  return (
    <svg viewBox="0 0 430 330" className="mx-auto w-full max-w-md" aria-label="Ilustracija mladenaca među zelenilom">
      <defs>
        <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" /><stop offset="1" stopColor="#e8e2d4" /></linearGradient>
        <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7d8975" /><stop offset="1" stopColor="#4f5c4e" /></linearGradient>
      </defs>
      <g stroke="#78856c" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M56 302C86 237 75 161 127 83M374 302c-30-65-19-141-71-219M93 260c45-42 48-91 55-132M337 260c-45-42-48-91-55-132" />
      </g>
      <g fill="#9ba58d">
        <ellipse cx="78" cy="242" rx="16" ry="35" transform="rotate(-43 78 242)" /><ellipse cx="104" cy="194" rx="15" ry="32" transform="rotate(34 104 194)" />
        <ellipse cx="352" cy="242" rx="16" ry="35" transform="rotate(43 352 242)" /><ellipse cx="326" cy="194" rx="15" ry="32" transform="rotate(-34 326 194)" />
        <ellipse cx="131" cy="143" rx="12" ry="27" transform="rotate(-35 131 143)" /><ellipse cx="299" cy="143" rx="12" ry="27" transform="rotate(35 299 143)" />
      </g>
      <g fill="#f8f5e8" stroke="#d1c7a6">
        {[65, 111, 315, 361].map((x, index) => <circle key={x} cx={x} cy={270 - (index % 2) * 28} r="14" />)}
      </g>
      <g stroke="#3d342c" strokeWidth="2">
        <circle cx="193" cy="86" r="23" fill="#bf956f" /><path d="M172 83c3-28 39-35 46-3-16-7-29-7-46 3Z" fill="#4b382c" />
        <path d="M163 118c-11 48-10 113-2 176h74c-1-73-5-129-19-176Z" fill="url(#suit)" />
        <path d="m189 119 7 31 10-31M196 150v104" fill="none" stroke="#dce0d8" />
        <circle cx="239" cy="90" r="22" fill="#c49a77" /><path d="M218 90c-1-24 32-38 43-11 6 15 1 29-4 35-1-19-12-31-39-24Z" fill="#4a3428" />
        <path d="M222 121c-18 50-30 110-42 177h111c-15-74-27-132-42-177Z" fill="url(#dress)" />
        <path d="M222 121c7 24 20 25 27 0M236 147v145" fill="none" stroke="#c9bea6" />
        <path d="M213 139c-6 31-4 68 5 99M252 137c10 28 13 62 8 91" fill="none" stroke="#b98f6e" strokeWidth="8" strokeLinecap="round" />
      </g>
      <path d="M203 201c17-14 32-14 50 0-6 21-42 22-50 0Z" fill="#f6f2df" stroke="#9aa689" />
      <g fill="#fff" stroke="#c4b991">{[209, 222, 236, 248].map((x) => <circle key={x} cx={x} cy="199" r="7" />)}</g>
    </svg>
  )
}

const whiteGoldTheme = {
  '--rose': '#b49a54',
  '--rose-lt': '#ded3b4',
  '--rose-dk': '#8b7335',
  '--gold': '#a88732',
  '--gold-lt': '#ddcf9f',
  '--cream': '#faf8f1',
  '--cream2': '#f2eee3',
  '--ink': '#171717',
  '--ink-lt': '#625d50',
} as React.CSSProperties

export default function WhiteGoldWeddingInvitation({
  settings,
  guestId,
  guestName,
  maxAdditionalGuests = 0,
  showDeadlineCard = true,
  rsvpDeadlineLabel = '',
  initialRsvpStatus = 'nije_odgovorio',
  initialAdditionalGuestNames = [],
  initialNote = '',
  initialDeclineReason = '',
  tableLabels = [],
}: WeddingInvitationProps) {
  const names = splitNames(settings.couple_names_sr)
  const displayNames = names.length >= 2 ? `${names[1]} & ${names[0]}` : settings.couple_names_sr
  const eventDateTime = `${settings.event_date}T${settings.guest_arrival_time || '00:00'}:00`
  const agenda = parseAgenda(settings.agenda_sr)

  const handleRsvp = async (data: {
    guestId: string
    attending: boolean
    additionalGuestNames: string[]
    note: string
    declineReason: string
  }) => {
    const response = await fetch(`/api/rsvp/${data.guestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rsvp_status: data.attending ? 'dolazi' : 'ne_dolazi',
        additional_guest_names: data.additionalGuestNames,
        note: data.note,
        decline_reason: data.declineReason,
      }),
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { error?: string }
      throw new Error(payload.error || 'Greška pri slanju. Pokušajte ponovo.')
    }
  }

  return (
    <main style={whiteGoldTheme} className="min-h-screen bg-[#eceae4] px-3 py-5 text-[#151515] sm:px-6 sm:py-10">
      <article className="relative mx-auto max-w-[760px] overflow-hidden border border-[#b79a4a] bg-[#fffefb] px-6 py-14 shadow-[0_24px_80px_rgba(63,53,30,0.18)] sm:px-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[url('/images/wedding-hero-v2.png')] bg-contain bg-top bg-no-repeat opacity-90" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[480px] rotate-180 bg-[url('/images/wedding-hero-v2.png')] bg-contain bg-top bg-no-repeat opacity-90" />
        <div className="pointer-events-none absolute inset-2 border border-[#d9c88d]" />
        <GoldGeometry side="left" />
        <GoldGeometry side="right" />

        <section className="relative z-10 text-center">
          <DovesAndRings />

          <p className="font-montserrat text-sm font-semibold tracking-[0.08em] sm:text-base">{formatDate(settings.event_date)}</p>
          <h1 className="mt-10 font-great-vibes text-[54px] leading-[1.08] text-black sm:text-[88px]">{displayNames}</h1>
          <p className="mx-auto mt-7 max-w-xl whitespace-pre-line font-cormorant text-xl leading-relaxed sm:text-2xl">
            {settings.intro_text_sr}
          </p>
          {guestName ? <p className="mt-5 font-cormorant text-xl italic text-[#68604e]">Dragi {guestName}, radujemo se Vašem dolasku.</p> : null}

          <div className="mx-auto my-12 h-px w-32 bg-gradient-to-r from-transparent via-[#b89a4a] to-transparent" />

          {settings.show_event_details ? (
            <div>
              <p className="font-montserrat text-3xl font-bold">{settings.guest_arrival_time}</p>
              <p className="mt-4 font-cormorant text-2xl font-medium">Svečana sala „{settings.venue_name}”</p>
              <p className="font-cormorant text-xl text-[#504c44]">{settings.venue_address}</p>
              {settings.show_location ? (
                <a href={settings.map_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex border border-[#b89a4a] px-6 py-3 font-montserrat text-[10px] uppercase tracking-[0.22em] transition hover:bg-[#b89a4a] hover:text-white">
                  Otvori mapu
                </a>
              ) : null}
            </div>
          ) : null}

          {settings.show_table && tableLabels.length > 0 ? (
            <div className="mx-auto mt-10 max-w-xs border-y border-[#d9c88d] py-5">
              <p className="font-montserrat text-[10px] uppercase tracking-[0.25em] text-[#776a48]">Vaš broj stola</p>
              <p className="mt-2 font-great-vibes text-5xl">{tableLabels.join(', ')}</p>
            </div>
          ) : null}

          {settings.show_rsvp && showDeadlineCard ? (
            <p className="mt-14 font-cormorant text-xl sm:text-2xl">Molimo Vas da potvrdite dolazak do <strong>{rsvpDeadlineLabel}</strong>.</p>
          ) : null}

          <div className="mx-auto mt-14 max-w-md"><CoupleIllustration /></div>
          <p className="font-great-vibes text-5xl sm:text-6xl">Radujemo se Vašem dolasku</p>
        </section>
      </article>

      <div className="mx-auto mt-6 max-w-[760px] overflow-hidden border border-[#b79a4a] bg-[#fffefb] shadow-[0_18px_60px_rgba(63,53,30,0.12)]">
        {settings.show_agenda && agenda.length > 0 ? <AgendaSection items={agenda} compact /> : null}
        {settings.show_countdown ? <CountdownTimer targetDate={eventDateTime} variant="light" /> : null}

        {settings.show_photos ? (
          <section className="border-t border-[#ded3b4] bg-white px-6 py-11 text-center sm:py-12">
            <p className="font-montserrat text-[10px] uppercase tracking-[0.3em] text-[#a88732]">Uspomene</p>
            <h2 className="mt-2 font-great-vibes text-4xl text-[#8b7335] sm:text-5xl">Podelite fotografije</h2>
            <p className="mx-auto mt-3 max-w-lg font-cormorant text-lg text-[#625d50]">Sačuvajmo zajedno najlepše trenutke sa venčanja.</p>
            <a href={guestPhotosUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex border border-[#a88732] px-6 py-2.5 font-montserrat text-[10px] uppercase tracking-[0.22em] transition hover:bg-[#a88732] hover:text-white">Otvori album</a>
          </section>
        ) : null}

        {settings.show_location ? (
          <section className="border-t border-[#ded3b4] bg-[#faf8f1] px-6 py-11 text-center sm:py-12">
            <p className="font-montserrat text-[10px] uppercase tracking-[0.3em] text-[#a88732]">Kako do nas</p>
            <h2 className="mt-2 font-great-vibes text-4xl text-[#8b7335] sm:text-5xl">Lokacija</h2>
            <p className="mt-3 font-cormorant text-xl">{settings.venue_name}</p>
            <p className="mt-1 text-sm text-[#625d50]">{settings.venue_address}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <a href={settings.map_url} target="_blank" rel="noopener noreferrer" className="border border-[#a88732] px-5 py-2.5 font-montserrat text-[10px] uppercase tracking-[0.2em] transition hover:bg-[#a88732] hover:text-white">Otvori mapu</a>
              <a href={`/api/calendar/${guestId}`} target="_blank" rel="noopener noreferrer" className="border border-[#a88732] px-5 py-2.5 font-montserrat text-[10px] uppercase tracking-[0.2em] transition hover:bg-[#a88732] hover:text-white">Dodaj u kalendar</a>
            </div>
          </section>
        ) : null}

        {settings.show_rsvp ? (
          <RsvpSection
            compact
            guestId={guestId}
            deadline={rsvpDeadlineLabel}
            onSubmit={handleRsvp}
            maxAdditionalGuests={maxAdditionalGuests}
            initialRsvpStatus={initialRsvpStatus}
            initialAdditionalGuestNames={initialAdditionalGuestNames}
            initialNote={initialNote}
            initialDeclineReason={initialDeclineReason}
          />
        ) : null}
      </div>
    </main>
  )
}
