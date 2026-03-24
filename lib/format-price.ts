/** USD from integer cents (e.g. cart totals, line items). */
export function formatUsdCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

/** Per-vial list price from admin `product.price_cents`, e.g. "$19.99/vial". */
export function formatPriceVial(perVialPriceCents: number): string {
  return `${formatUsdCents(perVialPriceCents)}/vial`
}
