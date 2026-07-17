/** Shared helper — resolves the best available image src for a product in cart/checkout UI. */

export const DEFAULT_PRODUCT_IMAGE = '/images/vial-placeholder.svg'

export const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  'bpc-157': '/images/bpc-157-vial.png',
  'tb-500': '/images/tb-500-vial.png',
  tb500: '/images/tb500-vial.png',
  'ghk-cu': '/images/ghk-cu-vial.png',
  semax: '/images/semax-vial.png',
  selank: '/images/selank-vial.png',
  retatrutide: '/images/retatrutide-vial.png',
  'glp-3-rt': '/images/glp-3-rt-vial.png',
  'glp3-rt': '/images/glp3-rt-vial.png',
  'aod-9604': '/images/aod-9604-vial.png',
  dsip: '/images/dsip-vial.png',
  'dsip-5mg': '/images/dsip-5mg-vial.png',
  'dsip-10mg': '/images/dsip-10mg-vial.png',
  'mt-2': '/images/mt-2-vial.png',
  mt2: '/images/mt-2-vial.png',
  'mt2-10mg': '/images/mt-2-vial.png',
  kisspeptin: '/images/kisspeptin-vial.png',
  Epitalon: '/images/epitalon-vial.png',
  epitalon: '/images/epitalon-vial.png',
  NAD: '/images/nad-vial.png',
  nad: '/images/nad-vial.png',
  'nad+': '/images/nad-vial.png',
  'nad-plus': '/images/nad-vial.png',
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
    return `/${raw.replace(/^\.\?\//, '')}`
  }
  return (
    PRODUCT_IMAGE_BY_SLUG[product.slug] ??
    PRODUCT_IMAGE_BY_SLUG[product.slug.toLowerCase()] ??
    DEFAULT_PRODUCT_IMAGE
  )
}
