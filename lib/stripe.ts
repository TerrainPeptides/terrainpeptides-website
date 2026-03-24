import 'server-only'

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

if (!key) {
  console.warn(
    '[Stripe] STRIPE_SECRET_KEY is not set. ' +
      'Add it to .env.local and restart the dev server.'
  )
}

export const stripe: Stripe | null = key ? new Stripe(key) : null
