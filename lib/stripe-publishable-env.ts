/**
 * Shared logic to read Stripe publishable keys from `process.env`.
 * Used by the API route (authoritative at runtime) and documented for server tooling.
 */

export function normalizeStripeEnvKey(raw: string | undefined): string {
  if (raw == null || raw === '') return ''
  let k = raw.trim()
  if (k.charCodeAt(0) === 0xfeff) k = k.slice(1).trim()
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim()
  }
  // Strip inline # comments (invalid in standard dotenv but sometimes pasted)
  const hash = k.indexOf('#')
  if (hash !== -1) k = k.slice(0, hash).trim()
  return k
}

export function isPublishableStripeKey(k: string): boolean {
  const lower = k.toLowerCase()
  return lower.startsWith('pk_test_') || lower.startsWith('pk_live_')
}

export function isSecretOrRestrictedStripeKey(k: string): boolean {
  const lower = k.toLowerCase()
  return lower.startsWith('sk_') || lower.startsWith('rk_')
}

/**
 * Picks the publishable key from env, or the first non-empty raw value for diagnostics.
 */
export function pickPublishableStripeKeyFromProcessEnv(
  env: NodeJS.ProcessEnv
): { publishableKey: string | null; rawFallback: string } {
  const a = normalizeStripeEnvKey(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  const b = normalizeStripeEnvKey(env.NEXT_PUBLIC_STRIPE_KEY)
  /** Server-only name; readable by Route Handlers without exposing to the client bundle. */
  const c = normalizeStripeEnvKey(env.STRIPE_PUBLISHABLE_KEY)

  const orderedCandidates = [...new Set([a, b, c].filter(isPublishableStripeKey))]
  if (orderedCandidates.length === 0) {
    return { publishableKey: null, rawFallback: a || b || c }
  }

  const skMode = stripeSecretMode(env.STRIPE_SECRET_KEY)
  if (skMode) {
    const matchingMode = orderedCandidates.find((k) => stripePublishableMode(k) === skMode)
    if (matchingMode) {
      return { publishableKey: matchingMode, rawFallback: matchingMode }
    }
  }

  return { publishableKey: orderedCandidates[0], rawFallback: orderedCandidates[0] }
}

type StripeKeyMode = 'test' | 'live'

function stripePublishableMode(k: string): StripeKeyMode | null {
  const lower = k.toLowerCase()
  if (lower.startsWith('pk_test_')) return 'test'
  if (lower.startsWith('pk_live_')) return 'live'
  return null
}

function stripeSecretMode(k: string | undefined): StripeKeyMode | null {
  if (k == null || k === '') return null
  const s = normalizeStripeEnvKey(k)
  const lower = s.toLowerCase()
  if (lower.startsWith('sk_test_') || lower.startsWith('rk_test_')) return 'test'
  if (lower.startsWith('sk_live_') || lower.startsWith('rk_live_')) return 'live'
  return null
}

/**
 * When publishable and secret keys differ in test vs live mode, Stripe.js / Elements
 * often reports a generic "invalid API key" style failure. Catch that here.
 */
export function publishableSecretModeMismatchIssue(
  publishableKey: string,
  secretKey: string | undefined
): string | null {
  const pkMode = stripePublishableMode(publishableKey)
  const skMode = stripeSecretMode(secretKey)
  if (!pkMode || !skMode || pkMode === skMode) return null
  return (
    `Stripe publishable key is ${pkMode} mode but STRIPE_SECRET_KEY is ${skMode} mode. ` +
    'Use matching keys from the same Stripe Dashboard (both Test mode or both Live mode).'
  )
}

export function publishableKeyIssueForResolvedKey(k: string | null): string | null {
  if (!k) {
    return 'Stripe publishable key is not set on the server, or only secret/restricted keys were found. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or STRIPE_PUBLISHABLE_KEY) to your pk_test_ or pk_live_ key in .env.local and restart `npm run dev`.'
  }
  if (isSecretOrRestrictedStripeKey(k)) {
    return (
      'The value in NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or NEXT_PUBLIC_STRIPE_KEY / STRIPE_PUBLISHABLE_KEY) is a secret (sk_) or restricted (rk_) key. ' +
      'Put only the Publishable key (pk_live_… / pk_test_…) from Stripe → Developers → API keys, then restart the dev server.'
    )
  }
  if (!isPublishableStripeKey(k)) {
    return (
      'Publishable key must start with pk_test_ or pk_live_. Copy it from Stripe Dashboard → Developers → API keys (Publishable key, not Secret key).'
    )
  }
  return null
}
