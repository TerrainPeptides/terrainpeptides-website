'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { formatUsdCents } from '@/lib/format-price'
import {
  getDefaultDosageVariantId,
  hasDosageVariants,
  perVialPriceCentsForVariant,
} from '@/lib/dosage-variants'
import type { Product } from '@/lib/types'
import { SHOP_CATEGORY_FILTERS } from '@/lib/product-category'
import { cn } from '@/lib/utils'

type SortOption = 'featured' | 'name-asc' | 'price-asc' | 'price-desc'

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
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const priceExtents = useMemo(() => {
    const prices = products.map(getDisplayPrice).filter((p) => Number.isFinite(p) && p > 0)
    if (prices.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [products])

  const [priceRange, setPriceRange] = useState<[number, number]>(() => [
    priceExtents.min,
    priceExtents.max,
  ])

  const priceFilterActive =
    priceRange[0] > priceExtents.min || priceRange[1] < priceExtents.max

  useEffect(() => {
    setPriceRange([priceExtents.min, priceExtents.max])
  }, [priceExtents.min, priceExtents.max])

  useEffect(() => {
    setActiveCategory(initialCategory)
  }, [initialCategory])

  const handlePriceChange = useCallback((v: number[]) => {
    setPriceRange([v[0], v[1]])
  }, [])

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
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

    const sorted = [...filtered]
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-asc':
        sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b))
        break
      case 'price-desc':
        sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a))
        break
      default:
        break
    }
    return sorted
  }, [products, activeCategory, search, priceRange, sortBy])

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('all')
    setSortBy('featured')
    setPriceRange([priceExtents.min, priceExtents.max])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-sm border border-border bg-white pl-11 text-base text-ink shadow-none focus-visible:border-terrain focus-visible:ring-terrain/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'h-11 gap-2 rounded-sm border border-border bg-white px-4 font-semibold text-ink hover:bg-section-subtle',
                  priceFilterActive && 'border-terrain bg-accent text-terrain-deep',
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Price
                {priceFilterActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-terrain" aria-hidden />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <p className="mb-4 text-sm font-semibold text-ink">Filter by price</p>
              <Slider
                min={priceExtents.min}
                max={priceExtents.max}
                step={100}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="[&_[data-slot=slider-range]]:!bg-terrain [&_[data-slot=slider-thumb]]:!border-terrain [&_[data-slot=slider-thumb]]:!ring-terrain/25"
              />
              <div className="mt-4 flex items-center justify-between text-sm font-semibold tabular-nums text-ink">
                <span>{formatUsdCents(priceRange[0])}</span>
                <span>{formatUsdCents(priceRange[1])}</span>
              </div>
              {priceFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-terrain-deep"
                  onClick={() => setPriceRange([priceExtents.min, priceExtents.max])}
                >
                  Reset price
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 appearance-none rounded-sm border border-border bg-white py-2 pl-4 pr-10 text-sm font-semibold text-ink outline-none transition-colors hover:border-terrain/40 focus:border-terrain focus:ring-2 focus:ring-terrain/15"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="name-asc">Name A–Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SHOP_CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              'rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors',
              activeCategory === cat.value
                ? 'border-ink bg-ink text-white'
                : 'border-border bg-white text-ink/65 hover:border-terrain/40 hover:text-ink',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        Showing {filteredProducts.length}{' '}
        {filteredProducts.length === 1 ? 'product' : 'products'}
      </p>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-border bg-section-subtle py-16 text-center">
          <p className="text-lg font-semibold text-ink">No products found</p>
          <p className="mt-2 text-base text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
          <Button variant="outline" className="mt-6 rounded-sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
