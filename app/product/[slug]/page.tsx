import { notFound } from 'next/navigation'
import { ProductDetails } from '@/components/product/product-details'
import { ProductQualitySection } from '@/components/product/product-quality-section'
import { ProductTabs } from '@/components/product/product-tabs'
import { RelatedProducts } from '@/components/product/related-products'
import { GhkCuResearch } from '@/components/product/research/ghk-cu-research'
import { Bpc157Research } from '@/components/product/research/bpc-157-research'
import { RetatrutideResearch } from '@/components/product/research/retatrutide-research'
import { Mt2Research } from '@/components/product/research/mt-2-research'
import { DsipResearch } from '@/components/product/research/dsip-research'
import { Tb500Research } from '@/components/product/research/tb-500-research'
import { Aod9604Research } from '@/components/product/research/aod-9604-research'
import { SemaxResearch } from '@/components/product/research/semax-research'
import { SelankResearch } from '@/components/product/research/selank-research'
import { getProductBySlugAsync, getRelatedProductsAsync, getVouchesForProduct } from '@/lib/data'
import type { Product, Vouch } from '@/lib/types'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlugAsync(slug)

  if (!product) {
    return { title: 'Product Not Found | Terrain Peptides' }
  }

  return {
    title: `${product.name} | Terrain Peptides`,
    description: product.description || `Premium ${product.name} for research purposes.`,
  }
}

/** Match catalog slugs that may include strength suffixes (e.g. aod-9604-5mg) or alternate spellings. */
function slugMatchesBase(slug: string, bases: string[]): boolean {
  const n = slug.toLowerCase().trim()
  return bases.some((b) => n === b || n.startsWith(`${b}-`) || n.startsWith(`${b}_`))
}

function getResearchContent(slug: string, product: Product, vouches: Vouch[]): { content: ReactNode; hasFullResearch: boolean } {
  const name = product.name?.toLowerCase() ?? ''
  const urlSlug = slug.toLowerCase().trim()
  const rowSlug = (product.slug ?? '').toLowerCase().trim()
  const slugs = [urlSlug, rowSlug]

  const anySlug = (bases: string[]) => slugs.some((s) => slugMatchesBase(s, bases))

  // GHK-Cu
  if (anySlug(['ghk-cu', 'ghkcu']) || name.includes('ghk-cu') || name.includes('ghk cu') || /\bghkcu\b/.test(name))
    return { content: <GhkCuResearch product={product} vouches={vouches} />, hasFullResearch: true }

  // BPC-157 (not the recovery blend)
  if (anySlug(['bpc-157', 'bpc157']) || name.includes('bpc-157') || name.includes('bpc 157'))
    return { content: <Bpc157Research product={product} vouches={vouches} />, hasFullResearch: true }

  // Retatrutide / GLP-3
  if (
    anySlug(['retatrutide', 'glp-3-rt', 'glp3-rt', 'glp3rt']) ||
    name.includes('retatrutide') ||
    name.includes('glp-3') ||
    name.includes('glp3')
  )
    return { content: <RetatrutideResearch product={product} vouches={vouches} />, hasFullResearch: true }

  // MT-2 / Melanotan II
  if (
    anySlug(['mt-2', 'mt2', 'mt2-10mg', 'melanotan-2', 'melanotan-ii', 'melanotan2']) ||
    name.includes('mt-2') ||
    /\bmt2\b/.test(name) ||
    name.includes('melanotan')
  )
    return { content: <Mt2Research product={product} vouches={vouches} />, hasFullResearch: true }

  // DSIP
  if (anySlug(['dsip']) || name.includes('dsip'))
    return { content: <DsipResearch product={product} vouches={vouches} />, hasFullResearch: true }

  // TB-500
  if (anySlug(['tb-500', 'tb500']) || name.includes('tb-500') || name.includes('tb500') || /\btb\s*500\b/.test(name))
    return { content: <Tb500Research product={product} vouches={vouches} />, hasFullResearch: true }

  // AOD-9604
  if (
    anySlug(['aod-9604', 'aod9604']) ||
    name.includes('aod-9604') ||
    name.includes('aod9604') ||
    (name.includes('aod') && name.includes('9604'))
  )
    return { content: <Aod9604Research product={product} vouches={vouches} />, hasFullResearch: true }

  // Semax
  if (anySlug(['semax']) || name.includes('semax'))
    return { content: <SemaxResearch product={product} vouches={vouches} />, hasFullResearch: true }

  // Selank
  if (anySlug(['selank']) || name.includes('selank'))
    return { content: <SelankResearch product={product} vouches={vouches} />, hasFullResearch: true }

  return { content: null, hasFullResearch: false }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlugAsync(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProductsAsync(product, 4)
  const vouches = getVouchesForProduct(product.id)
  const { content: researchContent, hasFullResearch } = getResearchContent(slug, product as Product, vouches)

  return (
    <>
      <div className="min-h-screen bg-white text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProductDetails product={product as Product} />
          <ProductQualitySection product={product as Product} />
          <ProductTabs
            product={product as Product}
            hasFullResearch={hasFullResearch}
            researchContent={researchContent}
          />
          {relatedProducts.length > 0 && (
            <div className="mt-16 border-t border-border/10 pt-12">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
          <p className="mt-12 text-center text-xs text-foreground/50">
            For research purposes only. Not for human consumption.
          </p>
        </div>
      </div>
    </>
  )
}
