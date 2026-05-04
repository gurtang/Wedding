'use client'

import { useState } from 'react'
import EnvelopeAnimation from './EnvelopeAnimation'
import HeroSection from './HeroSection'
import AgendaSection from './AgendaSection'
import CountdownTimer from './CountdownTimer'
import RsvpSection from './RsvpSection'

const weddingData = {
  bride: 'Milena',
  groom: 'Slobodan',
  date: '2026-06-12T17:00:00',
  dateDisplay: '12. juna 2026.',
  venue: 'Bolji Život 2',
  venueAddress: 'Elektronska industrija Niš',
  mapsUrl: 'https://maps.app.goo.gl/Nn5DEWVZpCoYY6Qw7',
  rsvpDeadline: '1. juna 2026.',
  agenda: [
    { time: '17:00', name: 'Dolazak gostiju', desc: 'Topao doček i aperitiv' },
    { time: '18:00', name: 'Venčanje', desc: 'Ceremonija u dvorištu restorana' },
    { time: '19:00', name: 'Svečana večera', desc: 'Večera i slavlje sa gostima' },
  ],
}

interface WeddingInvitationProps {
  guestId: string
  guestName?: string
  maxAdditionalGuests?: number
  showDeadlineCard?: boolean
  initialRsvpStatus?: 'dolazi' | 'ne_dolazi' | 'nije_odgovorio'
  initialAdditionalGuestNames?: string[]
  initialNote?: string
  initialDeclineReason?: string
}

