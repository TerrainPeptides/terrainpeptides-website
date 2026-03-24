import type { Product } from '@/lib/types'
import { findDosageVariant } from '@/lib/dosage-variants'

export interface CheckoutCartItemPayload {
  productId: string
  quantity: number
  dosage_variant_id?: string | null
}

export function orderLineFromCheckoutItem(
  product: Product,
  item: CheckoutCartItemPayload
) {
  const variant = findDosageVariant(product, item.dosage_variant_id ?? undefined)
  if (!variant) {
    throw new Error('INVALID_VARIANT')
  }
  const vialCount = product.vial_count ?? 1
  const totalVials = item.quantity * vialCount
  const lineTotalCents = variant.price_cents * vialCount * item.quantity
  const doseSuffix = variant.label ? ` — ${variant.label}` : ''
  const vialSuffix = vialCount > 1 ? ` (${totalVials} vials)` : ''
  return {
    product_id: product.id,
    product_name: `${product.name}${doseSuffix}${vialSuffix}`,
    quantity: totalVials,
    price_cents: variant.price_cents,
    lineTotalCents,
  }
}
