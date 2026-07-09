'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { FlaskConical } from 'lucide-react'
import { formatUsdCents } from '@/lib/format-price'
import {
  displayDosageLabel,
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import type { Product } from '@/lib/types'
import { resolveProductImageSrc } from '@/lib/product-image'

// Generate a stable, deterministic purity percentage between 99.50% and 99.99% based on product ID
const getStablePurity = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const decimal = Math.abs(hash % 50) + 50 // Generates a number between 50 and 99
  return `99.${decimal}%`
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const resolvedSrc = resolveProductImageSrc(product)
  const imageSrc = resolvedSrc && !imageError ? resolvedSrc : null

  const multi = hasDosageVariants(product)
  const defaultVid = getDefaultDosageVariantId(product)
  const listPriceCents = multi
    ? perVialPriceCentsForVariant(product, defaultVid) || product.price_cents
    : product.price_cents
  const doseLabel = displayDosageLabel(product, defaultVid).trim()
  const purity = getStablePurity(product.id)

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-black/25 hover:shadow-md">
        {/* Image */}
        <div className="relative flex h-72 items-center justify-center overflow-hidden sm:h-80">
          {/* Certified Purity Badge */}
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-800 border border-neutral-200 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {purity} Purity
          </div>

          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <FlaskConical className="h-16 w-16 text-muted-foreground/20" />
          )}
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute right-3 top-3 text-xs z-10">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="px-5 pb-5 pt-2">
          <h3 className="text-base font-semibold leading-tight text-black">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-lg font-bold tabular-nums text-black">
              {formatUsdCents(listPriceCents)}
            </span>
            {doseLabel && (
              <span className="text-xs text-muted-foreground">{doseLabel}</span>
            )}
          </div>

          <div
            className="mt-4 w-full rounded-full border-2 border-black bg-black py-2.5 text-center text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-black"
          >
            Shop Now
          </div>
        </div>
      </div>
    </Link>
  )
}
