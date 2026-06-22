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
        className="mb-6 inline-flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#f8f9fa] p-8 sm:min-h-[400px] lg:min-h-[440px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <FlaskConical className="h-32 w-32 text-muted-foreground/30" />
          )}
        </div>

        {/* Product Info */}
        <ProductNamePanel product={product} theme="navy" />
      </div>
    </div>
  )
}
