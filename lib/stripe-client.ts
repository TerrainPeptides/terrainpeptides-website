import { loadStripe, type Stripe } from '@stripe/stripe-js'

// Support both the canonical name and the legacy alias used in this project
function getRawPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_KEY ||
    ''
  ).trim()
}

/**
 * Returns a user-facing message if the publishable key is missing or wrong type.
 * `loadStripe` only accepts pk_test_ / pk_live_. Restricted keys (rk_) and secret keys (sk_) will not work in the browser.
 */
export function getStripePublishableKeyIssue(): string | null {
  const k = getRawPublishableKey()
  if (!k) {
    return 'Stripe publishable key is not set. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_… or pk_live_…) to .env.local and restart the dev server.'
  }
  if (k.startsWith('sk_') || k.startsWith('rk_')) {
    return 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a publishable key (starts with pk_test_ or pk_live_). Restricted (rk_) and secret (sk_) keys cannot be used in the browser with Stripe Elements.'
  }
  if (!k.startsWith('pk_test_') && !k.startsWith('pk_live_')) {
    return 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_. Copy the “Publishable key” from Stripe Dashboard → Developers → API keys.'
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
