'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { formatUsdCents } from '@/lib/format-price'
import {
  packageLineListCents,
  packageLineTotalCents,
  volumeDiscountFractionForVials,
} from '@/lib/product-price'
import { getSeededProductReviewDisplay } from '@/lib/product-review-display'
import {
  hasDosageVariants,
  getDefaultDosageVariantId,
  perVialPriceCentsForVariant,
  displayDosageLabel,
} from '@/lib/dosage-variants'
import { toast } from 'sonner'
import {
  Star,
  ChevronDown,
  X,
} from 'lucide-react'
import { CoaButton } from '@/components/product/coa-button'
import type { Product } from '@/lib/types'

const VIAL_QTY_MIN = 1
const VIAL_QTY_MAX = 10

function vialQtyLabel(n: number): string {
  return n === 1 ? '1 vial' : `${n} vials`
}

function volumeDiscountLabel(n: number): string {
  const d = volumeDiscountFractionForVials(n)
  if (d <= 0) return vialQtyLabel(n)
  const pctStr = String(Math.round(d * 10000) / 100)
  return `${vialQtyLabel(n)} (${pctStr}% off)`
}

const TRUST_BADGES = [
  { emoji: '•', label: 'Third-party Tested' },
  { emoji: 'us', label: 'American Sourced' },
  { emoji: '◎', label: '>99% Purity' },
  { emoji: '📦', label: 'Secure Packaging' },
]

interface ProductNamePanelProps {
  product: Product
  theme?: 'navy' | 'default'
}

export function ProductNamePanel({ product, theme = 'navy' }: ProductNamePanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    getDefaultDosageVariantId(product)
  )
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    setSelectedVariantId(getDefaultDosageVariantId(product))
    setQuantity(1)
  }, [product.id])

  const { rating, reviewCount } = getSeededProductReviewDisplay(product.id)

  const volumeDiscount = volumeDiscountFractionForVials(quantity)

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariantId)
    const dose = displayDosageLabel(product, selectedVariantId)
    toast.success(
      dose ? `${product.name} (${dose}) added to cart` : `${product.name} added to cart`
    )
  }

  const perVial = perVialPriceCentsForVariant(product, selectedVariantId)
  const listLineCents = packageLineListCents(product, quantity, selectedVariantId)
  const lineTotalCents = packageLineTotalCents(product, quantity, selectedVariantId)
  const multiDose = hasDosageVariants(product)
  const variants = product.dosage_variants ?? []

  const isNavy = theme === 'navy'
  const text = isNavy ? 'text-foreground' : 'text-foreground'
  const muted = isNavy ? 'text-foreground/60' : 'text-muted-foreground'

  const fieldShell =
    'w-full rounded-lg border border-black/35 bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition-[box-shadow,border-color] focus-visible:border-black/55 focus-visible:ring-2 focus-visible:ring-black/15'

  return (
    <div className="flex flex-col">
      {/* Title */}
      <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${text}`}>
        {product.name}
      </h1>

      {/* Stars + In Stock */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i <= Math.floor(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : i === Math.ceil(rating) && rating % 1 > 0
                  ? 'fill-amber-400 text-amber-400/80'
                  : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        {product.in_stock ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            In Stock
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Out of Stock
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className={`mt-3 text-sm leading-relaxed ${muted}`}>
          {product.description}
        </p>
      )}

      {/* Price */}
      <p className={`mt-4 text-2xl font-bold tabular-nums ${text}`}>
        {formatUsdCents(perVial)}
      </p>

      {/* Dosage */}
      <div className="mt-5 space-y-2">
        <p className={`text-sm font-medium ${text}`}>Dosage:</p>
        <div className="relative">
          {multiDose ? (
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className={`${fieldShell} appearance-none pr-10`}
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          ) : (
            <div className={fieldShell}>{product.dosage || 'Standard'}</div>
          )}
          {multiDose && (
            <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="relative mt-4 flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <p className={`text-sm font-medium ${text}`}>Quantity:</p>
          <div className="relative">
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={`${fieldShell} appearance-none pr-10`}
            >
              {Array.from({ length: VIAL_QTY_MAX - VIAL_QTY_MIN + 1 }, (_, i) => {
                const n = VIAL_QTY_MIN + i
                return (
                  <option key={n} value={n}>
                    {volumeDiscountLabel(n)}
                  </option>
                )
              })}
            </select>
            <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
          </div>
        </div>
        {quantity > 1 && (
          <button
            type="button"
            onClick={() => setQuantity(1)}
            className={`mt-7 flex shrink-0 items-center gap-1 self-start text-xs ${muted} hover:text-foreground`}
          >
            <X className="h-3.5 w-3.5" />
            Reset to 1
          </button>
        )}
      </div>

      {/* Total price with volume discount */}
      {volumeDiscount > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className={`line-through ${muted}`}>{formatUsdCents(listLineCents)}</span>
          <span className={`font-bold ${text}`}>{formatUsdCents(lineTotalCents)}</span>
        </div>
      )}

      {/* Add to Cart + CoA */}
      <div className="mt-5 flex items-center gap-2">
        <CoaButton coaUrl={product.coa_url} theme={isNavy ? 'navy' : 'default'} compact />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="flex-1 rounded-full bg-[#0A1628] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A1628]/90 disabled:opacity-50"
        >
          {product.in_stock ? (
            <span className="flex items-center justify-center gap-2">
              Add to cart
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </span>
          ) : 'Out of Stock'}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {TRUST_BADGES.map((b) => (
          <div
            key={b.label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${
              isNavy
                ? 'border-border/12 text-foreground'
                : 'border-border text-foreground'
            }`}
          >
            <span>{b.emoji}</span>
            {b.label}
          </div>
        ))}
      </div>
    </div>
  )
}
