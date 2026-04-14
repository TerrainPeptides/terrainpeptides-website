import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeOrderNumberForLookup } from '@/lib/paypal-order-id'

/**
 * Called from the checkout success page after Stripe redirects back.
 * Verifies payment with Stripe and marks the order paid (no webhook required).
 */
export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const body = await request.json()
    const sessionId = String(body.sessionId || '').trim()

    if (sessionId) {
      return confirmCheckoutSession(sessionId)
    }

    const orderNumber = normalizeOrderNumberForLookup(String(body.orderNumber || ''))
    const paymentIntentId = String(body.paymentIntentId || '').trim()

    if (!orderNumber || !paymentIntentId) {
      return NextResponse.json(
        { error: 'orderNumber and paymentIntentId are required (or pass sessionId)' },
        { status: 400 }
      )
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (intent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not completed yet', status: intent.status },
        { status: 400 }
      )
    }

    const metaOrder = normalizeOrderNumberForLookup(
      String(intent.metadata?.order_number || '')
    )
    if (metaOrder && metaOrder !== orderNumber) {
      return NextResponse.json({ error: 'Order number does not match payment' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, payment_status, referral_code')
      .eq('stripe_session_id', paymentIntentId)
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (fetchErr) {
      console.error('Confirm payment fetch order:', fetchErr)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found for this payment. Contact support with your order number.' },
        { status: 404 }
      )
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true, alreadyConfirmed: true })
    }

    const now = new Date().toISOString()
    const { data: updatedRows, error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        updated_at: now,
      })
      .eq('id', order.id)
      .eq('payment_status', 'pending')
      .select('id')

    if (updateErr) {
      console.error('Confirm payment update:', updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    const transitioned = Boolean(updatedRows?.length)
    if (!transitioned) {
      const { data: recheck } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('id', order.id)
        .maybeSingle()
      if (recheck?.payment_status === 'paid') {
        return NextResponse.json({ success: true, alreadyConfirmed: true })
      }
      return NextResponse.json({ error: 'Order could not be confirmed' }, { status: 409 })
    }

    if (order.referral_code) {
      const code = String(order.referral_code).toUpperCase()
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function confirmCheckoutSession(sessionId: string) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    return NextResponse.json(
      { error: 'Checkout session is not paid yet', status: session.payment_status },
      { status: 400 }
    )
  }

  const supabase = supabaseAdmin()
  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, payment_status, referral_code')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (fetchErr) {
    console.error('Confirm session fetch order:', fetchErr)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found for this checkout session' }, { status: 404 })
  }

  if (order.payment_status === 'paid') {
    return NextResponse.json({ success: true, alreadyConfirmed: true })
  }

  const now = new Date().toISOString()
  const { data: updatedRows, error: updateErr } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      updated_at: now,
    })
    .eq('id', order.id)
    .eq('payment_status', 'pending')
    .select('id')

  if (updateErr) {
    console.error('Confirm session update:', updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  if (!updatedRows?.length) {
    const { data: recheck } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', order.id)
      .maybeSingle()
    if (recheck?.payment_status === 'paid') {
      return NextResponse.json({ success: true, alreadyConfirmed: true })
    }
    return NextResponse.json({ error: 'Order could not be confirmed' }, { status: 409 })
  }

  if (order.referral_code) {
    const code = String(order.referral_code).toUpperCase()
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

  return NextResponse.json({ success: true })
}
