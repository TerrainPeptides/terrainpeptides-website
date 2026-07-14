import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/shop-content'
import { getProductsAsync } from '@/lib/data'
import { PRODUCT_CATEGORY_VALUES } from '@/lib/product-category'

/** Always read latest catalog prices from Supabase (not a stale build snapshot). */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop | Terrain Peptides',
  description:
    'Browse our complete catalog of premium research peptides by goal: fat loss, skin and collagen, sleep, cognitive support, and performance.',
}

export default async function ShopPage() {
  const categoryOrder = new Map(PRODUCT_CATEGORY_VALUES.map((c, i) => [c, i]))
  const products = (await getProductsAsync()).sort((a, b) => {
    const cat =
      (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99)
    if (cat !== 0) return cat
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="bg-white">
      <div className="page-hero-dark">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-terrain">
            Research catalog
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            All <span className="orbit-accent">products</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            99%+ purity research peptides — third-party tested, COA included with every order.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="min-h-[400px] animate-pulse bg-muted" />}>
          <ShopContent products={products} />
        </Suspense>
      </div>
    </div>
  )
}
