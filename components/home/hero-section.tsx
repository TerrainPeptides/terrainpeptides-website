'use client'

import Link from 'next/link'
import Image from 'next/image'

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.2 13.55 9.1 20.5 10.5 13.55 11.9 12 18.8 10.45 11.9 3.5 10.5 10.45 9.1 12 2.2Z" />
    </svg>
  )
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-white">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:gap-12 sm:px-6 sm:pb-16 sm:pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-12">
        <div className="max-w-xl text-left lg:max-w-2xl">
          <h1 className="hero-headline-line1 text-[clamp(1.45rem,3.8vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-black">
            <span className="block">Quality you can trace.</span>
            <span className="hero-headline-line2 mt-0.5 block">
              Numbers you can <span className="font-semibold italic text-terrain">verify</span>.
            </span>
          </h1>

          <p className="hero-subhead-enter mt-3 max-w-md text-sm leading-relaxed text-black/70 sm:text-[0.95rem]">
            Every Terrain peptide ships with a third-party Certificate of Analysis, batch-level
            accountability, and fast U.S. fulfillment. No unknowns. No compromises.
          </p>

          <div className="hero-cta-enter mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="hero-shop-now-enter inline-flex min-w-[160px] items-center justify-center gap-2.5 rounded-full bg-black px-6 py-2.5 text-sm font-medium leading-none tracking-tight text-white shadow-[0_6px_18px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#4eb573]"
            >
              <SparkleIcon className="h-5 w-5 shrink-0" />
              <span className="translate-y-px">Shop Now</span>
            </Link>
            <Link
              href="/faq"
              className="inline-flex min-w-[130px] items-center justify-center rounded-full border border-black bg-white px-6 py-2.5 text-sm font-medium leading-none tracking-tight text-black shadow-[0_3px_12px_rgba(0,0,0,0.05)] transition-colors hover:bg-black hover:text-white"
            >
              View COAs
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-black/15 pt-5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-black/70">
            {['3rd-party verified', 'Same-week shipping', 'Batch traceability'].map((label) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-panel-enter relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none">
          <div className="hero-coa-bob overflow-hidden rounded-2xl border border-black bg-ink-soft p-6 sm:p-7">
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
