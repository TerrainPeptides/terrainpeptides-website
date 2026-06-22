/** Normalize a site/auth URL — bare domains get https:// (or http:// for localhost). */
export function normalizeSiteUrl(raw: string | undefined, fallback?: string): string | undefined {
  const value = raw?.trim()
  if (!value) return fallback

  const trimmed = value.replace(/\/$/, '')
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.includes('localhost') || trimmed.startsWith('127.0.0.1')) {
    return `http://${trimmed}`
  }
  return `https://${trimmed}`
}

/** Resolved public site origin for redirects (Stripe, etc.). */
export function getSiteUrl(fallback = 'http://localhost:3000'): string {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.NEXTAUTH_URL) ??
    (process.env.NODE_ENV === 'development' ? fallback : undefined) ??
    fallback
  )
}

/** NextAuth requires a full URL; bare domains break session/callback handling. */
export function ensureAuthUrl(): void {
  if (process.env.AUTH_URL?.startsWith('http')) return

  const raw = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL

  if (process.env.NODE_ENV === 'development') {
    const normalized = normalizeSiteUrl(raw)
    if (normalized?.includes('localhost') || normalized?.includes('127.0.0.1')) {
      process.env.AUTH_URL = normalized
      return
    }
    process.env.AUTH_URL = 'http://localhost:3000'
    return
  }

  const resolved = normalizeSiteUrl(raw)
  if (resolved) process.env.AUTH_URL = resolved
}
