import type { Product } from './types'
import { perVialPriceCentsForVariant } from './dosage-variants'

/**
 * Volume tier on vial count for a single line (same product + dose).
 * 3+ vials: 1%, 5+ vials: 2.5%, 10 vials: 5% (best tier applies).
 */
export function volumeDiscountFractionForVials(packageQuantity: number): number {
  if (packageQuantity >= 10) return 0.05
  if (packageQuantity >= 5) return 0.025
  if (packageQuantity >= 3) return 0.01
  return 0
}

/** List subtotal before volume tier (per-vial × vials). */
export function packageLineListCents(
  product: Product,
  packageQuantity: number,
  dosage_variant_id?: string | null
): number {
  const perVial = perVialPriceCentsForVariant(product, dosage_variant_id)
  return perVial * packageQuantity
}

/**
 * Line total for cart and checkout: list subtotal minus volume tier discount.
 * Pass `dosage_variant_id` to use the selected variant's price.
 */
export function packageLineTotalCents(
  product: Product,
  packageQuantity: number,
  dosage_variant_id?: string | null
): number {
  const list = packageLineListCents(product, packageQuantity, dosage_variant_id)
  const d = volumeDiscountFractionForVials(packageQuantity)
  return Math.round(list * (1 - d))
}
