'use client'

interface AgendaItem {
  time: string
  name: string
  desc: string
}

interface AgendaSectionProps {
  items: AgendaItem[]
}

export default function AgendaSection({ items }: AgendaSectionProps) {
  return (
    <section className="py-20 px-6" style={{ background: 'white' }}>
      <p
        className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-center mb-3"
        style={{ color: 'var(--gold)' }}
      >
        Raspored
      </p>
      <h2
        className="font-great-vibes text-center mb-10"
        style={{ fontSize: 'clamp(42px,9vw,68px)', color: 'var(--rose-dk)', lineHeight: 1.1 }}
      >
        Program
      </h2>

      <div className="max-w-[480px] mx-auto flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="grid gap-5 py-6"
            style={{
              gridTemplateColumns: '70px 1fr',
              borderBottom: i < items.length - 1 ? '1px solid var(--rose-lt)' : 'none',
            }}
          >
            {/* Time */}
            <div
              className="font-cormorant italic text-right pt-0.5"
              style={{ fontSize: 22, color: 'var(--gold)' }}
            >
              {item.time}
            </div>

            {/* Content */}
            <div>
              <div className="font-cormorant" style={{ fontSize: 20, color: 'var(--ink)' }}>
                {item.name}
              </div>
              <div
                className="text-[12px] mt-1 leading-relaxed tracking-[0.04em]"
                style={{ color: 'var(--ink-lt)' }}
              >
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
