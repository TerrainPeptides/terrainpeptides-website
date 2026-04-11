import type { Product } from './types'
import { perVialPriceCentsForVariant } from './dosage-variants'

/**
 * Line total for cart and checkout: (per-vial price) × (vial quantity).
 * Cart quantity is the number of vials (e.g. 1 / 3 / 5 from the product selector).
 * Pass `dosage_variant_id` to use the selected variant's price.
 */
export function packageLineTotalCents(
  product: Product,
  packageQuantity: number,
  dosage_variant_id?: string | null
): number {
  const perVial = perVialPriceCentsForVariant(product, dosage_variant_id)
  return perVial * packageQuantity
}
