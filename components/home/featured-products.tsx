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
    <section className="bg-section-subtle py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-navy/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="clinical-eyebrow">
              Catalog highlights
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Featured Compounds
            </h2>
            <p className="mt-2 text-base text-foreground/80">
              Our most requested research peptides, independently verified for purity.
            </p>
          </div>
          <Button variant="outline" className="gap-2 border-navy/25 text-navy hover:border-navy/40 hover:bg-section-clinical" asChild>
            <Link href="/shop">
              Full Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          disabled={!canPrev}
          className="absolute left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-md border-navy/15 bg-white text-navy shadow-sm transition-colors hover:border-navy/30 hover:bg-section-clinical disabled:opacity-30 sm:left-5 md:left-6 lg:left-8"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div
          className="overflow-hidden px-12 sm:px-[4rem] md:px-[5rem] lg:px-[6rem]"
          ref={emblaRef}
        >
          <div className="flex -ml-4 sm:-ml-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] sm:pl-5 lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
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
          className="absolute right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-md border-navy/15 bg-white text-navy shadow-sm transition-colors hover:border-navy/30 hover:bg-section-clinical disabled:opacity-30 sm:right-5 md:right-6 lg:right-8"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}
