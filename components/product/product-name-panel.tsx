'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatUsdCents } from '@/lib/format-price'
import {
  packageLineListCents,
  packageLineTotalCents,
  volumeDiscountFractionForVials,
} from '@/lib/product-price'
import {
  hasDosageVariants,
  getDefaultDosageVariantId,
  perVialPriceCentsForVariant,
  displayDosageLabel,
} from '@/lib/dosage-variants'
import { displayProductSku } from '@/lib/product-display'
import { PRODUCT_CATEGORY_LABELS } from '@/lib/product-category'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import { CoaButton } from '@/components/product/coa-button'
import type { Product } from '@/lib/types'

const VIAL_QTY_MIN = 1
const VIAL_QTY_MAX = 99

interface ProductNamePanelProps {
  product: Product
  theme?: 'navy' | 'default'
}

export function ProductNamePanel({ product }: ProductNamePanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    getDefaultDosageVariantId(product),
  )
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    setSelectedVariantId(getDefaultDosageVariantId(product))
    setQuantity(1)
  }, [product.id])

  const volumeDiscount = volumeDiscountFractionForVials(quantity)

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariantId)
    const dose = displayDosageLabel(product, selectedVariantId)
    toast.success(
      dose ? `${product.name} (${dose}) added to cart` : `${product.name} added to cart`,
    )
  }

  const perVial = perVialPriceCentsForVariant(product, selectedVariantId)
  const listLineCents = packageLineListCents(product, quantity, selectedVariantId)
  const lineTotalCents = packageLineTotalCents(product, quantity, selectedVariantId)
  const multiDose = hasDosageVariants(product)
  const variants = product.dosage_variants ?? []
  const sku = displayProductSku(product)
  const categoryLabel = PRODUCT_CATEGORY_LABELS[product.category] ?? product.category
  const categoryHref = `/shop?category=${encodeURIComponent(product.category)}`

  return (
    <div className="flex flex-col">
      {/* Orbitrex .product-summary: title → green mono price → qty+ATC → meta → COA */}
      <h1 className="mb-6 text-balance text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
        {product.name}
      </h1>

      <div className="mb-8 font-mono text-[clamp(1.75rem,3vw,2.5rem)] font-medium tabular-nums tracking-[-0.02em] text-terrain-deep [font-feature-settings:'tnum']">
        {formatUsdCents(perVial)}
      </div>

      {multiDose && (
        <div className="mb-6 space-y-1.5">
          <label
            htmlFor="dosage-select"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#7a857d]"
          >
            Dosage
          </label>
          <div className="relative">
            <select
              id="dosage-select"
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full appearance-none rounded-md border border-[#cdd5cf] bg-white px-4 py-3.5 pr-10 font-mono text-base text-ink outline-none transition focus:border-terrain focus:shadow-[0_0_0_4px_rgb(25_196_99_/_0.35)]"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {formatUsdCents(v.price_cents)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          </div>
        </div>
      )}

      {/* Orbitrex .product-add-form — qty + ATC on one row */}
      <div className="mb-8 flex flex-wrap items-end gap-3 border-b border-border pb-8">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="product-quantity"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#7a857d]"
          >
            Quantity
          </label>
          <input
            id="product-quantity"
            type="number"
            min={VIAL_QTY_MIN}
            max={VIAL_QTY_MAX}
            value={quantity}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10)
              if (Number.isNaN(n)) {
                setQuantity(VIAL_QTY_MIN)
                return
              }
              setQuantity(Math.min(VIAL_QTY_MAX, Math.max(VIAL_QTY_MIN, n)))
            }}
            className="w-[90px] rounded-md border border-[#cdd5cf] bg-white px-3 py-3.5 text-center font-mono text-base tabular-nums text-ink outline-none transition [font-feature-settings:'tnum'] focus:border-terrain focus:shadow-[0_0_0_4px_rgb(25_196_99_/_0.35)]"
          />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="min-h-[52px] flex-1 rounded-full bg-terrain px-6 py-3.5 text-sm font-semibold tracking-[0.04em] text-white transition hover:bg-terrain-deep disabled:cursor-not-allowed disabled:opacity-45"
        >
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>

      {volumeDiscount > 0 && (
        <p className="-mt-4 mb-6 font-mono text-sm text-terrain-deep">
          <span className="mr-2 text-[#7a857d] line-through">{formatUsdCents(listLineCents)}</span>
          <span className="font-medium tabular-nums">{formatUsdCents(lineTotalCents)}</span>
          <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-[#7a857d]">
            {Math.round(volumeDiscount * 100)}% volume off
          </span>
        </p>
      )}

      {/* Orbitrex .product-meta */}
      <div className="text-[13px] leading-[2] text-[#5a635c]">
        <p>
          <strong className="mr-2 inline-block min-w-[100px] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
            SKU:
          </strong>
          {sku}
        </p>
        <p>
          <strong className="mr-2 inline-block min-w-[100px] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
            Category:
          </strong>
          <Link
            href={categoryHref}
            className="text-terrain-deep underline underline-offset-[3px] transition hover:text-terrain"
          >
            {categoryLabel}
          </Link>
        </p>
      </div>

      {/* Orbitrex: outline COA below meta */}
      <div className="mt-4">
        <CoaButton coaUrl={product.coa_url} theme="navy" />
      </div>
    </div>
  )
}
