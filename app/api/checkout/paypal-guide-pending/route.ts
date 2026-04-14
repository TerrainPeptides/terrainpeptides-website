import { NextResponse } from 'next/server'
import { getProductByIdAsync } from '@/lib/data'
import { orderLineFromCheckoutItem, type CheckoutCartItemPayload } from '@/lib/checkout-line'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { insertPendingCheckoutOrderWithItems } from '@/lib/supabase/order-persist'
import { normalizeOrdOrderNumber } from '@/lib/paypal-order-id'

const SHIPPING_CENTS = 2500
const HST_RATE = 0.13

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin()
    const body = (await request.json()) as {
      orderNumber?: string
      items?: CheckoutCartItemPayload[]
      shippingInfo?: {
        name: string
        email: string
        address1: string
        address2?: string
        city: string
        state: string
        zip: string
        country: string
      }
      referralCode?: string | null
      discountCents?: number
    }

    const normalized = normalizeOrdOrderNumber(String(body.orderNumber ?? ''))
    if (!normalized) {
      return NextResponse.json({ error: 'Invalid order number format (expected #ORD-######)' }, { status: 400 })
    }

    const { items, shippingInfo, referralCode, discountCents: rawDiscount } = body
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shippingInfo?.email || !shippingInfo?.name) {
      return NextResponse.json({ error: 'Shipping information required' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', normalized)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Order number already in use' }, { status: 409 })
    }

    const productIds = [...new Set(items.map((i) => String(i.productId)))]
    const products = await Promise.all(productIds.map((id) => getProductByIdAsync(id)))
    const byId = new Map(
      products.filter((p): p is NonNullable<typeof p> => p != null).map((p) => [p.id, p])
    )

    let subtotalCents = 0
    const orderItems: { product_id: string; product_name: string; quantity: number; price_cents: number }[] = []

    for (const item of items) {
      const product = byId.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 })
      }
      try {
        const line = orderLineFromCheckoutItem(product, item)
        subtotalCents += line.lineTotalCents
        orderItems.push({
          product_id: line.product_id,
          product_name: line.product_name,
          quantity: line.quantity,
          price_cents: line.price_cents,
        })
      } catch {
        return NextResponse.json({ error: 'Invalid dosage selection' }, { status: 400 })
      }
    }

    const finalDiscountCents = rawDiscount ?? 0
    const taxCents = shippingInfo.country === 'CA' ? Math.round((subtotalCents - finalDiscountCents) * HST_RATE) : 0
    const totalCents = subtotalCents - finalDiscountCents + SHIPPING_CENTS + taxCents

    const shippingPayload = {
      name: shippingInfo.name,
      address1: shippingInfo.address1,
      address2: shippingInfo.address2 ?? '',
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.zip,
      country: shippingInfo.country || 'US',
    }

    const now = new Date().toISOString()
    const persist = await insertPendingCheckoutOrderWithItems(supabase, {
      orderNumber: normalized,
      email: shippingInfo.email,
      customerName: shippingInfo.name,
      shippingPayload,
      subtotalCents,
      discountCents: finalDiscountCents,
      totalCents,
      referralCode: referralCode ?? null,
      now,
      lines: orderItems,
      payment: { mode: 'paypal', paypalOrderId: `paypal-guide-pending:${normalized}` },
    })

    if (!persist.ok) {
      console.error('[paypal-guide-pending]', persist.error)
      return NextResponse.json({ error: persist.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderNumber: normalized })
  } catch (error) {
    console.error('paypal-guide-pending error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
