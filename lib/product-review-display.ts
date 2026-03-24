/** FNV-1a–style hash for stable 32-bit unsigned int from a string. */
function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Deterministic per-product rating and review count for storefront display.
 * Same product id always yields the same values (stable across refreshes).
 */
export function getSeededProductReviewDisplay(productId: string): {
  rating: number
  reviewCount: number
} {
  const hRating = hashString(`review-rating:${productId}`)
  const hCount = hashString(`review-count:${productId}`)
  const ratingRaw = 4.6 + (hRating % 31) / 100
  const rating = Math.round(ratingRaw * 10) / 10
  const reviewCount = 38 + (hCount % 42)
  return { rating, reviewCount }
}
