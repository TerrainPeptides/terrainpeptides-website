import Link from 'next/link'

const GOLD = '#C9A84C'
const NAVY = '#0A1931'

export function CTASection() {
  return (
    <section className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
      <div
        className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/60 p-9 text-center shadow-[0_24px_60px_-12px_rgba(10,25,49,0.18)] sm:rounded-[2rem] sm:p-11 md:p-14"
        style={{
          background: `linear-gradient(165deg, ${NAVY} 0%, #0d2240 45%, #081426 100%)`,
        }}
      >
        <p
          className="mb-4 text-[0.625rem] font-bold uppercase tracking-[0.28em] sm:text-[0.6875rem]"
          style={{ color: GOLD }}
        >
          Research Peptides
        </p>

        <h2 className="text-balance text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl">
          Ready to Start Your Research?
        </h2>

        <p className="mx-auto mt-5 max-w-md text-pretty text-sm leading-relaxed text-white/58 sm:text-[0.9375rem]">
          Browse our complete catalog of premium research peptides with guaranteed purity, COA
          documentation, and fast shipping.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-1.5 rounded-md border border-white bg-transparent px-4 py-2 text-xs font-semibold tracking-wide text-white transition-[background-color,transform] hover:bg-white/10 active:scale-[0.98] sm:mt-9 sm:px-5 sm:py-2 sm:text-[0.8125rem]"
        >
          Shop Now
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  )
}
