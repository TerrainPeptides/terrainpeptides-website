import type { ProductCategory } from '@/lib/types'

export const PRODUCT_CATEGORY_VALUES: readonly ProductCategory[] = [
  'fat-loss',
  'skin-collagen',
  'sleep',
  'cognitive',
  'performance',
]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  'fat-loss': 'Fat Loss',
  'skin-collagen': 'Skin & Collagen',
  sleep: 'Sleep',
  cognitive: 'Cognitive',
  performance: 'Performance',
}

/** Shop filter buttons: All Products + each category */
export const SHOP_CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Products' },
  ...PRODUCT_CATEGORY_VALUES.map((v) => ({
    value: v,
    label: PRODUCT_CATEGORY_LABELS[v],
  })),
]

/**
 * Slug → category for storefront filters. Used for legacy DB rows still using old category values.
 */
const SLUG_TO_CATEGORY: Record<string, ProductCategory> = {
  'ghk-cu': 'skin-collagen',
  'tb-500': 'skin-collagen',
  tb500: 'skin-collagen',
  'tb500-10mg': 'skin-collagen',
  'bpc-157': 'performance',
  dsip: 'sleep',
  'dsip-5mg': 'sleep',
  'dsip-10mg': 'sleep',
  semax: 'cognitive',
  'semax-nasal': 'cognitive',
  selank: 'cognitive',
  retatrutide: 'fat-loss',
  'glp-3-rt': 'fat-loss',
  'glp3-rt': 'fat-loss',
  'aod-9604': 'fat-loss',
  aod9604: 'fat-loss',
  'mt2-10mg': 'performance',
  'mt-2': 'performance',
  kisspeptin: 'performance',
  'blend-recovery': 'performance',
  'capsule-stack': 'performance',
  'syringe-kit': 'performance',
}

export function normalizeProductCategory(raw: unknown, slug: string): ProductCategory {
  const v = String(raw ?? '').trim()
  if (PRODUCT_CATEGORY_VALUES.includes(v as ProductCategory)) {
    return v as ProductCategory
  }
  const fromSlug = SLUG_TO_CATEGORY[slug]
  if (fromSlug) return fromSlug
  return 'performance'
}
