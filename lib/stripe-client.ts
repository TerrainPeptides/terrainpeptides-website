import { loadStripe, type Stripe } from '@stripe/stripe-js'

/** Trim, strip BOM, strip wrapping quotes (common .env mistakes). */
function normalizeEnvKey(raw: string | undefined): string {
  if (raw == null || raw === '') return ''
  let k = raw.trim()
  if (k.charCodeAt(0) === 0xfeff) k = k.slice(1).trim()
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim()
  }
  return k
}

function isPublishableStripeKey(k: string): boolean {
  const lower = k.toLowerCase()
  return lower.startsWith('pk_test_') || lower.startsWith('pk_live_')
}

function isSecretOrRestrictedKey(k: string): boolean {
  const lower = k.toLowerCase()
  return lower.startsWith('sk_') || lower.startsWith('rk_')
}

/**
 * Picks the Stripe **publishable** key from env.
 * Prefer `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, but if that value is wrong (e.g. secret key
 * pasted by mistake) while `NEXT_PUBLIC_STRIPE_KEY` holds `pk_live_` / `pk_test_`, use the latter.
 */
function getRawPublishableKey(): string {
  const a = normalizeEnvKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  const b = normalizeEnvKey(process.env.NEXT_PUBLIC_STRIPE_KEY)

  // Stripe publishable keys are lowercase; normalizing avoids false negatives if pasted in wrong case.
  if (isPublishableStripeKey(a)) return a.toLowerCase()
  if (isPublishableStripeKey(b)) return b.toLowerCase()
  // Fall back so error messages still refer to something the user set
  return a || b
}

/**
 * Returns a user-facing message if the publishable key is missing or wrong type.
 * `loadStripe` only accepts pk_test_ / pk_live_. Restricted keys (rk_) and secret keys (sk_) will not work in the browser.
 */
export function getStripePublishableKeyIssue(): string | null {
  const a = normalizeEnvKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  const b = normalizeEnvKey(process.env.NEXT_PUBLIC_STRIPE_KEY)
  const k = getRawPublishableKey()

  if (!k) {
    return 'Stripe publishable key is not set. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_… or pk_live_…) to .env.local and restart the dev server.'
  }

  if (isSecretOrRestrictedKey(k)) {
    return (
      'The Stripe key used in the browser must be a publishable key (pk_test_ or pk_live_). ' +
      'Restricted (rk_) and secret (sk_) keys cannot be used with Stripe Elements. ' +
      'If NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY contains sk_live/sk_test or rk_, move your pk_live_… key there or delete the wrong line. Restart `npm run dev` after saving .env.local.'
    )
  }

  if (!isPublishableStripeKey(k)) {
    return (
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_ (after trimming / quotes). ' +
      'Copy the “Publishable key” from Stripe Dashboard → Developers → API keys.'
    )
  }

  return null
}

let cachedKey = ''
let cachedPromise: Promise<Stripe | null> | null = null

/**
 * Resolves Stripe.js with the **current** publishable key from the environment.
 * The cache resets when the key string changes (e.g. test → live), so a dev server
 * restart or redeploy picks up new keys without a stale `loadStripe` instance.
 */
export function getStripePromise(): Promise<Stripe | null> {
  const key = getRawPublishableKey()
  const issue = getStripePublishableKeyIssue()
  if (issue || !key) {
    cachedKey = ''
    cachedPromise = null
    return Promise.resolve(null)
  }
  if (key !== cachedKey) {
    cachedKey = key
    cachedPromise = loadStripe(key)
  }
  return cachedPromise
}
