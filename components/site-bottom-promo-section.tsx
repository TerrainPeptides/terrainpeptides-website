import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PromoPurityHighlight } from '@/components/promo-purity-highlight'

/** Toggle to show the headline + Shop Now band above the newsletter */
const SHOW_BOTTOM_PROMO_HEADLINE = false

/** Newsletter + headline band — rendered once in root layout above the footer on every page */
export function SiteBottomPromoSection() {
  return (
    <section className="relative bg-[#0A1628]">
      {SHOW_BOTTOM_PROMO_HEADLINE && (
        <div
          className={[
            'relative',
            'px-4 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14',
          ].join(' ')}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between lg:gap-12">
              <h2 className="max-w-3xl text-balance text-left text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-white/95 sm:text-2xl md:pl-6 md:text-[1.65rem] md:leading-[1.35] lg:pl-10 lg:text-[1.85rem]">
                All the research peptides you need, with the{' '}
                <PromoPurityHighlight>purity, transparency, and reliability</PromoPurityHighlight>{' '}
                your work demands.
              </h2>

              <div className="hero-shop-now-cta shrink-0 md:ml-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-neutral-100"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter aligned with footer grid */}
      <div
        className={
          SHOW_BOTTOM_PROMO_HEADLINE
            ? 'relative z-20 -mt-[3.25rem] sm:-mt-[4rem] md:-mt-[4.5rem] lg:-mt-[5rem]'
            : 'relative z-20 pt-10 sm:pt-12 md:pt-14'
        }
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterSection variant="overlap" />
        </div>
      </div>
    </section>
  )
}
