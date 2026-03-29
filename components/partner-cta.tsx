import Link from 'next/link'

const GOLD = '#C9A84C'
const NAVY = '#0A1931'

export function PartnerCTA() {
  return (
    <section
      className="w-full font-sans antialiased"
      style={{
        background: `linear-gradient(180deg, #0b1830 0%, ${NAVY} 55%, #060f1c 100%)`,
        borderTop: `1px solid ${GOLD}`,
      }}
      aria-labelledby="partner-cta-heading"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:gap-2.5 sm:px-5 sm:py-9 lg:py-10">
        <h2
          id="partner-cta-heading"
          className="text-balance text-lg font-bold uppercase leading-tight tracking-[0.08em] text-white sm:text-xl md:text-[1.35rem]"
        >
          <span className="block">Ready to partner</span>
          <span className="mt-0.5 block sm:mt-0.5">
            <span className="text-white">With </span>
            <span style={{ color: GOLD }}>Terrain</span>
            <span className="text-white">?</span>
          </span>
        </h2>

        <p className="max-w-[17rem] text-pretty text-[0.625rem] leading-[1.45] text-white/45 sm:max-w-xs sm:text-[0.65625rem]">
          Join our affiliate program and earn 10% commission on every sale you refer.
        </p>

        <Link
          href="/affiliates"
          className="mt-1 inline-flex items-center gap-1 rounded-md px-4 py-1.5 text-[0.6875rem] font-semibold tracking-wide transition-[filter,transform] hover:brightness-[1.05] active:scale-[0.98] sm:px-5 sm:py-2 sm:text-xs"
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          Become a Partner
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  )
}
