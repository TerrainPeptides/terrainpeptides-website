'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/types'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  const featured = products.filter((p) => p.featured).slice(0, 12)
  const items = featured.length > 0 ? featured : products.slice(0, 12)

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-carousel-card]')
    const amount = card ? card.offsetWidth + 28 : 320
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="border-b border-black/8 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="section-index">03 Catalog</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-[2.5rem]">
          Featured Products
        </h2>

        <div className="relative mt-10">
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => scrollByCard(-1)}
            className="absolute -left-1 top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-black/70 transition hover:text-black md:flex lg:-left-3"
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => scrollByCard(1)}
            className="absolute -right-1 top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-black/70 transition hover:text-black md:flex lg:-right-3"
          >
            <ChevronRight className="h-8 w-8" strokeWidth={1.25} />
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-7 md:px-8 lg:px-10 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((product) => (
              <div
                key={product.id}
                data-carousel-card
                className="w-[min(78vw,280px)] shrink-0 snap-center sm:w-[280px] lg:w-[300px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
