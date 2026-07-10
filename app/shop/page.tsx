import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/shop-content'
import { getProductsAsync } from '@/lib/data'
import { PRODUCT_CATEGORY_VALUES } from '@/lib/product-category'

/** Always read latest catalog prices from Supabase (not a stale build snapshot). */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop | Terrain Peptides',
  description: 'Browse our complete catalog of premium research peptides by goal: fat loss, skin and collagen, sleep, cognitive support, and performance.',
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
    <>
      <div className="clinical-navy-band bg-section-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 pb-6 text-left">
            <p className="clinical-eyebrow">Research catalog</p>
            <h1 className="page-title mt-2 text-3xl font-bold sm:text-4xl">
              All Products
            </h1>
            <p className="mt-2 max-w-xl text-base text-foreground/75">
              Premium research peptides with 99%+ purity — third-party tested, COA included.
            </p>
          </div>

          <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-lg bg-muted" />}>
            <ShopContent products={products} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
