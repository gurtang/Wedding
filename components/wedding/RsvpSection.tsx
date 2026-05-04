'use client'

import { useState } from 'react'

interface RsvpSectionProps {
  guestId: string
  deadline: string
  maxAdditionalGuests: number
  initialRsvpStatus?: 'dolazi' | 'ne_dolazi' | 'nije_odgovorio'
  initialAdditionalGuestNames?: string[]
  initialNote?: string
  initialDeclineReason?: string
  onSubmit?: (data: {
    guestId: string
    attending: boolean
    additionalGuestNames: string[]
    note: string
    declineReason: string
  }) => Promise<void>
}

export default function RsvpSection({
  guestId,
  deadline,
  maxAdditionalGuests,
  initialRsvpStatus = 'nije_odgovorio',
  initialAdditionalGuestNames = [],
  initialNote = '',
  initialDeclineReason = '',
  onSubmit,
}: RsvpSectionProps) {
  const [choice, setChoice] = useState<'yes' | 'no' | null>(
    initialRsvpStatus === 'dolazi' ? 'yes' : initialRsvpStatus === 'ne_dolazi' ? 'no' : null,
  )
  const [additionalGuests, setAdditionalGuests] = useState<string[]>(
    initialAdditionalGuestNames.slice(0, Math.max(0, maxAdditionalGuests)),
  )
  const [note, setNote] = useState(initialNote)
  const [declineReason, setDeclineReason] = useState(initialDeclineReason)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!choice) {
      setError('Molimo izaberite opciju.')
      return
    }
    if (choice === 'yes' && additionalGuests.some((guest) => !guest.trim())) {
      setError('Molimo unesite imena svih dodatnih gostiju.')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit({
          guestId,
          attending: choice === 'yes',
          additionalGuestNames: choice === 'yes' ? additionalGuests.map((g) => g.trim()).filter(Boolean) : [],
          note: choice === 'yes' ? note : '',
          declineReason: choice === 'no' ? declineReason.trim() : '',
        })
      }
      setSuccess('Odgovor je uspešno sačuvan.')
    } catch {
      setError('Greška pri slanju. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid var(--rose-lt)',
    background: 'var(--cream)',
    fontFamily: 'var(--font-cormorant)',
    fontSize: 17,
    color: 'var(--ink)',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <section className="py-20 px-6" style={{ background: 'white' }}>
      <p
        className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-center mb-3"
        style={{ color: 'var(--gold)' }}
      >
        Odgovor
      </p>
      <h2
        className="font-great-vibes text-center mb-8"
        style={{ fontSize: 'clamp(42px,9vw,68px)', color: 'var(--rose-dk)', lineHeight: 1.1 }}
      >
        Potvrda dolaska
      </h2>

      <div className="max-w-[480px] mx-auto flex flex-col gap-4">
        <p className="font-cormorant italic text-center mb-2" style={{ fontSize: 17, color: 'var(--ink-lt)' }}>
          Molimo vas da potvrdite do <strong>{deadline}</strong>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {(['yes', 'no'] as const).map((val) => (
            <button
              key={val}
              onClick={() => {
                setChoice(val)
                setError('')
                setSuccess('')
              }}
              className="py-[18px] px-3 border font-montserrat text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
              style={{
                borderColor: choice === val ? 'var(--rose-dk)' : 'var(--rose-lt)',
                background: choice === val ? 'var(--rose-dk)' : 'transparent',
                color: choice === val ? 'white' : 'var(--ink-lt)',
                cursor: 'pointer',
              }}
            >
              {val === 'yes' ? 'Dolazim' : 'Ne dolazim'}
            </button>
          ))}
        </div>

        {choice === 'yes' && (
          <>
            {maxAdditionalGuests > 0 && (
              <div className="flex flex-col gap-2">
                <p className="font-cormorant text-sm text-center" style={{ color: 'var(--ink-lt)' }}>
                  Dodatni gosti: {additionalGuests.length}/{maxAdditionalGuests}
                </p>
                {additionalGuests.length < maxAdditionalGuests && (
                  <button
                    type="button"
                    onClick={() => setAdditionalGuests((prev) => [...prev, ''])}
                    className="py-[14px] px-3 border font-montserrat text-[11px] tracking-[0.18em] uppercase transition-all duration-200"
                    style={{
                      borderColor: 'var(--rose-lt)',
                      background: 'transparent',
                      color: 'var(--ink-lt)',
                      cursor: 'pointer',
                    }}
                  >
                    Dodaj gosta
                  </button>
                )}
              </div>
            )}

            {additionalGuests.map((guestName, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Dodatni gost ${index + 1} - ime i prezime`}
                  value={guestName}
                  onChange={(e) =>
                    setAdditionalGuests((prev) => prev.map((item, i) => (i === index ? e.target.value : item)))
                  }
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--rose-dk)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--rose-lt)')}
                />
                <button
                  type="button"
                  onClick={() => setAdditionalGuests((prev) => prev.filter((_, i) => i !== index))}
                  className="px-3 border font-montserrat text-[10px] tracking-[0.12em] uppercase"
                  style={{ borderColor: 'var(--rose-lt)', color: 'var(--ink-lt)', background: 'transparent' }}
                >
                  Ukloni
                </button>
              </div>
            ))}

            <textarea
              placeholder="Napomena (opciono)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--rose-dk)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--rose-lt)')}
            />
          </>
        )}

        {choice === 'no' && (
          <textarea
            placeholder="Razlog nedolaska (opciono)"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--rose-dk)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--rose-lt)')}
          />
        )}

        {error && <p className="text-center text-sm" style={{ color: 'var(--rose-dk)' }}>{error}</p>}
        {success && <p className="text-center text-sm" style={{ color: 'var(--ink-lt)' }}>{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="py-[18px] font-montserrat text-[11px] tracking-[0.25em] uppercase text-white transition-all duration-200 disabled:opacity-60"
          style={{ background: 'var(--rose-dk)', border: 'none', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Slanje...' : 'Sačuvaj odgovor'}
        </button>
      </div>
    </section>
  )
}
