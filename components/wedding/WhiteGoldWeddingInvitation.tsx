'use client'

import type { WeddingInvitationProps } from './WeddingInvitation'
import RsvpSection from './RsvpSection'
import CountdownTimer from './CountdownTimer'
import AgendaSection from './AgendaSection'
import { guestPhotosUrl } from '@/lib/photos'

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date
    .toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/\.$/, '')
    .toUpperCase()
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

function ChampagneGlassesDivider() {
  const glass = (
    <svg viewBox="0 0 52 90" className="w-9 h-16" fill="none" stroke="#b89a4a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* sparkle top-left */}
      <line x1="6" y1="6" x2="6" y2="14" stroke="#c9a84c" strokeWidth="1" />
      <line x1="2" y1="10" x2="10" y2="10" stroke="#c9a84c" strokeWidth="1" />
      <line x1="3.5" y1="6.5" x2="8.5" y2="11.5" stroke="#c9a84c" strokeWidth="0.8" />
      <line x1="8.5" y1="6.5" x2="3.5" y2="11.5" stroke="#c9a84c" strokeWidth="0.8" />
      {/* sparkle top-right */}
      <line x1="45" y1="3" x2="45" y2="9" stroke="#c9a84c" strokeWidth="0.9" />
      <line x1="42" y1="6" x2="48" y2="6" stroke="#c9a84c" strokeWidth="0.9" />
      {/* flute bowl */}
      <path d="M16 18 Q14 38 26 48 Q38 38 36 18 Z" />
      {/* stem */}
      <line x1="26" y1="48" x2="26" y2="72" />
      {/* base */}
      <line x1="18" y1="72" x2="34" y2="72" />
      {/* bubbles */}
      <circle cx="26" cy="44" r="1.2" fill="#c9a84c" stroke="none" />
      <circle cx="23" cy="37" r="0.9" fill="#c9a84c" stroke="none" />
      <circle cx="28" cy="30" r="0.8" fill="#c9a84c" stroke="none" />
    </svg>
  )
  return (
    <div className="flex items-center justify-center gap-10 my-6">
      {glass}
      {glass}
    </div>
  )
}

