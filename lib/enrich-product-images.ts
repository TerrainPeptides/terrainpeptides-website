import fs from 'fs'
import path from 'path'

import type { Product } from '@/lib/types'
import { resolveProductImageSrc, DEFAULT_PRODUCT_IMAGE } from '@/lib/product-image'

function publicFileExists(urlPath: string): boolean {
  if (!urlPath.startsWith('/')) return false
  const filePath = path.join(process.cwd(), 'public', urlPath.replace(/^\//, ''))
  return fs.existsSync(filePath)
}

/** Pick a working image src for display (Supabase URL, local file, or slug fallback). */
export function resolveDisplayImageSrc(product: {
  image_url: string | null
  slug: string
}): string {
  const raw = product.image_url?.trim()
  if (raw?.startsWith('http://') || raw?.startsWith('https://') || raw?.startsWith('data:')) {
    return raw
  }
  if (raw?.startsWith('/') && publicFileExists(raw)) {
    return raw
  }
  return resolveProductImageSrc({ image_url: null, slug: product.slug }) ?? DEFAULT_PRODUCT_IMAGE
}

export function enrichProductImages(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    image_url: resolveDisplayImageSrc(p),
  }))
}
