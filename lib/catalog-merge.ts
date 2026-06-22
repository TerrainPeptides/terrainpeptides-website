import type { Product } from '@/lib/types'
import { seedProducts } from '@/lib/seed-data'

/**
 * Merge Supabase catalog rows with local seed defaults.
 * Supabase wins per slug; seed fills in products missing from the database.
 */
export function mergeCatalogWithSeed(
  supabaseProducts: Product[],
  seedFallback: Product[] = seedProducts
): Product[] {
  const bySlug = new Map<string, Product>()
  for (const seed of seedFallback) {
    bySlug.set(seed.slug, seed)
  }
  for (const row of supabaseProducts) {
    const existing = bySlug.get(row.slug)
    bySlug.set(row.slug, existing ? { ...existing, ...row } : row)
  }
  return [...bySlug.values()]
}
