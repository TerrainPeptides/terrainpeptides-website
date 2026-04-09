import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) {
    throw new Error('PayPal credentials not configured')
  }
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = (await res.json()) as { access_token?: string; error_description?: string }
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? 'Failed to get PayPal access token')
  }
  return data.access_token
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { paypalOrderId?: string }
    const paypalOrderId = String(body.paypalOrderId ?? '').trim()

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'paypalOrderId is required' }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    // Capture the payment via PayPal API
    const captureRes = await fetch(`${paypalBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = (await captureRes.json()) as {
      id?: string
      status?: string
      purchase_units?: {
        reference_id?: string
        payments?: {
          captures?: { id: string; status: string }[]
        }
      }[]
      message?: string
      details?: unknown[]
    }

    if (!captureRes.ok) {
      console.error('PayPal capture error:', captureData)
      return NextResponse.json(
        { error: captureData.message ?? 'PayPal capture failed' },
        { status: captureRes.status }
      )
    }

    const captureStatus = captureData.status
    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: `PayPal order not completed (status: ${captureStatus})` },
        { status: 400 }
      )
    }

    // Derive order number from the PayPal purchase_unit reference_id
    const referenceId = captureData.purchase_units?.[0]?.reference_id ?? ''

    // Mark the order as paid in Supabase
    const supabase = supabaseAdmin()
    const now = new Date().toISOString()

    // Look up by PayPal order ID stored in stripe_session_id column
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, payment_status, referral_code, order_number')
      .eq('stripe_session_id', paypalOrderId)
      .maybeSingle()

    if (fetchErr) {
      console.error('PayPal capture: fetch order error', fetchErr)
      return NextResponse.json({ error: 'Database error looking up order' }, { status: 500 })
    }

    if (!order) {
      // Order may not have persisted (rare DB failure at create-order time); still return success
      // so the customer sees a success page — admin can reconcile via PayPal dashboard.
      console.warn(`PayPal capture: order not found in DB for PayPal ID ${paypalOrderId}`)
      return NextResponse.json({
        success: true,
        orderNumber: referenceId || null,
        warning: 'Order record not found in database. Contact support with your PayPal transaction ID.',
      })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true, orderNumber: order.order_number, alreadyConfirmed: true })
    }

    const { data: updatedRows, error: updateErr } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'processing', updated_at: now })
      .eq('id', order.id)
      .eq('payment_status', 'pending')
      .select('id')

    if (updateErr) {
      console.error('PayPal capture: update error', updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    if (!updatedRows?.length) {
      const { data: recheck } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('id', order.id)
        .maybeSingle()
      if (recheck?.payment_status === 'paid') {
        return NextResponse.json({ success: true, orderNumber: order.order_number, alreadyConfirmed: true })
      }
      return NextResponse.json({ error: 'Order could not be confirmed' }, { status: 409 })
    }

    // Increment referral code usage if applicable
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

    return NextResponse.json({ success: true, orderNumber: order.order_number })
  } catch (error) {
    console.error('PayPal capture-order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
