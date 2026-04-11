import Link from 'next/link'
import Image from 'next/image'
import { Cormorant_Garamond } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-0 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="flex flex-col gap-14 lg:gap-20 xl:flex-row xl:items-center xl:justify-between xl:gap-24">
          {/* Copy — own column, room to breathe */}
          <div className="flex max-w-xl flex-shrink-0 flex-col xl:max-w-[28rem]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                US Made
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                ≥ 99% Purity
              </span>
            </div>

            <h1
              className={`${cormorant.className} mt-8 text-4xl font-normal leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]`}
            >
              <span className="hero-headline-line1 block">Peptides that are</span>
              <span className="hero-headline-line2 mt-2 block sm:mt-3">
                <span className="font-semibold italic">pure</span>
                {' '}&amp; <span className="font-semibold not-italic">trusted</span>
              </span>
            </h1>

            <p className="hero-subhead-enter mt-8 max-w-lg text-base leading-[1.7] text-foreground/85 sm:text-[1.05rem]">
              Shop US Made, ≥99% purity RUO (Research Use Only) peptides with a focus on purity &amp; transparency.
            </p>

            <div className="mt-10">
              <Link
                href="/shop"
                className="hero-cta-enter group relative inline-flex min-w-[min(100%,280px)] items-center justify-center overflow-hidden rounded-full border-2 border-[#0A1628] bg-[#0A1628] px-16 py-3.5 text-sm font-semibold shadow-md sm:min-w-[300px] sm:px-20"
              >
                <span
                  className="absolute inset-0 origin-left scale-x-0 bg-white/15 transition-transform duration-500 ease-out group-hover:scale-x-100"
                  aria-hidden
                />
                <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-white">
                  Shop Now
                </span>
              </Link>
            </div>
          </div>

          {/* Image — separated column, larger, no colored frame */}
          <div className="flex w-full flex-1 justify-center xl:min-w-0 xl:justify-end">
            <div className="relative aspect-square w-full max-w-[min(100%,520px)] sm:max-w-[580px] lg:max-w-[640px] xl:max-w-[min(52vw,680px)]">
              <Image
                src="/images/hero-ghk-cu-vial.png"
                alt="GHK-Cu research peptide vial"
                fill
                className="object-contain object-center"
                priority
                sizes="(max-width: 1280px) 90vw, 680px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
