'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ShopContentProps {
  products: Product[]
}

const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'individual', label: 'Individual Peptides' },
  { value: 'blend', label: 'Branded Blends' },
  { value: 'capsule', label: 'Capsules' },
  { value: 'accessory', label: 'Accessories' },
]

export function ShopContent({ products }: ShopContentProps) {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.category === activeCategory
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, search])

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 lg:shrink-0">
        <div className="sticky top-24 space-y-6">
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
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <div className="min-w-0 flex-1">
        {/* Results Count */}
        <p className="mb-6 text-sm text-muted-foreground">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-foreground">No products found</p>
            <p className="mt-1 text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('')
                setActiveCategory('all')
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
