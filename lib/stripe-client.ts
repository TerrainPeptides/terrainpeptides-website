import { loadStripe, type Stripe } from '@stripe/stripe-js'

import { publishableKeyIssueForResolvedKey } from '@/lib/stripe-publishable-env'

type ClientConfigResponse = { publishableKey: string | null; issue?: string }

async function fetchPublishableKeyFromServer(): Promise<{ key: string | null; issue: string | null }> {
  try {
    const res = await fetch('/api/stripe/client-config', { cache: 'no-store' })
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

let cachedKey = ''
let cachedPromise: Promise<Stripe | null> | null = null

/**
 * Loads Stripe.js using the publishable key from `/api/stripe/client-config`
 * (server reads .env at request time — avoids stale NEXT_PUBLIC inlining in the client bundle).
 */
export function getStripePromise(): Promise<Stripe | null> {
  return (async () => {
    const { key } = await resolveClientConfig()
    if (!key) {
      cachedKey = ''
      cachedPromise = null
      return null
    }
    if (key !== cachedKey) {
      cachedKey = key
      cachedPromise = loadStripe(key)
    }
    return cachedPromise
  })()
}
