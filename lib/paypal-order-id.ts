/**
 * Random id like `ORD-571637` (six digits; no `#`; display with `formatOrdOrderIdDisplay` → `#ORD-571637`).
 */
export function generateOrdOrderId(): string {
  const n = 100000 + Math.floor(Math.random() * 900000)
  return `ORD-${n}`
}

/** Strip leading `#` and whitespace for DB lookup; uppercases alphanumerics. */
export function normalizeOrderNumberForLookup(input: string): string {
  return input.trim().replace(/^#/, '').toUpperCase()
}

/** Display / copy as `#ORD-######` (canonical customer-facing format). */
export function formatOrdOrderIdDisplay(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  return t.startsWith('#') ? t : `#${t}`
}

/**
 * Strict validation for PayPal-guide flows: `ORD-` + six digits, or legacy `ORD-` + six alphanumerics.
 */
export function normalizeOrdOrderNumber(input: string): string | null {
  const t = normalizeOrderNumberForLookup(input)
  if (/^ORD-\d{6}$/.test(t)) return t
  if (/^ORD-[A-Z0-9]{6}$/.test(t)) return t
  return null
}

/** Admin/UI: show store orders as `#ORD-######`; leave other legacy formats as-is. */
export function formatOrderNumberDisplay(orderNumber: string): string {
  const t = orderNumber.trim()
  const noHash = t.replace(/^#/, '')
  if (/^ORD-\d{6}$/i.test(noHash)) {
    return formatOrdOrderIdDisplay(noHash)
  }
  if (/^ORD-[A-Z0-9]{6}$/i.test(noHash)) {
    return formatOrdOrderIdDisplay(noHash)
  }
  return t
}
