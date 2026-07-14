const STATS = [
  { value: '99%+', label: 'Purity standard' },
  { value: '100%', label: 'Third-party tested' },
  { value: '< 48h', label: 'Order processing' },
  { value: '$300+', label: 'Free U.S. shipping' },
] as const

export function TrustStrip() {
  return (
    <section
      className="border-y border-border bg-white"
      aria-label="Key metrics"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`relative px-5 py-10 text-center sm:px-8 sm:py-12 ${
              i % 2 === 1 ? 'border-l border-border' : ''
            } ${i >= 2 ? 'border-t border-border lg:border-t-0' : ''} ${
              i >= 1 ? 'lg:border-l lg:border-border' : ''
            }`}
          >
            <p className="font-mono text-3xl font-medium tracking-tight text-ink sm:text-[2.35rem] [font-feature-settings:'tnum']">
              {stat.value}
            </p>
            <p className="mt-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a857d]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
