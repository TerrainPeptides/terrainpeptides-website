/** Shared helper — resolves the best available image src for a product in cart/checkout UI. */

export const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  'bpc-157': '/images/bpc-157-vial.png',
  'tb-500': '/images/tb-500-vial.png',
  'ghk-cu': '/images/ghk-cu-vial.png',
  'semax': '/images/semax-vial.png',
  'selank': '/images/selank-vial.png',
  'retatrutide': '/images/retatrutide-vial.png',
  'aod-9604': '/images/aod-9604-vial.png',
  'dsip': '/images/dsip-vial.png',
  'mt-2': '/images/mt-2-vial.png',
  'kisspeptin': '/images/bpc-157-vial.png',
  'blend-recovery': '/images/bpc-157-vial.png',
  'capsule-stack': '/images/bpc-157-vial.png',
  'syringe-kit': '/images/bpc-157-vial.png',
}

/**
 * Returns an image src string for a product, trying in order:
 *   1. image_url on the product (absolute URL or /path)
 *   2. slug-keyed fallback map
 *   3. Conventional /images/{slug}-vial.png
 */
export function resolveProductImageSrc(product: {
  image_url: string | null
  slug: string
}): string | null {
  const raw = product.image_url?.trim()
  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (raw.startsWith('/')) return raw
    return `/${raw.replace(/^\.?\//, '')}`
  }
  return PRODUCT_IMAGE_BY_SLUG[product.slug] ?? `/images/${product.slug}-vial.png`
}
