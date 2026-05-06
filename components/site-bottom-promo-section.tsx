import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PromoPurityHighlight } from '@/components/promo-purity-highlight'

/** Newsletter + headline band — rendered once in root layout above the footer on every page */
export function SiteBottomPromoSection() {
  return (
    <section className="relative bg-white">
      {/* ~1/6 inset each side (see layout mock); rounded card instead of full-bleed strip */}
      <div
        className={[
          'px-4 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-14 md:px-[12.5%] md:pb-14 md:pt-16 lg:px-[16.67%] lg:pb-16 lg:pt-16',
        ].join(' ')}
      >
        <div
          className={[
            'relative z-[1] overflow-hidden rounded-2xl border border-white/10 sm:rounded-[1.35rem]',
            'bg-gradient-to-br from-[#0c2344] via-[#071528] to-[#040a14]',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
            'px-4 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14',
          ].join(' ')}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/[0.08] blur-3xl sm:h-64 sm:w-64"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-12 h-44 w-44 rounded-full bg-emerald-400/[0.05] blur-3xl sm:h-56 sm:w-56"
            aria-hidden
          />

          <div className="relative mx-auto max-w-[34rem] px-1 text-center sm:max-w-3xl lg:max-w-[40rem]">
            <h2 className="text-balance text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-white/95 sm:text-2xl md:text-[1.65rem] md:leading-[1.35] lg:text-[1.85rem]">
              All the research peptides you need, with the{' '}
              <PromoPurityHighlight>purity, transparency, and reliability</PromoPurityHighlight>{' '}
              your work demands.
            </h2>

            <div className="hero-shop-now-cta mt-8 flex justify-center sm:mt-9">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-[#071528] shadow-sm transition hover:bg-white/90"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slightly narrower side padding than the navy card so the box reads longer/wider; less negative margin = sits lower, more air above for Shop Now */}
      <div className="relative z-20 -mt-[3.25rem] px-3 sm:px-6 sm:-mt-[4rem] md:px-[10%] md:-mt-[4.5rem] lg:-mt-[5rem] lg:px-[11%]">
        <NewsletterSection variant="overlap" />
      </div>
    </section>
  )
}
