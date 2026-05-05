import type { Product } from '@/lib/types'
import { DEFAULT_CART_VARIANT_ID, findDosageVariant } from '@/lib/dosage-variants'
import { volumeDiscountFractionForVials } from '@/lib/product-price'

export interface CheckoutCartItemPayload {
  productId: string
  quantity: number
  dosage_variant_id?: string | null
}

export function orderLineFromCheckoutItem(
  product: Product,
  item: CheckoutCartItemPayload
) {
  const rawId = item.dosage_variant_id
  const variant = findDosageVariant(product, rawId ?? undefined)
  if (!variant) {
    const variants = product.dosage_variants
    const validationHint = (() => {
      if (!variants?.length) {
        return {
          branch: 'legacy_no_variants',
          accepts:
            rawId == null ||
            rawId === '' ||
            rawId === DEFAULT_CART_VARIANT_ID
              ? 'yes (synthetic default)'
              : `only null/""/"${DEFAULT_CART_VARIANT_ID}" for legacy products`,
        }
      }
      if (variants.length === 1) {
        return { branch: 'single_variant', note: 'findDosageVariant should always match — bug if you see this' }
      }
      return {
        branch: 'multi_variant',
        variant_ids: variants.map((v) => v.id),
        resolved_lookup_id:
          rawId == null || rawId === '' ? variants[0].id : rawId,
      }
    })()
    console.error('[orderLineFromCheckoutItem] INVALID_VARIANT — dosage validation failed', {
      payload: item,
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price_cents: product.price_cents,
        dosage: product.dosage,
        vial_count: product.vial_count,
        dosage_variants: product.dosage_variants,
      },
      input: {
        dosage_variant_id_raw: rawId,
        dosage_variant_id_used: rawId ?? undefined,
      },
      validationHint,
    })
    throw new Error('INVALID_VARIANT')
  }
  const qty = item.quantity
  const listCents = variant.price_cents * qty
  const rate = volumeDiscountFractionForVials(qty)
  const lineTotalCents = Math.round(listCents * (1 - rate))
  const price_cents = qty > 0 ? Math.round(lineTotalCents / qty) : variant.price_cents
  const doseSuffix = variant.label ? ` — ${variant.label}` : ''
  return {
    product_id: product.id,
    product_name: `${product.name}${doseSuffix}`,
    quantity: qty,
    price_cents,
    lineTotalCents,
  }
}
