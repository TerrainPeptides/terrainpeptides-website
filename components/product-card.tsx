'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { FlaskConical } from 'lucide-react'
import { formatUsdCents } from '@/lib/format-price'
import {
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import { displayProductSku } from '@/lib/product-display'
import type { Product } from '@/lib/types'
import { resolveProductImageSrc } from '@/lib/product-image'

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
  const sku = displayProductSku(product)

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition-[transform,border-color,box-shadow] duration-200 ease-out group-hover:-translate-y-[3px] group-hover:border-terrain group-hover:shadow-[0_4px_12px_rgba(14,63,35,0.06),0_2px_4px_rgba(14,63,35,0.04)]">
        {/* Image — Orbitrex .product-card-image */}
        <div className="relative aspect-[5/6] overflow-hidden bg-[#f8faf9]">
          {/* COA chip — top left */}
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-white/92 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-terrain-deep backdrop-blur-[6px]">
            <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-terrain" aria-hidden />
            COA
          </span>

          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-8 transition-transform duration-320 ease-out group-hover:scale-[1.04] sm:p-10"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FlaskConical className="h-14 w-14 text-muted-foreground/20" />
            </div>
          )}

          {/* Add to cart — bottom overlay, reveals on hover (Orbitrex .product-card-atc) */}
          <span className="pointer-events-none absolute inset-x-3 bottom-3 z-10 translate-y-2 rounded-md bg-ink py-[11px] text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white opacity-0 transition-[opacity,transform,background-color] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-terrain max-[640px]:translate-y-0 max-[640px]:opacity-100">
            Add to cart
          </span>

          {!product.in_stock && (
            <Badge
              variant="secondary"
              className="absolute bottom-3 right-3 z-20 rounded-sm text-[0.65rem]"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Info — Orbitrex .product-card-info */}
        <div className="flex flex-1 flex-col gap-2 border-t border-border px-4 pb-[18px] pt-4">
          <h3 className="m-0 text-base font-semibold leading-snug tracking-[-0.01em] text-ink">
            {product.name}
          </h3>

          {/* Meta — SKU left, mono green price right */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[#7a857d]">
              {sku}
            </span>
            <span className="shrink-0 font-mono text-lg font-medium tabular-nums tracking-[-0.01em] text-terrain-deep [font-feature-settings:'tnum']">
              {formatUsdCents(listPriceCents)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
