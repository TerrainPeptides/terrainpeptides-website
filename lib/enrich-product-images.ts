import fs from 'fs'
import path from 'path'

import type { Product } from '@/lib/types'
import {
  resolveProductImageSrc,
  DEFAULT_PRODUCT_IMAGE,
  PRODUCT_IMAGE_BY_SLUG,
} from '@/lib/product-image'

function publicFileExists(urlPath: string): boolean {
  if (!urlPath.startsWith('/')) return false
  const filePath = path.join(process.cwd(), 'public', urlPath.replace(/^\//, ''))
  return fs.existsSync(filePath)
}

function localVialForSlug(slug: string): string | null {
  const mapped =
    PRODUCT_IMAGE_BY_SLUG[slug] ?? PRODUCT_IMAGE_BY_SLUG[slug.toLowerCase()] ?? null
  if (!mapped || mapped === DEFAULT_PRODUCT_IMAGE) return null
  return publicFileExists(mapped) ? mapped : null
}

/** Pick a working image src for display (local synergized vial, Supabase URL, or fallback). */
export function resolveDisplayImageSrc(product: {
  image_url: string | null
  slug: string
}): string {
  // Prefer known local vial art when present so catalog stays in sync with brand shots.
  const local = localVialForSlug(product.slug)
  if (local) return local

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
