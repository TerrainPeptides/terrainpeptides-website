import { notFound } from 'next/navigation'
import { ProductDetails } from '@/components/product/product-details'
import { ProductScience } from '@/components/product/product-science'
import { RelatedProducts } from '@/components/product/related-products'
import { GhkCuProduct } from '@/components/product/ghk-cu-product'
import { Bpc157Product } from '@/components/product/bpc-157-product'
import { RetatrutideProduct } from '@/components/product/retatrutide-product'
import { Mt2Product } from '@/components/product/mt-2-product'
import { DsipProduct } from '@/components/product/dsip-product'
import { Tb500Product } from '@/components/product/tb-500-product'
import { Aod9604Product } from '@/components/product/aod-9604-product'
import { SemaxProduct } from '@/components/product/semax-product'
import { SelankProduct } from '@/components/product/selank-product'
import { getProductBySlugAsync, getRelatedProductsAsync, getVouchesForProduct } from '@/lib/data'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const RETATRUTIDE_SLUGS = ['retatrutide', 'glp-3-rt', 'glp3-rt']

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlugAsync(slug) // resolves glp3-rt -> retatrutide in data layer

  if (!product) {
    return { title: 'Product Not Found | Terrain Peptides' }
  }

  return {
    title: `${product.name} | Terrain Peptides`,
    description: product.description || `Premium ${product.name} for research purposes.`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlugAsync(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProductsAsync(product, 4)
  const vouches = getVouchesForProduct(product.id)

  if (slug === 'ghk-cu') {
    return <GhkCuProduct product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  const SEMAX_SLUGS = ['semax', 'semax-nasal']
  if (
    SEMAX_SLUGS.includes(slug) ||
    product.name?.toLowerCase().includes('semax')
  ) {
    return <SemaxProduct product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  if (slug === 'selank' || product.name?.toLowerCase().includes('selank')) {
    return <SelankProduct product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  if (slug === 'bpc-157') {
    return <Bpc157Product product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  if (RETATRUTIDE_SLUGS.includes(slug) || product.name?.toLowerCase() === 'retatrutide') {
    return <RetatrutideProduct product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  if (slug === 'mt2-10mg') {
    return <Mt2Product product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  const DSIP_SLUGS = ['dsip', 'dsip-5mg', 'dsip-10mg']
  if (DSIP_SLUGS.includes(slug) || product.name?.toLowerCase().includes('dsip')) {
    return <DsipProduct product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  const TB500_SLUGS = ['tb-500', 'tb500', 'tb500-10mg']
  if (TB500_SLUGS.includes(slug) || product.name?.toLowerCase().includes('tb-500') || product.name?.toLowerCase().includes('tb500')) {
    return <Tb500Product product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  const AOD9604_SLUGS = ['aod-9604', 'aod9604']
  if (AOD9604_SLUGS.includes(slug) || product.name?.toLowerCase().includes('aod-9604') || product.name?.toLowerCase().includes('aod9604')) {
    return <Aod9604Product product={product as Product} relatedProducts={relatedProducts} vouches={vouches} />
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductDetails product={product as Product} />
        <ProductScience product={product as Product} vouches={vouches} />
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </div>
  )
}
