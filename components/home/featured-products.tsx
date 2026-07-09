'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/types'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!products || products.length === 0) return null

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 text-black/60">
              Our most popular research compounds, trusted by laboratories worldwide.
            </p>
          </div>
          <Button variant="outline" className="gap-2 border-black/15 text-black hover:bg-black/5" asChild>
            <Link href="/shop">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Full-width carousel with edge arrows */}
      <div className="relative mt-10">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          disabled={!canPrev}
          className="absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-black bg-black text-white shadow-sm transition-colors hover:bg-neutral-900 disabled:opacity-30 sm:left-5 sm:h-12 sm:w-12 md:left-6 lg:left-8"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <div
          className="overflow-hidden px-14 sm:px-[4.5rem] md:px-[5.5rem] lg:px-[6.5rem]"
          ref={emblaRef}
        >
          <div className="flex -ml-4 sm:-ml-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          disabled={!canNext}
          className="absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-black bg-black text-white shadow-sm transition-colors hover:bg-neutral-900 disabled:opacity-30 sm:right-5 sm:h-12 sm:w-12 md:right-6 lg:right-8"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </section>
  )
}
