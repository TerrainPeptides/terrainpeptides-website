import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/shop-content'
import { getProductsAsync } from '@/lib/data'

/** Always read latest catalog prices from Supabase (not a stale build snapshot). */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop | Terrain Peptides',
  description: 'Browse our complete catalog of premium research peptides by goal: fat loss, skin and collagen, sleep, cognitive support, and performance.',
}

export default async function ShopPage() {
  const products = (await getProductsAsync()).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-foreground/45 sm:text-xs">
              Catalog
            </p>
            <h1
              className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:tracking-tighter"
            >
              Research Peptides
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-foreground/60">
              All products are third-party tested with 99%+ purity guaranteed.
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
