import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeOrdOrderNumber } from '@/lib/paypal-order-id'

/**
 * Customer finished PayPal.me flow and confirmed in-app (manual PayPal guide checkout).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderNumber?: string
      paypalTransactionId?: string | null
    }

    const normalized = normalizeOrdOrderNumber(String(body.orderNumber ?? ''))
    if (!normalized) {
      return NextResponse.json({ error: 'Invalid order number' }, { status: 400 })
    }

    const txn = String(body.paypalTransactionId ?? '').trim()
    const supabase = supabaseAdmin()
    const now = new Date().toISOString()

    const sessionValue = txn
      ? `paypal-guide:${txn}`
      : 'paypal-guide:confirmed-no-txn-id'

    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('order_number', normalized)
      .maybeSingle()

    if (fetchErr) {
      console.error('paypal-guide-confirm fetch:', fetchErr)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true, alreadyConfirmed: true })
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        stripe_session_id: sessionValue,
        updated_at: now,
      })
      .eq('id', order.id)

    if (updateErr) {
      console.error('paypal-guide-confirm update:', updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('paypal-guide-confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
