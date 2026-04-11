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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const imageSrc = product.image_url && !imageError ? product.image_url : null

  const multi = hasDosageVariants(product)
  const defaultVid = getDefaultDosageVariantId(product)
  const listPriceCents = multi
    ? perVialPriceCentsForVariant(product, defaultVid)
    : product.price_cents
  const doseLabel = displayDosageLabel(product, defaultVid).trim()

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
        {/* Image */}
        <div className="relative flex h-72 items-center justify-center overflow-hidden sm:h-80">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <FlaskConical className="h-16 w-16 text-muted-foreground/20 transition-transform group-hover:scale-105" />
          )}
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute right-3 top-3 text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="px-5 pb-5 pt-2">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-lg font-bold tabular-nums text-foreground">
              {formatUsdCents(listPriceCents)}
            </span>
            {doseLabel && (
              <span className="text-xs text-muted-foreground">{doseLabel}</span>
            )}
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-full bg-[#0A1628] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A1628]/90"
          >
            Shop Now
          </button>
        </div>
      </div>
    </Link>
  )
}
