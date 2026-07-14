'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/types'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  const featured = products.slice(0, 12)

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-carousel-card]')
    const amount = card ? card.offsetWidth + 20 : 300
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="border-b border-border bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="section-index">03 Catalog</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.5rem]">
              Best-selling research <span className="orbit-accent">peptides</span>
            </h2>
            <p className="mt-3 max-w-lg text-base text-muted-foreground">
              Independently verified compounds — COA included with every order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous products"
                onClick={() => scrollByCard(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-ink transition hover:border-terrain hover:text-terrain-deep"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next products"
                onClick={() => scrollByCard(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-ink transition hover:border-terrain hover:text-terrain-deep"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Link
              href="/shop"
              className="group hidden items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-terrain hover:border-terrain sm:inline-flex"
            >
              See all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="mt-10 flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featured.map((product) => (
            <div
              key={product.id}
              data-carousel-card
              className="w-[min(78vw,280px)] shrink-0 sm:w-[260px] lg:w-[280px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-white"
          >
            See all products
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
