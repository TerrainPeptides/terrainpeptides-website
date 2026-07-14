'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, FlaskConical } from 'lucide-react'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import type { Product } from '@/lib/types'
import { resolveProductImageSrc } from '@/lib/product-image'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [imageError, setImageError] = useState(false)
  const resolvedSrc = resolveProductImageSrc(product)
  const imageSrc = resolvedSrc && !imageError ? resolvedSrc : null

  return (
    <div>
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink/45 transition-colors hover:text-terrain-deep"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to shop
      </Link>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#f8faf9] sm:min-h-[420px] lg:min-h-[520px]">
          <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-white/92 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-terrain-deep backdrop-blur-[6px]">
            <span className="h-[5px] w-[5px] rounded-full bg-terrain" aria-hidden />
            COA
          </div>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-10 sm:p-14"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <FlaskConical className="h-28 w-28 text-muted-foreground/25" />
          )}
        </div>

        <ProductNamePanel product={product} />
      </div>
    </div>
  )
}
