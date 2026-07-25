'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FlaskConical } from 'lucide-react'
import { formatUsdCents } from '@/lib/format-price'
import {
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import type { Product } from '@/lib/types'
import { resolveProductImageSrc } from '@/lib/product-image'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  /** Lift + image zoom on card hover (homepage carousel). */
  hoverLift?: boolean
}

function productBlurb(product: Product): string {
  const raw = (product.overview || product.description || '').replace(/\s+/g, ' ').trim()
  if (!raw) return 'Research-grade peptide with third-party COA included.'
  if (raw.length <= 88) return raw
  const cut = raw.slice(0, 88)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

export function ProductCard({ product, hoverLift = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const resolvedSrc = resolveProductImageSrc(product)
  const imageSrc = resolvedSrc && !imageError ? resolvedSrc : null

  const multi = hasDosageVariants(product)
  const defaultVid = getDefaultDosageVariantId(product)
  const listPriceCents = multi
    ? perVialPriceCentsForVariant(product, defaultVid) || product.price_cents
    : product.price_cents

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_18px_rgba(0,0,0,0.04)]',
        hoverLift &&
          'transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_14px_32px_rgba(0,0,0,0.07)]',
      )}
    >
      <div className="relative aspect-[1/0.95] overflow-hidden bg-[#fafafa]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={cn(
              'object-contain p-5 sm:p-6',
              hoverLift && 'transition-transform duration-500 ease-out group-hover:scale-[1.03]',
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FlaskConical className="h-12 w-12 text-black/10" />
          </div>
        )}

        {!product.in_stock && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-black px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-black/[0.04] bg-[#f4f4f5] px-4 pb-4 pt-3.5">
        <div className="flex items-baseline justify-between gap-2.5">
          <h3 className="min-w-0 text-[0.95rem] font-semibold leading-snug tracking-[-0.02em] text-black">
            {product.name}
          </h3>
          <p className="shrink-0 text-sm font-semibold tabular-nums tracking-tight text-black [font-feature-settings:'tnum']">
            {formatUsdCents(listPriceCents)}
          </p>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.4em] text-[0.75rem] leading-relaxed text-black/45">
          {productBlurb(product)}
        </p>

        <span className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-1.5 text-[0.8125rem] font-medium tracking-tight text-white transition-colors duration-200 hover:bg-[#4eb573]">
          View
        </span>
      </div>
    </Link>
  )
}
