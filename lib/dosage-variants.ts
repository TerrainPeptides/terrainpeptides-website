import type { Product, ProductDosageVariant } from '@/lib/types'

export const DEFAULT_CART_VARIANT_ID = '__default__'

export function parseDosageVariantsField(value: unknown): ProductDosageVariant[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const out: ProductDosageVariant[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const o = raw as Record<string, unknown>
    const label = String(o.label ?? '').trim()
    const price_cents = Math.round(Number(o.price_cents ?? 0))
    if (!label || price_cents < 0) continue
    const id = String(o.id ?? '').trim() || crypto.randomUUID()
    out.push({ id, label, price_cents })
  }
  return out.length > 0 ? out : undefined
}

export function hasDosageVariants(product: Product): boolean {
  return Array.isArray(product.dosage_variants) && product.dosage_variants.length > 0
}

export function getDefaultDosageVariantId(product: Product): string {
  const v = product.dosage_variants
  if (v && v.length > 0) return v[0].id
  return DEFAULT_CART_VARIANT_ID
}

export function findDosageVariant(
  product: Product,
  variantId: string | null | undefined
): ProductDosageVariant | null {
  const variants = product.dosage_variants
  // Exactly one option — always use it (cart may omit id, send "", or a stale id after catalog changes)
  if (variants?.length === 1) {
    return variants[0]
  }
  if (!variants?.length) {
    const unset =
      variantId == null ||
      variantId === '' ||
      variantId === DEFAULT_CART_VARIANT_ID
    if (unset) {
      return {
        id: DEFAULT_CART_VARIANT_ID,
        label: product.dosage?.trim() ?? '',
        price_cents: product.price_cents,
      }
    }
    return null
  }
  const normalized =
    variantId == null || variantId === '' ? variants[0].id : variantId
  return variants.find((x) => x.id === normalized) ?? null
}

export function perVialPriceCentsForVariant(
  product: Product,
  dosage_variant_id: string | null | undefined
): number {
  const v = findDosageVariant(product, dosage_variant_id)
  return v?.price_cents ?? product.price_cents
}

export function minVariantPriceCents(product: Product): number {
  const variants = product.dosage_variants
  if (!variants?.length) return product.price_cents
  return Math.min(...variants.map((x) => x.price_cents))
}

export function displayDosageLabel(
  product: Product,
  dosage_variant_id: string | null | undefined
): string {
  const v = findDosageVariant(product, dosage_variant_id)
  return v?.label ?? product.dosage ?? ''
}

export function normalizeDosageVariantsPayload(
  body: unknown
): ProductDosageVariant[] | null {
  if (!Array.isArray(body)) return null
  const out: ProductDosageVariant[] = []
  for (const raw of body) {
    if (!raw || typeof raw !== 'object') continue
    const o = raw as Record<string, unknown>
    const label = String(o.label ?? '').trim()
    const price_cents =
      o.price_cents !== undefined
        ? Math.round(Number(o.price_cents))
        : Math.round(Number(o.price_dollars ?? 0) * 100)
    if (!label || price_cents < 0) continue
    const id = String(o.id ?? '').trim() || crypto.randomUUID()
    out.push({ id, label, price_cents })
  }
  return out.length > 0 ? out : null
}
