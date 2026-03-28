'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { formatPriceVial, formatUsdCents } from '@/lib/format-price'
import { packageLineTotalCents } from '@/lib/product-price'
import {
  displayDosageLabel,
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import type { Product } from '@/lib/types'
import { PRODUCT_CATEGORY_LABELS } from '@/lib/product-category'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [imageError, setImageError] = useState(false)
  const imageSrc = product.image_url && !imageError ? product.image_url : null

  const multi = hasDosageVariants(product)
  const defaultVid = getDefaultDosageVariantId(product)
  const listPriceCents = multi
    ? perVialPriceCentsForVariant(product, defaultVid)
    : product.price_cents
  const vialCount = product.vial_count ?? 1
  const doseLabel = displayDosageLabel(product, defaultVid).trim()
  const onePackageTotalCents = packageLineTotalCents(product, 1, defaultVid)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1, defaultVid)
    toast.success(`${product.name} added to cart`)
  }

  const categoryLabel = PRODUCT_CATEGORY_LABELS

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        {/* Product image */}
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-muted/40">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
              onError={() => setImageError(true)}
            />
          ) : (
            <FlaskConical className="h-16 w-16 text-muted-foreground/30 transition-transform group-hover:scale-105" />
          )}
          {product.featured && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          {!product.in_stock && (
            <Badge variant="secondary" className="absolute right-3 top-3">
              Out of Stock
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {categoryLabel[product.category]}
              </p>
              <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary">
                {product.name}
              </h3>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatPriceVial(listPriceCents)}
              </p>
              {doseLabel ? (
                <p className="mt-1 text-sm font-medium text-foreground">{doseLabel}</p>
              ) : null}
            </div>
          </div>
          {product.purity && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {product.purity} Purity
              </Badge>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t-0 p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="w-full gap-2"
            variant={product.in_stock ? 'default' : 'secondary'}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <p className="text-center text-sm font-semibold tabular-nums text-foreground">
            Total: {formatUsdCents(onePackageTotalCents)}
            {vialCount > 1 && (
              <span className="ml-1 font-semibold text-foreground">({vialCount} vials)</span>
            )}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
}
