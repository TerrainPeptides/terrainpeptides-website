'use client'

import Link from 'next/link'
import { ShieldCheck, Microscope, Truck } from 'lucide-react'
import { CoaSampleCard } from '@/components/home/coa-sample-card'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white py-16 sm:py-20 lg:py-28">
      <div className="clinical-strip absolute inset-x-0 top-0" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <p className="hero-headline-line1 clinical-eyebrow inline-flex items-center gap-2 rounded border border-navy/20 bg-section-clinical px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-navy" aria-hidden />
              Research-grade compounds
            </p>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-[2.85rem] lg:leading-[1.15]">
              <span className="hero-headline-line1 block">Laboratory-Verified</span>
              <span className="hero-headline-line2 mt-1 block text-primary">Research Peptides</span>
            </h1>

            <p className="hero-subhead-enter mt-6 max-w-md text-base leading-relaxed text-foreground/80 sm:text-lg sm:leading-relaxed">
              99%+ purity compounds with third-party COA documentation. Fast, temperature-aware U.S. shipping.
            </p>

            <div className="hero-cta-enter mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="hero-shop-now-enter inline-flex min-w-[200px] items-center justify-center rounded-md bg-black px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-black/90"
              >
                Browse Catalog
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border-2 border-navy/20 bg-white px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-navy/35 hover:bg-section-clinical"
              >
                Quality Standards
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 border-t border-border pt-8 sm:grid-cols-4 sm:gap-4">
              {[
                { value: '99%+', label: 'Purity', icon: ShieldCheck },
                { value: 'COA', label: 'Every Batch', icon: Microscope },
                { value: '$250+', label: 'Free Ship', icon: Truck },
                { value: 'USA', label: 'Warehouse', icon: ShieldCheck },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-md border-2 border-navy/10 bg-section-subtle px-3 py-4 text-center"
                >
                  <stat.icon className="mb-2 h-4 w-4 text-navy" aria-hidden />
                  <span className="text-xl font-bold tabular-nums text-navy">{stat.value}</span>
                  <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide text-navy/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
            <CoaSampleCard className="shadow-md" />
          </div>
        </div>
      </div>
    </section>
  )
}
