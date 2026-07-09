import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeOrderNumberForLookup } from '@/lib/paypal-order-id'
import {
  nameMatches,
  normalizeName,
  normalizePhone,
  normalizeZip,
  orderEmail,
  phoneMatches,
  shippingName,
  shippingPhone,
  shippingZip,
  zipMatches,
  type TrackLookupMethod,
} from '@/lib/order-track'

function formatOrderResponse(order: Record<string, unknown>, items: Record<string, unknown>[]) {
  const subtotal_cents =
    order.subtotal_cents != null
      ? Number(order.subtotal_cents)
      : Math.round(Number(order.subtotal || 0) * 100)
  const discount_cents =
    order.discount_cents != null
      ? Number(order.discount_cents)
      : Math.round(Number(order.discount || 0) * 100)
  const total_cents =
    order.total_cents != null ? Number(order.total_cents) : Math.round(Number(order.total || 0) * 100)

  return {
    id: order.id,
    order_number: order.order_number,
    email: (order.customer_email ?? order.email) as string,
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
    items: items.map((i) => ({
      id: i.id,
      order_id: i.order_id,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      price_cents:
        i.price_cents != null ? Number(i.price_cents) : Math.round(Number(i.price || 0) * 100),
      created_at: i.created_at,
    })),
  }
}

async function loadOrderItems(supabase: ReturnType<typeof supabaseAdmin>, orderId: string) {
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId)
  return (items || []) as Record<string, unknown>[]
}

function pickBestMatch(orders: Record<string, unknown>[], zip: string): Record<string, unknown> | null {
  const matched = orders.filter((o) => zipMatches(shippingZip(o), zip))
  if (matched.length === 0) return null
  matched.sort(
    (a, b) =>
      new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime()
  )
  return matched[0]
}

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin()
    const body = await request.json()

    const zip = String(body.zip ?? '').trim()
    if (!zip || normalizeZip(zip).length < 5) {
      return NextResponse.json({ error: 'A valid ZIP code is required' }, { status: 400 })
    }

    const method = (body.method as TrackLookupMethod | undefined) ?? 'order'

    // Legacy PayPal redirect: order number + email (no zip)
    const legacyOrder = body.orderNumber ? String(body.orderNumber).trim() : ''
    const legacyEmail = body.email ? String(body.email).toLowerCase().trim() : ''
    if (legacyOrder && legacyEmail && !body.method && !body.zip) {
      const orderNumLookup = normalizeOrderNumberForLookup(legacyOrder)
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumLookup)
        .maybeSingle()
      if (error) throw error
      if (!order || orderEmail(order as Record<string, unknown>) !== legacyEmail) {
        return NextResponse.json({ order: null })
      }
      const items = await loadOrderItems(supabase, String(order.id))
      return NextResponse.json({ order: formatOrderResponse(order as Record<string, unknown>, items) })
    }

    if (method === 'order') {
      const orderNumber = String(body.orderNumber ?? '').trim()
      if (!orderNumber) {
        return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
      }
      const orderNumLookup = normalizeOrderNumberForLookup(orderNumber)
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumLookup)
        .maybeSingle()
      if (error) throw error
      if (!order || !zipMatches(shippingZip(order as Record<string, unknown>), zip)) {
        return NextResponse.json({ order: null })
      }
      const items = await loadOrderItems(supabase, String(order.id))
      return NextResponse.json({ order: formatOrderResponse(order as Record<string, unknown>, items) })
    }

    if (method === 'email') {
      const email = String(body.email ?? '').toLowerCase().trim()
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }
      const { data: byCustomer, error: e1 } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
        .limit(20)
      if (e1) throw e1
      const { data: byLegacy, error: e2 } = await supabase
        .from('orders')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(20)
      if (e2) throw e2
      const combined = [...(byCustomer || []), ...(byLegacy || [])] as Record<string, unknown>[]
      const unique = [...new Map(combined.map((o) => [o.id, o])).values()]
      const match = pickBestMatch(unique, zip)
      if (!match) return NextResponse.json({ order: null })
      const items = await loadOrderItems(supabase, String(match.id))
      return NextResponse.json({ order: formatOrderResponse(match, items) })
    }

    if (method === 'name') {
      const name = String(body.name ?? '').trim()
      if (!name) {
        return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
      }
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      const normalized = normalizeName(name)
      const match = (orders || [])
        .filter((o) => {
          const row = o as Record<string, unknown>
          return (
            zipMatches(shippingZip(row), zip) &&
            (nameMatches(shippingName(row), normalized) ||
              nameMatches(String(row.customer_name ?? ''), normalized))
          )
        })
        .sort(
          (a, b) =>
            new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime()
        )[0] as Record<string, unknown> | undefined
      if (!match) return NextResponse.json({ order: null })
      const items = await loadOrderItems(supabase, String(match.id))
      return NextResponse.json({ order: formatOrderResponse(match, items) })
    }

    if (method === 'phone') {
      const phone = String(body.phone ?? '').trim()
      if (!phone || normalizePhone(phone).length < 10) {
        return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 })
      }
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      const match = (orders || [])
        .filter((o) => {
          const row = o as Record<string, unknown>
          return zipMatches(shippingZip(row), zip) && phoneMatches(shippingPhone(row), phone)
        })
        .sort(
          (a, b) =>
            new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime()
        )[0] as Record<string, unknown> | undefined
      if (!match) return NextResponse.json({ order: null })
      const items = await loadOrderItems(supabase, String(match.id))
      return NextResponse.json({ order: formatOrderResponse(match, items) })
    }

    return NextResponse.json({ error: 'Invalid lookup method' }, { status: 400 })
  } catch (error) {
    console.error('Track order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
