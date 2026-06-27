import Stripe from 'stripe'

/** User-safe message for Stripe API failures (checkout / payment routes). */
export function stripeApiErrorMessage(error: unknown): string {
  if (error instanceof Stripe.errors.StripeAuthenticationError) {
    const code = error.code ?? ''
    if (code === 'api_key_expired' || /expired api key/i.test(error.message)) {
      return (
        'Stripe secret key has expired. In Stripe Dashboard → Developers → API keys, create a new secret key, ' +
        'then update STRIPE_SECRET_KEY in Vercel (Production) and redeploy.'
      )
    }
    return (
      'Stripe secret key is invalid. Confirm STRIPE_SECRET_KEY in Vercel matches your live secret key ' +
      '(sk_live_…) from Stripe Dashboard → Developers → API keys.'
    )
  }

  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return error.message || 'Stripe rejected the payment request.'
  }

  if (error instanceof Error) {
    if (/missing env var/i.test(error.message)) {
      return `Server configuration error: ${error.message}`
    }
    return error.message
  }

  return 'Payment service is temporarily unavailable. Please try again.'
}

export function stripeApiErrorStatus(error: unknown): number {
  if (error instanceof Stripe.errors.StripeAuthenticationError) return 503
  if (error instanceof Stripe.errors.StripeInvalidRequestError) return 400
  if (error instanceof Error && /missing env var/i.test(error.message)) return 503
  return 500
}
