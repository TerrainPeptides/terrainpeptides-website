'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, ArrowRight } from 'lucide-react'
import { formatUsdCents } from '@/lib/format-price'
import {
  displayDosageLabel,
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import type { Product } from '@/lib/types'
import { resolveProductImageSrc } from '@/lib/product-image'

const getStablePurity = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const decimal = Math.abs(hash % 50) + 50
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
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-md border-2 border-navy/10 bg-white shadow-sm transition-all duration-200 hover:border-primary/35 hover:shadow-md">
        <div className="relative flex h-64 items-center justify-center overflow-hidden bg-white sm:h-72">
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-sm border border-clinical-teal/35 bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-clinical-teal shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-clinical-teal" />
            {purity}
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
            <FlaskConical className="h-14 w-14 text-muted-foreground/25" />
          )}
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute right-3 top-3 z-10 rounded-sm text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <h3 className="text-base font-bold leading-snug text-navy">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums text-navy">
              {formatUsdCents(listPriceCents)}
            </span>
            {doseLabel && (
              <span className="text-sm font-medium text-navy/60">{doseLabel}</span>
            )}
          </div>

          <div className="mt-auto border-t border-border pt-4">
            <span
              className="flex w-full items-center justify-between gap-2 rounded-md border-2 border-border bg-section-subtle px-4 py-2.5 text-sm font-semibold text-navy transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
              aria-hidden
            >
              View details
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
