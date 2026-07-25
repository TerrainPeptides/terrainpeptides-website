'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { formatUsdCents } from '@/lib/format-price'
import {
  getDefaultDosageVariantId,
  hasDosageVariants,
  minVariantPriceCents,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import { normalizeProductSlug } from '@/lib/product-slug'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Mid-market boutique research-supplier list prices (same vial class). */
const MARKET_BENCH: Record<
  string,
  { marketCents: number; size: string; displayName: string }
> = {
  'bpc-157': { marketCents: 6499, size: '10mg', displayName: 'BPC-157' },
  tb500: { marketCents: 7499, size: '10mg', displayName: 'TB-500' },
  'tb-500': { marketCents: 7499, size: '10mg', displayName: 'TB-500' },
  'glp3-rt': { marketCents: 10999, size: '10mg', displayName: 'GLP-3 RT' },
  'glp-3-rt': { marketCents: 10999, size: '10mg', displayName: 'GLP-3 RT' },
  retatrutide: { marketCents: 10999, size: '10mg', displayName: 'GLP-3 RT' },
  NAD: { marketCents: 8499, size: '10mg', displayName: 'NAD+' },
  nad: { marketCents: 8499, size: '10mg', displayName: 'NAD+' },
  kisspeptin: { marketCents: 5499, size: '10mg', displayName: 'Kisspeptin' },
  mt2: { marketCents: 6999, size: '10mg', displayName: 'MT-2' },
  'mt-2': { marketCents: 6999, size: '10mg', displayName: 'MT-2' },
  Epitalon: { marketCents: 5999, size: '10mg', displayName: 'Epitalon' },
  epitalon: { marketCents: 5999, size: '10mg', displayName: 'Epitalon' },
  'ghk-cu': { marketCents: 5999, size: '10mg', displayName: 'GHK-Cu' },
  semax: { marketCents: 5499, size: '10mg', displayName: 'Semax' },
  selank: { marketCents: 5499, size: '10mg', displayName: 'Selank' },
}

const SHOW_ORDER = [
  'bpc-157',
  'glp3-rt',
  'NAD',
  'kisspeptin',
  'tb500',
  'mt2',
] as const

function terrainPriceCents(product: Product): number {
  if (hasDosageVariants(product)) {
    return minVariantPriceCents(product) || product.price_cents
  }
  return (
    perVialPriceCentsForVariant(product, getDefaultDosageVariantId(product)) ||
    product.price_cents
  )
}

function resolveBench(slug: string) {
  return (
    MARKET_BENCH[slug] ??
    MARKET_BENCH[slug.toLowerCase()] ??
    MARKET_BENCH[normalizeProductSlug(slug)] ??
    null
  )
}

function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || target <= 0) {
      setValue(active ? target : 0)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, durationMs])

  return value
}

interface PriceGapSectionProps {
  products: Product[]
}

