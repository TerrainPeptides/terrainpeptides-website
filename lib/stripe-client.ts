import { loadStripe, type Stripe } from '@stripe/stripe-js'

import { publishableKeyIssueForResolvedKey } from '@/lib/stripe-publishable-env'

type ClientConfigResponse = { publishableKey: string | null; issue?: string }

async function fetchPublishableKeyFromServer(): Promise<{ key: string | null; issue: string | null }> {
  try {
    const res = await fetch('/api/stripe/client-config', {
      cache: 'no-store',
      credentials: 'same-origin',
    })
    const data = (await res.json()) as ClientConfigResponse
    const key = typeof data.publishableKey === 'string' ? data.publishableKey.trim() : null
    if (key) return { key, issue: null }
    const issue =
      typeof data.issue === 'string'
        ? data.issue
        : publishableKeyIssueForResolvedKey(null)
    return { key: null, issue }
  } catch {
    return {
      key: null,
      issue: 'Could not load Stripe configuration from the server. Check your network and try again.',
    }
  }
}

/** Deduplicate concurrent reads (e.g. issue check + loadStripe in the same tick). */
let inflightConfig: Promise<{ key: string | null; issue: string | null }> | null = null

function resolveClientConfig(): Promise<{ key: string | null; issue: string | null }> {
  if (!inflightConfig) {
    inflightConfig = fetchPublishableKeyFromServer().finally(() => {
      inflightConfig = null
    })
  }
  return inflightConfig
}

export async function getStripePublishableKeyIssueAsync(): Promise<string | null> {
  const { key, issue } = await resolveClientConfig()
  if (key) return null
  return issue ?? publishableKeyIssueForResolvedKey(null)
}

let cachedKeyForStripe: string | null = null
let cachedStripePromise: Promise<Stripe | null> | null = null

/**
 * Loads Stripe.js using the publishable key from `/api/stripe/client-config`
 * (server reads .env at request time — avoids stale NEXT_PUBLIC inlining in the client bundle).
 *
 * If `loadStripe` rejects (bad key, network), we clear the cache so the next call can retry
 * instead of returning a permanently rejected promise (a common “Stripe broke after one error” bug).
 */
export function getStripePromise(): Promise<Stripe | null> {
  return (async () => {
    const { key } = await resolveClientConfig()
    if (!key) {
      cachedKeyForStripe = null
      cachedStripePromise = null
      return null
    }

    if (key === cachedKeyForStripe && cachedStripePromise) {
      return cachedStripePromise
    }

    cachedKeyForStripe = key
    cachedStripePromise = loadStripe(key).catch((err: unknown) => {
      cachedKeyForStripe = null
      cachedStripePromise = null
      throw err instanceof Error ? err : new Error('Failed to load Stripe.js')
    })

    return cachedStripePromise
  })()
}
