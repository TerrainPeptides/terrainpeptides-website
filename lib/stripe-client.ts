import { loadStripe, Stripe } from '@stripe/stripe-js'

// Support both the canonical name and the legacy alias used in this project
const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_KEY

if (!publishableKey) {
  console.warn(
    '[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. ' +
      'Add it to .env.local and restart the dev server.'
  )
}

// Singleton promise — loadStripe is safe to call multiple times; it returns
// the same cached instance.
export const stripePromise: Promise<Stripe | null> = publishableKey
  ? loadStripe(publishableKey)
  : Promise.resolve(null)
