export type TrackLookupMethod = 'email' | 'name' | 'phone' | 'order'

export function normalizeZip(zip: string): string {
  return zip.replace(/\D/g, '').slice(0, 5)
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.length > 10 ? digits.slice(-10) : digits
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function zipMatches(stored: string | undefined | null, input: string): boolean {
  const a = normalizeZip(stored ?? '')
  const b = normalizeZip(input)
  if (!a || !b) return false
  return a === b
}

export function phoneMatches(stored: string | undefined | null, input: string): boolean {
  const a = normalizePhone(stored ?? '')
  const b = normalizePhone(input)
  if (!a || !b) return false
  return a === b || a.endsWith(b) || b.endsWith(a)
}

export function nameMatches(stored: string | undefined | null, input: string): boolean {
  const a = normalizeName(stored ?? '')
  const b = normalizeName(input)
  if (!a || !b) return false
  return a === b
}

export function shippingZip(order: Record<string, unknown>): string {
  const addr = order.shipping_address
  if (!addr || typeof addr !== 'object') return ''
  const row = addr as Record<string, unknown>
  return String(row.zip ?? row.postal_code ?? '')
}

export function shippingName(order: Record<string, unknown>): string {
  const addr = order.shipping_address
  if (addr && typeof addr === 'object') {
    const n = (addr as Record<string, unknown>).name
    if (typeof n === 'string' && n.trim()) return n
  }
  return String(order.customer_name ?? '')
}

export function shippingPhone(order: Record<string, unknown>): string {
  const addr = order.shipping_address
  if (!addr || typeof addr !== 'object') return ''
  return String((addr as Record<string, unknown>).phone ?? '')
}

export function orderEmail(order: Record<string, unknown>): string {
  return String(order.customer_email ?? order.email ?? '').toLowerCase()
}
