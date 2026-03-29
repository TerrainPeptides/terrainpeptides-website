import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/shop-content'
import { PartnerCTA } from '@/components/partner-cta'
import { getProductsAsync } from '@/lib/data'

export const metadata = {
  title: 'Shop | Terrain Peptides',
  description: 'Browse our complete catalog of premium research peptides by goal: fat loss, skin and collagen, sleep, cognitive support, and performance.',
}

export default async function ShopPage() {
  const products = (await getProductsAsync()).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Shop Research Peptides
            </h1>
            <p className="mt-2 text-muted-foreground">
              All products are third-party tested with 99%+ purity guaranteed.
            </p>
          </div>

          <Suspense fallback={<div className="min-h-[400px] animate-pulse rounded-lg bg-muted" />}>
            <ShopContent products={products} />
          </Suspense>
        </div>
      </div>
      <PartnerCTA />
    </>
  )
}
