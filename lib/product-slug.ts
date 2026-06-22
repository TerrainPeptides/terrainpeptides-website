/** Alternate URL slugs → canonical product slug in the database. */
export const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'tb-500': 'tb500',
  tb500: 'tb500',
  'mt-2': 'mt2',
  mt2: 'mt2',
  'melanotan-2': 'mt2',
  dsip: 'dsip-5mg',
  retatrutide: 'glp3-rt',
  'glp-3-rt': 'glp3-rt',
  epitalon: 'Epitalon',
  epithalon: 'Epitalon',
  'epithalon-10mg': 'Epitalon',
  nad: 'NAD',
  'nad+': 'NAD',
}

export function normalizeProductSlug(slug: string): string {
  const s = slug.trim()
  return PRODUCT_SLUG_ALIASES[s] ?? PRODUCT_SLUG_ALIASES[s.toLowerCase()] ?? s
}

export function productSlugMatches(requestedSlug: string, productSlug: string): boolean {
  const req = requestedSlug.toLowerCase().trim()
  const row = productSlug.toLowerCase().trim()
  if (req === row) return true
  const canonical = normalizeProductSlug(requestedSlug).toLowerCase()
  return canonical === row
}
