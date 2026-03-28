import type { Product } from '@/lib/types'
import { normalizeProductCategory } from '@/lib/product-category'
import { dosageVariantsFromDbRow, parseResearchStudiesField } from '@/lib/dosage-variants-storage'

/** Map a Supabase `products` row (or seed object) to `Product`. */
export function productFromDbRow(row: Record<string, unknown>): Product {
  const priceCents =
    typeof row.price_cents === 'number'
      ? row.price_cents
      : Math.round(Number(row.price || 0) * 100)
  const dv = dosageVariantsFromDbRow(row)
  const dosage_variants = dv ?? undefined
  const { displayText } = parseResearchStudiesField(row.research_studies as string | null)
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: normalizeProductCategory(row.category, String(row.slug)),
    description: (row.description as string) ?? null,
    overview: (row.overview as string) ?? null,
    price_cents: priceCents,
    dosage_variants: dosage_variants ?? null,
    dosage: (row.dosage as string) ?? null,
    purity: (row.purity as string) ?? null,
    molecular_weight: (row.molecular_weight as string) ?? null,
    sequence: (row.sequence as string) ?? null,
    research_benefits: (row.research_benefits as string[]) ?? null,
    research_studies: displayText,
    in_stock: Boolean(row.in_stock),
    stock_level: row.stock_level != null ? Number(row.stock_level) : null,
    featured: Boolean(row.featured),
    image_url: (row.image_url as string) ?? null,
    coa_url: (row.coa_url as string) ?? null,
    vial_count: row.vial_count != null ? Number(row.vial_count) : 1,
    hidden: Boolean(row.hidden),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}
