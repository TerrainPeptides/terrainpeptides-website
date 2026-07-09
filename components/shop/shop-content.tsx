'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Search } from 'lucide-react'
import { formatUsdCents } from '@/lib/format-price'
import {
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import type { Product } from '@/lib/types'
import { SHOP_CATEGORY_FILTERS } from '@/lib/product-category'
import { cn } from '@/lib/utils'

function getDisplayPrice(p: Product): number {
  if (hasDosageVariants(p)) {
    const variantPrice = perVialPriceCentsForVariant(p, getDefaultDosageVariantId(p))
    return variantPrice > 0 ? variantPrice : p.price_cents
  }
  return p.price_cents
}

interface ShopContentProps {
  products: Product[]
}

export function ShopContent({ products }: ShopContentProps) {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const priceExtents = useMemo(() => {
    const prices = products.map(getDisplayPrice).filter((p) => Number.isFinite(p) && p > 0)
    if (prices.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [products])

  const [priceRange, setPriceRange] = useState<[number, number]>(() => [
    priceExtents.min,
    priceExtents.max,
  ])

  useEffect(() => {
    setPriceRange([priceExtents.min, priceExtents.max])
  }, [priceExtents.min, priceExtents.max])

  const handlePriceChange = useCallback((v: number[]) => {
    setPriceRange([v[0], v[1]])
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.category === activeCategory
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      const price = getDisplayPrice(product)
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      return matchesCategory && matchesSearch && matchesPrice
    })
  }, [products, activeCategory, search, priceRange])

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 lg:shrink-0">
        <div className="sticky top-20 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-black">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              {SHOP_CATEGORY_FILTERS.map((cat) => (
                <Button
                  key={cat.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start text-sm font-normal',
                    activeCategory === cat.value &&
                      'bg-section-subtle text-primary hover:bg-section-subtle hover:text-primary',
                  )}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-black">
              Filter by Price
            </h3>
            <Slider
              min={priceExtents.min}
              max={priceExtents.max}
              step={100}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="[&_[data-slot=slider-range]]:!bg-neutral-950 [&_[data-slot=slider-thumb]]:!border-neutral-950 [&_[data-slot=slider-thumb]]:!ring-neutral-950/25"
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {formatUsdCents(priceRange[0])} &mdash; {formatUsdCents(priceRange[1])}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <div className="min-w-0 flex-1">
        <p className="mb-6 text-sm text-muted-foreground">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-black">No products found</p>
            <p className="mt-1 text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('')
                setActiveCategory('all')
                setPriceRange([priceExtents.min, priceExtents.max])
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