export default function WeddingInvitation({
  guestId,
  guestName,
  maxAdditionalGuests = 0,
  showDeadlineCard = true,
  initialRsvpStatus = 'nije_odgovorio',
  initialAdditionalGuestNames = [],
  initialNote = '',
  initialDeclineReason = '',
}: WeddingInvitationProps) {
  const [envelopeOpened, setEnvelopeOpened] = useState(false)

  const handleRsvp = async (data: {
    guestId: string
    attending: boolean
    additionalGuestNames: string[]
    note: string
    declineReason: string
  }) => {
    const res = await fetch(`/api/rsvp/${data.guestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rsvp_status: data.attending ? 'dolazi' : 'ne_dolazi',
        additional_guest_names: data.additionalGuestNames,
        note: data.note,
        decline_reason: data.declineReason,
      }),
    })
    if (!res.ok) throw new Error('RSVP failed')
  }

  return (
    <main style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      {!envelopeOpened && <EnvelopeAnimation onOpen={() => setEnvelopeOpened(true)} />}

      <div
        style={{
          opacity: envelopeOpened ? 1 : 0,
          transition: 'opacity 1s ease',
          pointerEvents: envelopeOpened ? 'auto' : 'none',
        }}
      >
        <HeroSection bride={weddingData.bride} groom={weddingData.groom} dateDisplay={weddingData.dateDisplay} />

        <section className="py-20 px-6" style={{ background: 'var(--cream)' }}>
          <p
            className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-center mb-3"
            style={{ color: 'var(--gold)' }}
          >
            Pozivnica
          </p>
          <h2
            className="font-great-vibes text-center mb-10"
            style={{ fontSize: 'clamp(42px,9vw,68px)', color: 'var(--rose-dk)', lineHeight: 1.1 }}
          >
            Naša svadba
          </h2>
          <div
            className="max-w-[540px] mx-auto text-center relative"
            style={{
              background: 'white',
              border: '1px solid var(--rose-lt)',
              padding: '52px 40px',
            }}
          >
            <div className="absolute pointer-events-none" style={{ inset: 8, border: '1px solid var(--gold-lt)' }} />
            <p className="font-cormorant font-light leading-relaxed" style={{ fontSize: 'clamp(17px,3vw,22px)', color: 'var(--ink)' }}>
              Sa velikom radošću vas pozivamo
              <br />
              da svojim prisustvom uveličate
              <br />
              naše venčanje.
            </p>
            <div
              className="my-6 h-px"
              style={{ background: 'linear-gradient(to right, transparent, var(--gold-lt), transparent)' }}
            />
            <p className="font-cormorant font-light leading-relaxed" style={{ fontSize: 'clamp(14px,2.5vw,18px)', color: 'var(--ink-lt)' }}>
              {guestName ? `${guestName},` : 'Dragi gosti,'} radujemo se da ovaj dan podelimo sa Vama.
            </p>
          </div>
        </section>

        <section className="py-20 px-6" style={{ background: 'var(--cream2)' }}>
          <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-center mb-3" style={{ color: 'var(--gold)' }}>
            Informacije
          </p>
          <h2 className="font-great-vibes text-center mb-10" style={{ fontSize: 'clamp(42px,9vw,68px)', color: 'var(--rose-dk)', lineHeight: 1.1 }}>
            Detalji
          </h2>
          <div className="max-w-[700px] mx-auto grid gap-0.5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="flex flex-col items-center gap-3 py-9 px-7 text-center" style={{ background: 'white' }}>
              <svg className="w-9 h-9" style={{ color: 'var(--gold)' }} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="4" y="7" width="28" height="24" rx="2" /><line x1="4" y1="14" x2="32" y2="14" /><line x1="12" y1="4" x2="12" y2="10" /><line x1="24" y1="4" x2="24" y2="10" />
              </svg>
              <span className="font-montserrat text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--ink-lt)' }}>Datum</span>
              <span className="font-cormorant text-[20px]" style={{ color: 'var(--ink)' }}>12. juni 2026.</span>
              <span className="text-[12px]" style={{ color: 'var(--ink-lt)' }}>Petak</span>
            </div>
            <div className="flex flex-col items-center gap-3 py-9 px-7 text-center" style={{ background: 'white' }}>
              <svg className="w-9 h-9" style={{ color: 'var(--gold)' }} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="18" cy="18" r="13" /><polyline points="18,9 18,18 24,22" />
              </svg>
              <span className="font-montserrat text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--ink-lt)' }}>Vreme</span>
              <span className="font-cormorant text-[20px]" style={{ color: 'var(--ink)' }}>17:00</span>
              <span className="text-[12px]" style={{ color: 'var(--ink-lt)' }}>Dolazak gostiju · venčanje 18:00</span>
            </div>
            <div className="flex flex-col items-center gap-3 py-9 px-7 text-center col-span-2" style={{ background: 'white' }}>
              <svg className="w-9 h-9" style={{ color: 'var(--gold)' }} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M18 3C12.5 3 8 7.5 8 13c0 7.5 10 20 10 20s10-12.5 10-20c0-5.5-4.5-10-10-10z" /><circle cx="18" cy="13" r="3.5" />
              </svg>
              <span className="font-montserrat text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--ink-lt)' }}>Lokacija</span>
              <a
                href={weddingData.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-col items-center gap-1 transition-opacity duration-200 hover:opacity-80"
                style={{ textDecoration: 'none' }}
              >
                <span className="font-cormorant text-[20px]" style={{ color: 'var(--ink)' }}>{weddingData.venue}</span>
                <span className="text-[12px]" style={{ color: 'var(--ink-lt)' }}>{weddingData.venueAddress}</span>
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 py-9 px-7 text-center col-span-2" style={{ background: 'white' }}>
              <svg className="w-9 h-9" style={{ color: 'var(--gold)' }} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="6" y="8" width="24" height="20" rx="2" />
                <line x1="6" y1="14" x2="30" y2="14" />
                <line x1="18" y1="14" x2="18" y2="28" />
              </svg>
              <span className="font-montserrat text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--ink-lt)' }}>Broj stola</span>
              <span className="font-cormorant text-[18px]" style={{ color: 'var(--ink-lt)' }}>
                Ovde ćete moći da vidite vaš broj stola.
              </span>
            </div>
            {showDeadlineCard && (
              <div className="flex flex-col items-center gap-3 py-9 px-7 text-center col-span-2" style={{ background: 'white' }}>
                <svg className="h-9 w-9" style={{ color: 'var(--gold)' }} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="4" y="7" width="28" height="24" rx="2" /><line x1="4" y1="14" x2="32" y2="14" /><line x1="12" y1="4" x2="12" y2="10" /><line x1="24" y1="4" x2="24" y2="10" />
                </svg>
                <span className="font-montserrat text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--ink-lt)' }}>
                  RSVP rok
                </span>
                <span className="font-cormorant text-[24px]" style={{ color: 'var(--ink)' }}>
                  Potvrdite vaš dolazak najkasnije do 1. juna.
                </span>
              </div>
            )}
          </div>
        </section>

        <AgendaSection items={weddingData.agenda} />
        <CountdownTimer targetDate={weddingData.date} />
        <RsvpSection
          guestId={guestId}
          deadline={weddingData.rsvpDeadline}
          onSubmit={handleRsvp}
          maxAdditionalGuests={maxAdditionalGuests}
          initialRsvpStatus={initialRsvpStatus}
          initialAdditionalGuestNames={initialAdditionalGuestNames}
          initialNote={initialNote}
          initialDeclineReason={initialDeclineReason}
        />

        <section className="py-20 px-6 text-center" style={{ background: 'var(--cream2)' }}>
          <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
            Kako do nas
          </p>
          <h2 className="font-great-vibes mb-8" style={{ fontSize: 'clamp(42px,9vw,68px)', color: 'var(--rose-dk)', lineHeight: 1.1 }}>
            Lokacija
          </h2>
          <p className="font-cormorant text-[22px] mb-2" style={{ color: 'var(--ink)' }}>{weddingData.venue}</p>
          <p className="text-[13px] tracking-[0.08em] mb-8" style={{ color: 'var(--ink-lt)' }}>{weddingData.venueAddress}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={weddingData.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-9 py-4 font-montserrat text-[11px] tracking-[0.22em] uppercase transition-all duration-200 hover:text-white"
              style={{ border: '1px solid var(--gold)', color: 'var(--ink)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Otvori mapu
            </a>
            <a
              href={`/api/calendar/${guestId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-9 py-4 font-montserrat text-[11px] tracking-[0.22em] uppercase transition-all duration-200 hover:text-white"
              style={{ border: '1px solid var(--gold)', color: 'var(--ink)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
              </svg>
              Dodaj u kalendar
            </a>
          </div>
        </section>

        <footer className="py-14 px-6 text-center" style={{ background: 'var(--ink)' }}>
          <p className="font-great-vibes leading-none" style={{ fontSize: 72, color: 'var(--rose-lt)' }}>M&amp;S</p>
          <p className="font-cormorant italic mt-3" style={{ fontSize: 16, color: 'oklch(70% 0.02 70)' }}>
            Radujemo se da ovaj dan podelimo sa vama, porodice Milošević i Đorđević.
          </p>
          <p className="font-montserrat text-[10px] tracking-[0.3em] uppercase mt-6" style={{ color: 'var(--gold-lt)' }}>
            12 · 06 · 2026 · Niš
          </p>
        </footer>
      </div>
    </main>
  )
}
