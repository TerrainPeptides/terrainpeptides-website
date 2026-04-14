import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeOrderNumberForLookup } from '@/lib/paypal-order-id'

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin()
    const body = await request.json()
    const { orderNumber, email } = body

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      )
    }

    const emailLower = String(email).toLowerCase()
    const orderNumLookup = normalizeOrderNumberForLookup(String(orderNumber))
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumLookup)
      .maybeSingle()
    if (error) throw error

    if (!order) {
      return NextResponse.json({ order: null })
    }

    const rowEmail = String(
      (order as { customer_email?: string; email?: string }).customer_email ??
        (order as { email?: string }).email ??
        ''
    ).toLowerCase()
    if (rowEmail !== emailLower) {
      return NextResponse.json({ order: null })
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    const o = order as Record<string, unknown>
    const subtotal_cents =
      o.subtotal_cents != null
        ? Number(o.subtotal_cents)
        : Math.round(Number(o.subtotal || 0) * 100)
    const discount_cents =
      o.discount_cents != null
        ? Number(o.discount_cents)
        : Math.round(Number(o.discount || 0) * 100)
    const total_cents =
      o.total_cents != null ? Number(o.total_cents) : Math.round(Number(o.total || 0) * 100)

    return NextResponse.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        email: (o.customer_email ?? o.email) as string,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        stripe_session_id: order.stripe_session_id,
        crypto_address: order.crypto_address,
        subtotal_cents,
        discount_cents,
        total_cents,
        shipping_address: order.shipping_address,
        tracking_number: order.tracking_number,
        referral_code: order.referral_code,
        discount_code: order.discount_code,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: (items || []).map((i: Record<string, unknown>) => ({
          id: i.id,
          order_id: i.order_id,
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          price_cents:
            i.price_cents != null
              ? Number(i.price_cents)
              : Math.round(Number(i.price || 0) * 100),
          created_at: i.created_at,
        })),
      },
    })
  } catch (error) {
    console.error('Track order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
