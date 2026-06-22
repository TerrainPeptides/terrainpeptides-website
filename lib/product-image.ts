/** Shared helper — resolves the best available image src for a product in cart/checkout UI. */

export const DEFAULT_PRODUCT_IMAGE = '/images/vial-placeholder.svg'

export const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  'bpc-157': DEFAULT_PRODUCT_IMAGE,
  'tb-500': DEFAULT_PRODUCT_IMAGE,
  tb500: DEFAULT_PRODUCT_IMAGE,
  'ghk-cu': DEFAULT_PRODUCT_IMAGE,
  semax: DEFAULT_PRODUCT_IMAGE,
  selank: DEFAULT_PRODUCT_IMAGE,
  retatrutide: DEFAULT_PRODUCT_IMAGE,
  'glp-3-rt': DEFAULT_PRODUCT_IMAGE,
  'glp3-rt': DEFAULT_PRODUCT_IMAGE,
  'aod-9604': DEFAULT_PRODUCT_IMAGE,
  dsip: DEFAULT_PRODUCT_IMAGE,
  'dsip-5mg': DEFAULT_PRODUCT_IMAGE,
  'mt-2': DEFAULT_PRODUCT_IMAGE,
  mt2: DEFAULT_PRODUCT_IMAGE,
  kisspeptin: DEFAULT_PRODUCT_IMAGE,
  Epitalon: DEFAULT_PRODUCT_IMAGE,
  epitalon: DEFAULT_PRODUCT_IMAGE,
  NAD: DEFAULT_PRODUCT_IMAGE,
  nad: DEFAULT_PRODUCT_IMAGE,
  'blend-recovery': DEFAULT_PRODUCT_IMAGE,
  'capsule-stack': DEFAULT_PRODUCT_IMAGE,
  'syringe-kit': DEFAULT_PRODUCT_IMAGE,
}

/**
 * Returns an image src string for a product, trying in order:
 *   1. image_url on the product (absolute URL or existing /path)
 *   2. slug-keyed fallback map
 *   3. Default vial placeholder
 */
export function resolveProductImageSrc(product: {
  image_url: string | null
  slug: string
}): string | null {
  const raw = product.image_url?.trim()
  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw
    if (raw.startsWith('/')) return raw
    return `/${raw.replace(/^\.?\//, '')}`
  }
  return PRODUCT_IMAGE_BY_SLUG[product.slug] ?? PRODUCT_IMAGE_BY_SLUG[product.slug.toLowerCase()] ?? DEFAULT_PRODUCT_IMAGE
}
