'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { formatPriceVial, formatUsdCents } from '@/lib/format-price'
import { packageLineTotalCents } from '@/lib/product-price'
import { getSeededProductReviewDisplay } from '@/lib/product-review-display'
import {
  hasDosageVariants,
  getDefaultDosageVariantId,
  perVialPriceCentsForVariant,
  displayDosageLabel,
} from '@/lib/dosage-variants'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Minus,
  Plus,
  Star,
  ShieldCheck,
  BadgeCheck,
  CircleCheckBig,
  type LucideIcon,
} from 'lucide-react'
import type { Product } from '@/lib/types'
import { CoaButton } from '@/components/product/coa-button'

const TRUST_BADGES: { label: string; Icon: LucideIcon }[] = [
  { label: 'HPLC Tested', Icon: ShieldCheck },
  { label: 'Mass Spectrometry Verified', Icon: BadgeCheck },
  { label: 'COA Available', Icon: CircleCheckBig },
]

interface ProductNamePanelProps {
  product: Product
  theme?: 'navy' | 'default'
}

export function ProductNamePanel({ product, theme = 'navy' }: ProductNamePanelProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    getDefaultDosageVariantId(product)
  )
  const { addItem } = useCart()

  useEffect(() => {
    setSelectedVariantId(getDefaultDosageVariantId(product))
    setQuantity(1)
  }, [product.id])

  const { rating, reviewCount } = getSeededProductReviewDisplay(product.id)

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariantId)
    const dose = displayDosageLabel(product, selectedVariantId)
    toast.success(
      dose ? `${product.name} (${dose}) added to cart` : `${product.name} added to cart`
    )
  }

  const vialCount = product.vial_count ?? 1
  const totalCents = packageLineTotalCents(product, quantity, selectedVariantId)
  const perVial = perVialPriceCentsForVariant(product, selectedVariantId)
  const multiDose = hasDosageVariants(product)
  const variants = product.dosage_variants ?? []

  const isNavy = theme === 'navy'
  const text = isNavy ? 'text-[#0A1931]' : 'text-foreground'
  const muted = isNavy ? 'text-[#0A1931]/70' : 'text-muted-foreground'

  return (
    <div className="flex flex-col">
      <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl ${text}`}>
        {product.name}
      </h1>

      {product.overview && (
        <p className={`mt-2 text-lg ${muted}`}>
          {product.overview}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i <= Math.floor(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : i === Math.ceil(rating) && rating % 1 > 0
                  ? 'fill-amber-400 text-amber-400/80'
                  : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-sm font-medium ${text}`}>{rating.toFixed(1)}</span>
        <span className={`text-sm ${muted}`}>({reviewCount} reviews)</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <div className="flex min-w-[140px] flex-col gap-2">
          <span className={`text-sm font-bold uppercase tracking-wider ${muted}`}>Dosage</span>
          {multiDose ? (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = v.id === selectedVariantId
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                      active
                        ? isNavy
                          ? 'bg-[#0A1931] text-white'
                          : 'bg-foreground text-background'
                        : isNavy
                          ? 'border-2 border-[#0A1931]/30 text-[#0A1931] hover:bg-[#0A1931]/10'
                          : 'border-2 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {v.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <span
              className={`inline-flex w-fit items-center rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide ${
                isNavy ? 'bg-[#0A1931] text-white' : 'bg-foreground text-background'
              }`}
            >
              {product.dosage || '—'}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className={`text-sm font-bold uppercase tracking-wider ${muted}`}>Count</span>
          <span className={`text-base font-medium ${text}`}>
            {vialCount} {vialCount === 1 ? 'vial' : 'vials'} per package
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <span className={`text-sm font-bold uppercase tracking-wider ${muted}`}>Quantity</span>
        <div className="flex w-fit items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className={
              isNavy
                ? 'border-2 border-[#0A1931]/75 text-[#0A1931] hover:bg-[#0A1931]/10 hover:text-[#0A1931]'
                : 'border-2 border-primary/70 text-primary hover:bg-primary/10 hover:text-primary'
            }
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className={`w-10 text-center font-medium ${text}`}>{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => q + 1)}
            className={
              isNavy
                ? 'border-2 border-[#0A1931]/75 text-[#0A1931] hover:bg-[#0A1931]/10 hover:text-[#0A1931]'
                : 'border-2 border-primary/70 text-primary hover:bg-primary/10 hover:text-primary'
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <p className={`text-4xl font-bold tracking-tight tabular-nums ${text}`}>
          {formatPriceVial(perVial)}
        </p>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={!product.in_stock}
        size="lg"
        className={`mt-6 w-full ${isNavy ? 'gap-2 rounded-lg bg-[#0A1931] px-6 text-white hover:bg-[#0A1931]/90 disabled:opacity-50' : 'gap-2'}`}
      >
        <ShoppingCart className="h-4 w-4" />
        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
      </Button>

      <p className={`mt-3 text-sm font-semibold tabular-nums ${text}`}>
        Total: {formatUsdCents(totalCents)}
        {vialCount > 1 && (
          <span className="ml-1">({quantity * vialCount} vials)</span>
        )}
      </p>

      <CoaButton coaUrl={product.coa_url} theme={theme} />

      <div
        className={`mt-8 border-t pt-6 ${isNavy ? 'border-[#0A1931]/15' : 'border-border'}`}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {TRUST_BADGES.map(({ label, Icon }) => (
            <div
              key={label}
              className={
                isNavy
                  ? 'flex flex-col items-center gap-2 rounded-xl border border-[#0A1931]/28 bg-[#0A1931]/[0.1] px-2 py-3 text-center shadow-sm sm:px-3 sm:py-4'
                  : 'flex flex-col items-center gap-2 rounded-xl border border-[#0A1931]/22 bg-[#0A1931]/[0.08] px-2 py-3 text-center shadow-sm sm:px-3 sm:py-4'
              }
            >
              <div
                className={
                  isNavy
                    ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A1931]/14 text-[#0A1931]'
                    : 'flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A1931]/12 text-[#0A1931]'
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
              </div>
              <span
                className={`text-[10px] font-bold leading-tight tracking-tight sm:text-xs ${text}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