function FloralDecoration({ corner }: { corner: 'top-left' | 'bottom-right' }) {
  return (
    <svg
      viewBox="0 0 300 260"
      className={`pointer-events-none absolute ${
        corner === 'top-left'
          ? 'left-0 top-0 w-52 sm:w-72'
          : 'bottom-0 right-0 w-52 sm:w-72 rotate-180'
      }`}
      aria-hidden="true"
    >
      {/* Main stems */}
      <path d="M20 260 Q60 210 90 160 Q120 110 162 58" stroke="#7a9460" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M50 260 Q100 220 140 175 Q170 140 202 98" stroke="#6a8450" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M5 200 Q40 175 72 145 Q97 120 132 83" stroke="#5a7840" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Eucalyptus sprig — left */}
      <path d="M30 130 Q25 100 28 74" stroke="#8aad70" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="28" cy="74" rx="9" ry="4.5" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(-15 28 74)" />
      <ellipse cx="29" cy="89" rx="9" ry="4.5" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(-10 29 89)" />
      <ellipse cx="29" cy="104" rx="9" ry="4.5" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(-5 29 104)" />
      <ellipse cx="30" cy="118" rx="9" ry="4.5" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(0 30 118)" />

      {/* Eucalyptus sprig — right */}
      <path d="M186 138 Q192 113 190 88" stroke="#8aad70" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="190" cy="88"  rx="8" ry="4" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(10 190 88)" />
      <ellipse cx="189" cy="102" rx="8" ry="4" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(5 189 102)" />
      <ellipse cx="189" cy="116" rx="8" ry="4" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(0 189 116)" />
      <ellipse cx="188" cy="129" rx="8" ry="4" fill="#9ab882" stroke="#7a9060" strokeWidth="0.4" transform="rotate(-5 188 129)" />

      {/* Large leaves */}
      <ellipse cx="80" cy="215" rx="26" ry="11" fill="#7a9960" stroke="#5a7940" strokeWidth="0.5" transform="rotate(-50 80 215)" />
      <line x1="67" y1="223" x2="93" y2="207" stroke="#4a6930" strokeWidth="0.8" />
      <ellipse cx="115" cy="180" rx="24" ry="10" fill="#6a9050" stroke="#4a7030" strokeWidth="0.5" transform="rotate(-65 115 180)" />
      <line x1="102" y1="187" x2="128" y2="173" stroke="#4a6930" strokeWidth="0.8" />
      <ellipse cx="155" cy="145" rx="22" ry="9.5" fill="#8aaa70" stroke="#5a8040" strokeWidth="0.5" transform="rotate(-70 155 145)" />
      <line x1="143" y1="151" x2="167" y2="139" stroke="#4a6930" strokeWidth="0.7" />
      <ellipse cx="60" cy="185" rx="20" ry="8.5" fill="#709060" stroke="#507040" strokeWidth="0.5" transform="rotate(-35 60 185)" />
      <line x1="50" y1="190" x2="70" y2="180" stroke="#4a6930" strokeWidth="0.7" />
      <ellipse cx="170" cy="110" rx="18" ry="8" fill="#7a9960" stroke="#5a7940" strokeWidth="0.5" transform="rotate(-55 170 110)" />
      <ellipse cx="105" cy="140" rx="19" ry="8" fill="#8aaa70" stroke="#5a8040" strokeWidth="0.5" transform="rotate(-45 105 140)" />

      {/* Rose 1 — large, main */}
      <g transform="translate(130,110)">
        <path d="M-5 15 Q-10 5 0 0 Q10 5 5 15 Z" fill="#6a9050" />
        <ellipse cx="0" cy="-26" rx="14" ry="19" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.6" transform="rotate(0)" />
        <ellipse cx="0" cy="-26" rx="14" ry="19" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.6" transform="rotate(72)" />
        <ellipse cx="0" cy="-26" rx="14" ry="19" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.6" transform="rotate(144)" />
        <ellipse cx="0" cy="-26" rx="14" ry="19" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.6" transform="rotate(216)" />
        <ellipse cx="0" cy="-26" rx="14" ry="19" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.6" transform="rotate(288)" />
        <ellipse cx="0" cy="-17" rx="10" ry="14" fill="#f0ede6" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(36)" />
        <ellipse cx="0" cy="-17" rx="10" ry="14" fill="#ede9e2" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(108)" />
        <ellipse cx="0" cy="-17" rx="10" ry="14" fill="#f0ede6" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(180)" />
        <ellipse cx="0" cy="-17" rx="10" ry="14" fill="#ede9e2" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(252)" />
        <ellipse cx="0" cy="-17" rx="10" ry="14" fill="#f0ede6" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(324)" />
        <ellipse cx="0" cy="-9" rx="7" ry="9" fill="#e8e4dc" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(20)" />
        <ellipse cx="0" cy="-9" rx="7" ry="9" fill="#e8e4dc" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(110)" />
        <ellipse cx="0" cy="-9" rx="7" ry="9" fill="#e8e4dc" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(200)" />
        <circle cx="0" cy="0" r="7" fill="#e2ded6" />
        <circle cx="0" cy="0" r="4" fill="#d8d4cc" />
      </g>

      {/* Rose 2 — medium, upper left */}
      <g transform="translate(60,128)">
        <path d="M-4 12 Q-8 4 0 0 Q8 4 4 12 Z" fill="#6a9050" />
        <ellipse cx="0" cy="-21" rx="12" ry="16" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.6" transform="rotate(0)" />
        <ellipse cx="0" cy="-21" rx="12" ry="16" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.6" transform="rotate(72)" />
        <ellipse cx="0" cy="-21" rx="12" ry="16" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.6" transform="rotate(144)" />
        <ellipse cx="0" cy="-21" rx="12" ry="16" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.6" transform="rotate(216)" />
        <ellipse cx="0" cy="-21" rx="12" ry="16" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.6" transform="rotate(288)" />
        <ellipse cx="0" cy="-14" rx="9" ry="11" fill="#f0ede6" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(36)" />
        <ellipse cx="0" cy="-14" rx="9" ry="11" fill="#ede9e2" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(108)" />
        <ellipse cx="0" cy="-14" rx="9" ry="11" fill="#f0ede6" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(180)" />
        <ellipse cx="0" cy="-14" rx="9" ry="11" fill="#ede9e2" stroke="#ccc8be" strokeWidth="0.5" transform="rotate(252)" />
        <ellipse cx="0" cy="-8" rx="6" ry="8" fill="#e8e4dc" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(20)" />
        <ellipse cx="0" cy="-8" rx="6" ry="8" fill="#e8e4dc" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(140)" />
        <circle cx="0" cy="0" r="6" fill="#e2ded6" />
        <circle cx="0" cy="0" r="3" fill="#d8d4cc" />
      </g>

      {/* Rose 3 — small, top right */}
      <g transform="translate(196,66)">
        <path d="M-3 10 Q-6 3 0 0 Q6 3 3 10 Z" fill="#6a9050" />
        <ellipse cx="0" cy="-15" rx="9" ry="13" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.5" transform="rotate(0)" />
        <ellipse cx="0" cy="-15" rx="9" ry="13" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.5" transform="rotate(80)" />
        <ellipse cx="0" cy="-15" rx="9" ry="13" fill="#f7f4ed" stroke="#dedad0" strokeWidth="0.5" transform="rotate(160)" />
        <ellipse cx="0" cy="-15" rx="9" ry="13" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.5" transform="rotate(240)" />
        <ellipse cx="0" cy="-9" rx="6" ry="8" fill="#ede9e2" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(40)" />
        <ellipse cx="0" cy="-9" rx="6" ry="8" fill="#ede9e2" stroke="#c4c0b8" strokeWidth="0.5" transform="rotate(160)" />
        <circle cx="0" cy="0" r="5" fill="#dedad2" />
      </g>

      {/* Bud 1 */}
      <g transform="translate(170,153)">
        <path d="M0 0 Q-7 -5 -5 -18 Q0 -22 5 -18 Q7 -5 0 0 Z" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.5" />
        <ellipse cx="-7" cy="-6" rx="9" ry="4" fill="#6a9050" stroke="#4a7030" strokeWidth="0.4" transform="rotate(-25 -7 -6)" />
        <ellipse cx="7" cy="-6" rx="9" ry="4" fill="#7a9960" stroke="#4a7030" strokeWidth="0.4" transform="rotate(25 7 -6)" />
      </g>

      {/* Bud 2 */}
      <g transform="translate(35,153)">
        <path d="M0 0 Q-6 -4 -4 -15 Q0 -18 4 -15 Q6 -4 0 0 Z" fill="#f4f1e8" stroke="#dedad0" strokeWidth="0.5" />
        <ellipse cx="-6" cy="-5" rx="8" ry="3.5" fill="#7a9960" stroke="#4a7030" strokeWidth="0.4" transform="rotate(-20 -6 -5)" />
        <ellipse cx="6" cy="-5" rx="8" ry="3.5" fill="#6a9050" stroke="#4a7030" strokeWidth="0.4" transform="rotate(20 6 -5)" />
      </g>
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
  const displayNames = names.length >= 2 ? `${names[0]} & ${names[1]}` : settings.couple_names_sr
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
      <article className="relative mx-auto max-w-[760px] overflow-hidden border border-[#b79a4a] bg-[#fffefb] shadow-[0_24px_80px_rgba(63,53,30,0.18)]">
        <FloralDecoration corner="top-left" />
        <FloralDecoration corner="bottom-right" />
        <div className="pointer-events-none absolute inset-2 border border-[#d9c88d]" />
        <GoldGeometry side="left" />
        <GoldGeometry side="right" />

        {/* Main invitation section */}
        <section className="relative z-10 px-6 py-14 text-center sm:px-16 sm:py-20">
          <DovesAndRings />

          <p className="font-montserrat text-sm font-semibold tracking-[0.08em] sm:text-base">{formatDate(settings.event_date)}</p>
          <h1 className="mt-8 font-great-vibes text-[54px] leading-[1.08] text-black sm:text-[88px]">{displayNames}</h1>
          <p className="mx-auto mt-7 max-w-xl whitespace-pre-line font-cormorant text-xl leading-relaxed sm:text-2xl">
            {settings.intro_text_sr}
          </p>
          {guestName ? <p className="mt-5 font-cormorant text-xl italic text-[#68604e]">Dragi {guestName}, radujemo se Vašem dolasku.</p> : null}

          <ChampagneGlassesDivider />

          {settings.show_event_details ? (
            <div>
              <p className="font-montserrat text-3xl font-bold">{settings.guest_arrival_time}</p>
              <p className="mt-4 font-cormorant text-2xl font-medium">{settings.venue_name}</p>
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
            <p className="mt-12 font-cormorant text-xl sm:text-2xl">
              Molimo Vas da potvrdite dolazak do <strong>{rsvpDeadlineLabel}</strong>.
            </p>
          ) : null}

          <div className="mx-auto mt-12 max-w-md"><CoupleIllustration /></div>
          <p className="font-great-vibes text-5xl sm:text-6xl">Radujemo se Vašem dolasku</p>
        </section>

        {/* Additional sections inside the same card */}
        {settings.show_agenda && agenda.length > 0 ? (
          <div className="border-t border-[#ded3b4]">
            <AgendaSection items={agenda} compact />
          </div>
        ) : null}

        {settings.show_countdown ? (
          <div className="border-t border-[#ded3b4]">
            <CountdownTimer targetDate={eventDateTime} variant="light" />
          </div>
        ) : null}

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
          <div className="border-t border-[#ded3b4]">
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
          </div>
        ) : null}
      </article>
    </main>
  )
}
