import { NextResponse } from 'next/server'
import {
  pickPublishableStripeKeyFromProcessEnv,
  publishableKeyIssueForResolvedKey,
  publishableSecretModeMismatchIssue,
} from '@/lib/stripe-publishable-env'

/**
 * Returns the Stripe publishable key for the browser, read from server env at request time.
 * Avoids stale/wrong values from client bundles that inlined NEXT_PUBLIC_* at compile time.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const { publishableKey, rawFallback } = pickPublishableStripeKeyFromProcessEnv(process.env)

  if (publishableKey) {
    const modeIssue = publishableSecretModeMismatchIssue(publishableKey, process.env.STRIPE_SECRET_KEY)
    if (modeIssue) {
      return NextResponse.json(
        { publishableKey: null as string | null, issue: modeIssue },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    return NextResponse.json({ publishableKey }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const issue = publishableKeyIssueForResolvedKey(rawFallback || null)
  return NextResponse.json(
    { publishableKey: null as string | null, issue: issue ?? 'Publishable key not configured.' },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
