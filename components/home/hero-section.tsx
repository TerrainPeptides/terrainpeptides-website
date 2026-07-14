'use client'

import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-ink text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 60% at 12% 10%, rgba(32,157,80,0.22), transparent 65%), radial-gradient(40% 50% at 85% 25%, rgba(32,157,80,0.12), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="max-w-xl text-left lg:max-w-2xl">
          <p className="hero-headline-line1 inline-flex items-center gap-2.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-terrain-bright">
            <span className="inline-block h-px w-7 bg-current opacity-70" aria-hidden />
            Research-grade peptides
          </p>

          <h1 className="mt-7 text-[clamp(2.4rem,6.5vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
            <span className="hero-headline-line1 block">Quality you can trace.</span>
            <span className="hero-headline-line2 mt-1 block">
              Numbers you can <span className="orbit-accent-light">verify</span>.
            </span>
          </h1>

          <p className="hero-subhead-enter mt-7 max-w-lg text-lg leading-relaxed text-white/65">
            Every Terrain peptide ships with a third-party Certificate of Analysis, batch-level
            accountability, and fast U.S. fulfillment. No unknowns. No compromises.
          </p>

          <div className="hero-cta-enter mt-10 flex flex-wrap items-center gap-3">
            <Link href="/shop" className="btn-terrain hero-shop-now-enter min-w-[200px]">
              Shop the Catalog
            </Link>
            <Link href="/faq" className="btn-ghost-light">
              View COAs
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 font-mono text-[0.7rem] tracking-wide text-white/45">
            {['3rd-party verified', 'Same-week shipping', 'Batch traceability'].map((label) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-terrain-bright" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-panel-enter relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none">
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-ink-soft p-6 sm:p-7">
            <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-ink">
              <Image
                src="/images/quality-vial.png"
                alt="Terrain research peptide vial"
                fill
                className="object-contain p-5"
                priority
              />
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Compound
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-white">GHK-Cu / 50mg</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Unit Price
                </p>
                <p className="mt-1 font-mono text-lg font-medium tabular-nums text-terrain-bright">
                  See catalog
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Testing
                </p>
                <p className="mt-1 font-mono text-sm text-white">HPLC + MS</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Purity
                </p>
                <p className="mt-1 font-mono text-sm text-white">≥ 99%</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-terrain/30 bg-terrain/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-terrain-bright">
                <span className="h-1.5 w-1.5 rounded-full bg-terrain" aria-hidden />
                COA Verified
              </span>
              <Link
                href="/shop"
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-terrain-bright transition hover:text-white"
              >
                See More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