export function PriceGapSection({ products }: PriceGapSectionProps) {
  const reveal = useScrollReveal()

  const rows = useMemo(() => {
    const byKey = new Map<string, Product>()
    for (const p of products) {
      byKey.set(p.slug, p)
      byKey.set(p.slug.toLowerCase(), p)
      byKey.set(normalizeProductSlug(p.slug), p)
      byKey.set(normalizeProductSlug(p.slug).toLowerCase(), p)
    }

    const built = SHOW_ORDER.map((key) => {
      const product =
        byKey.get(key) ??
        byKey.get(key.toLowerCase()) ??
        byKey.get(normalizeProductSlug(key))
      if (!product) return null
      const bench = resolveBench(product.slug) ?? resolveBench(key)
      if (!bench) return null
      const ours = terrainPriceCents(product)
      if (ours <= 0 || ours >= bench.marketCents) return null
      const saveCents = bench.marketCents - ours
      const savePct = Math.round((saveCents / bench.marketCents) * 100)
      return {
        slug: product.slug,
        name: bench.displayName,
        size: bench.size,
        ours,
        market: bench.marketCents,
        saveCents,
        savePct,
        href: `/product/${product.slug}`,
      }
    }).filter((r): r is NonNullable<typeof r> => r != null)

    return built
  }, [products])

  const maxSavePct = rows.reduce((m, r) => Math.max(m, r.savePct), 0)
  const avgSavePct =
    rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.savePct, 0) / rows.length)
      : 0
  const totalSaveCents = rows.reduce((s, r) => s + r.saveCents, 0)
  const animatedPct = useCountUp(maxSavePct, reveal.visible)
  const maxMarket = rows.reduce((m, r) => Math.max(m, r.market), 1)

  if (rows.length === 0) return null

  return (
    <section
      ref={reveal.ref}
      className="price-gap-section relative isolate overflow-hidden border-b border-black/8 bg-white"
      aria-labelledby="price-gap-heading"
    >
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Left: headline + stat */}
          <div
            className={cn(
              'transition-all duration-700 ease-out',
              reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            <p className="section-index">01 Value</p>
            <h2
              id="price-gap-heading"
              className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-[2.65rem] sm:leading-[1.08]"
            >
              Same COA standard.
              <br />
              A much smaller bill.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-black/55">
              Boutique research sites stack branding into the price. We don&apos;t. Verified
              peptides, third-party COAs, and pricing that actually respects a research budget.
            </p>

            <div className="mt-7 flex items-end gap-6 border-t border-black/10 pt-6">
              <div>
                <p className="text-[clamp(3.5rem,8vw,5rem)] font-semibold leading-none tracking-tight text-[#0e2e1d] [font-feature-settings:'tnum']">
                  {animatedPct}
                  <span className="text-[0.55em]">%</span>
                </p>
                <p className="mt-3 max-w-[14rem] text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">
                  Max savings vs typical boutique listings
                </p>
              </div>
              <div className="mb-2 hidden h-16 w-px bg-black/10 sm:block" aria-hidden />
              <div className="mb-1 hidden sm:block">
                <p className="text-2xl font-semibold text-black [font-feature-settings:'tnum']">
                  ~{avgSavePct}%
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-black/40">
                  Avg. on this board
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-terrain">
                Shop the low prices
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-full px-2 text-sm font-medium text-black/50 transition hover:text-black"
              >
                Quality still first
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: comparison table */}
          <div
            className={cn(
              'transition-all delay-150 duration-700 ease-out lg:-mt-2',
              reveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-black/40">
                Live Terrain price vs typical boutique listing
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0e2e1d]">
                Save {formatUsdCents(totalSaveCents)} on this set
              </p>
            </div>

            <ul className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              {rows.map((row, idx) => {
                const marketWidth = (row.market / maxMarket) * 100
                const oursWidth = (row.ours / maxMarket) * 100
                return (
                  <li
                    key={row.slug}
                    className={cn(
                      'px-4 py-4 sm:px-5 sm:py-5',
                      idx !== rows.length - 1 && 'border-b border-black/8',
                    )}
                    style={{
                      transitionDelay: reveal.visible ? `${180 + idx * 90}ms` : '0ms',
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={row.href}
                          className="text-sm font-semibold text-black transition hover:text-[#0e2e1d] sm:text-base"
                        >
                          {row.name}
                        </Link>
                        <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.14em] text-black/35">
                          {row.size}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#0e2e1d]/30 bg-[#0e2e1d]/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0e2e1d]">
                        −{row.savePct}%
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-[4.5rem] shrink-0 text-[9px] font-medium uppercase tracking-[0.12em] text-black/35 sm:w-24">
                          Typical
                        </span>
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/6">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-black/20 transition-[width] duration-1000 ease-out"
                            style={{
                              width: reveal.visible ? `${marketWidth}%` : '0%',
                              transitionDelay: `${220 + idx * 90}ms`,
                            }}
                          />
                        </div>
                        <span className="w-14 shrink-0 text-right text-xs text-black/35 line-through [font-feature-settings:'tnum'] sm:w-16">
                          {formatUsdCents(row.market)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-[4.5rem] shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0e2e1d] sm:w-24">
                          Terrain
                        </span>
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/6">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-[#0e2e1d] transition-[width] duration-1000 ease-out"
                            style={{
                              width: reveal.visible ? `${oursWidth}%` : '0%',
                              transitionDelay: `${320 + idx * 90}ms`,
                            }}
                          />
                        </div>
                        <span className="w-14 shrink-0 text-right text-sm font-semibold text-[#0e2e1d] [font-feature-settings:'tnum'] sm:w-16">
                          {formatUsdCents(row.ours)}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <p className="mt-4 text-[11px] leading-relaxed text-black/35">
              &ldquo;Typical boutique listing&rdquo; = mid-range publicly listed research-peptide pricing for
              comparable vial sizes. Not affiliated with other brands. Prices update with our
              catalog — COA still included either way.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
