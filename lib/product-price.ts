import type { Product } from './types'
import { perVialPriceCentsForVariant } from './dosage-variants'

/**
 * Line total for cart and checkout: (per-vial price) × (vials per package) × (package qty).
 * Pass `dosage_variant_id` to use the selected variant's price.
 */
export function packageLineTotalCents(
  product: Product,
  packageQuantity: number,
  dosage_variant_id?: string | null
): number {
  const vialsPerPackage = product.vial_count ?? 1
  const perVial = perVialPriceCentsForVariant(product, dosage_variant_id)
  return perVial * vialsPerPackage * packageQuantity
}
