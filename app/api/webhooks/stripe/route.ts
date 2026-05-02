import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/** Lets you confirm the route is deployed (Stripe still sends only POST webhooks). */
export async function GET() {
  const hasSecret = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  const hasStripe = Boolean(stripe)
  return NextResponse.json({
    ok: true,
    endpoint: 'stripe-webhooks',
    stripeSdk: hasStripe,
    webhookSecretConfigured: hasSecret,
  })
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not set. Add the whsec_… value from Stripe Dashboard → Webhooks → your endpoint.' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    // ── Stripe Checkout Session (legacy hosted checkout) ─────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const supabase = supabaseAdmin()
      const { data: updated } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)
        .eq('payment_status', 'pending')
        .select('id, referral_code')
      const row = updated?.[0]
      if (row?.referral_code) {
        const code = String(row.referral_code).toUpperCase()
        const { data: rc } = await supabase
          .from('referral_codes')
          .select('id, current_uses')
          .eq('code', code)
          .maybeSingle()
        if (rc) {
          await supabase
            .from('referral_codes')
            .update({ current_uses: (rc.current_uses || 0) + 1 })
            .eq('id', rc.id)
        }
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const supabase = supabaseAdmin()
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)
      break
    }

    // ── Stripe Elements / PaymentIntent ───────────────────────────────────────
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      const supabase = supabaseAdmin()
      const { data: updated } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', intent.id)
        .eq('payment_status', 'pending')
        .select('id, referral_code')
      const row = updated?.[0]
      if (row?.referral_code) {
        const code = String(row.referral_code).toUpperCase()
        const { data: rc } = await supabase
          .from('referral_codes')
          .select('id, current_uses')
          .eq('code', code)
          .maybeSingle()
        if (rc) {
          await supabase
            .from('referral_codes')
            .update({ current_uses: (rc.current_uses || 0) + 1 })
            .eq('id', rc.id)
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      const supabase = supabaseAdmin()
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', intent.id)
      break
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
