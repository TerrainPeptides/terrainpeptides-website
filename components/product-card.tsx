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
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition-[transform,border-color,box-shadow] duration-200 ease-out group-hover:-translate-y-[3px] group-hover:border-black group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
        <div className="relative aspect-square overflow-hidden bg-[#fafafa]">
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-black backdrop-blur-[6px]">
            <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-black" aria-hidden />
            COA
          </span>

          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-1.5 transition-transform duration-320 ease-out group-hover:scale-[1.04] sm:p-2"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FlaskConical className="h-14 w-14 text-muted-foreground/20" />
            </div>
          )}

          <span className="pointer-events-none absolute inset-x-2.5 bottom-2.5 z-10 translate-y-2 rounded-md bg-black py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white opacity-0 transition-[opacity,transform,background-color] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-[#4eb573] max-[640px]:translate-y-0 max-[640px]:opacity-100">
            Add to cart
          </span>

          {!product.in_stock && (
            <Badge
              variant="secondary"
              className="absolute bottom-2.5 right-2.5 z-20 rounded-sm text-[0.65rem]"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 border-t border-black/10 px-3 pb-3.5 pt-3">
          <h3 className="m-0 text-[0.95rem] font-semibold leading-snug tracking-[-0.01em] text-black">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">
              {sku}
            </span>
            <span className="shrink-0 font-mono text-base font-medium tabular-nums tracking-[-0.01em] text-black [font-feature-settings:'tnum']">
              {formatUsdCents(listPriceCents)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
