'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  ChevronLeft, 
  FlaskConical, 
  Shield, 
  FileText,
  Minus,
  Plus,
  Star
} from 'lucide-react'
import { CoaButton } from '@/components/product/coa-button'
import { formatPriceVial, formatUsdCents } from '@/lib/format-price'
import { packageLineTotalCents } from '@/lib/product-price'
import {
  hasDosageVariants,
  getDefaultDosageVariantId,
  perVialPriceCentsForVariant,
  displayDosageLabel,
} from '@/lib/dosage-variants'
import { getSeededProductReviewDisplay } from '@/lib/product-review-display'
import type { Product } from '@/lib/types'
import { PRODUCT_CATEGORY_LABELS } from '@/lib/product-category'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    getDefaultDosageVariantId(product)
  )
  const [imageError, setImageError] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    setSelectedVariantId(getDefaultDosageVariantId(product))
    setQuantity(1)
  }, [product.id])

  const { rating: avgRating, reviewCount } = getSeededProductReviewDisplay(product.id)
  const vialCount = product.vial_count ?? 1
  const multiDose = hasDosageVariants(product)
  const variants = product.dosage_variants ?? []

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariantId)
    const dose = displayDosageLabel(product, selectedVariantId)
    toast.success(
      dose ? `${product.name} (${dose}) added to cart` : `${product.name} added to cart`
    )
  }

  const categoryLabel = PRODUCT_CATEGORY_LABELS

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Product Image */}
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-muted/50 p-12">
          {product.image_url && !imageError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={product.image_url.startsWith('data:') || product.image_url.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <FlaskConical className="h-32 w-32 text-muted-foreground/30" />
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge variant="outline" className="mb-3 w-fit">
            {categoryLabel[product.category]}
          </Badge>
          
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {product.name}
          </h1>

          {/* Review Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i <= Math.floor(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : i === Math.ceil(avgRating) && avgRating % 1 > 0
                      ? 'fill-amber-400 text-amber-400/80'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>
          
          {multiDose ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    v.id === selectedVariantId
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background hover:bg-muted'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : (
            product.dosage && (
              <p className="mt-2 text-lg text-muted-foreground">{product.dosage}</p>
            )
          )}

          {/* Count (dosage above; package count only — no price here) */}
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Count</p>
            <p className="text-base font-medium">{vialCount} {vialCount === 1 ? 'vial' : 'vials'} per package</p>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 flex flex-wrap gap-3">
            {product.purity && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <Shield className="h-4 w-4" />
                {product.purity} Purity
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <FileText className="h-4 w-4" />
              COA Included
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="mt-6 text-muted-foreground">{product.description}</p>
          )}

          {/* Quantity → price → Add to Cart → total */}
          <Card className="mt-8">
            <CardContent className="flex flex-col gap-4 p-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quantity
                </p>
                <div className="flex w-fit items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="border-2 border-primary/70 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-2 border-primary/70 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                  {formatPriceVial(perVialPriceCentsForVariant(product, selectedVariantId))}
                </p>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full gap-2"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4" />
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <p className="text-center text-sm font-semibold tabular-nums text-foreground">
                Total: {formatUsdCents(packageLineTotalCents(product, quantity, selectedVariantId))}
                {vialCount > 1 && (
                  <span className="ml-1">({quantity * vialCount} vials)</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Stock Status */}
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                product.in_stock ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <CoaButton coaUrl={product.coa_url} />
        </div>
      </div>
    </div>
  )
}
