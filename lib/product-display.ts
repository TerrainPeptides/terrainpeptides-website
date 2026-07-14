import type { Product } from '@/lib/types'

/**
 * Display SKU in Orbitrex-style form (e.g. TP-GHKCU042A).
 * Stable from product id + slug — not a warehouse barcode.
 */
export function displayProductSku(product: Product): string {
  const slugPart = product.slug
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toUpperCase()
  const idPart = product.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()
  return `TP-${slugPart}${idPart || '0000'}`
}
