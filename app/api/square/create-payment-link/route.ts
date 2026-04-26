import { NextResponse } from 'next/server'
import { getProductByIdAsync } from '@/lib/data'
import { orderLineFromCheckoutItem, type CheckoutCartItemPayload } from '@/lib/checkout-line'
import { generateOrdOrderId } from '@/lib/paypal-order-id'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { insertPendingCheckoutOrderWithItems } from '@/lib/supabase/order-persist'

const SHIPPING_CENTS = 2500
const HST_RATE = 0.13

const SQUARE_BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'

interface ShippingInfo {
  name: string
  email: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
}

interface SquareLocation {
  id: string
  currency: string
}

async function resolveSquareLocation(accessToken: string): Promise<SquareLocation | null> {
  const configuredId = String(process.env.SQUARE_LOCATION_ID ?? '').trim()
  const configuredCurrency = String(process.env.SQUARE_CURRENCY ?? '').trim().toUpperCase()

  const res = await fetch(`${SQUARE_BASE_URL}/v2/locations`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Square-Version': '2024-10-17',
    },
  })

  if (!res.ok) {
    if (configuredId && configuredCurrency) {
      return { id: configuredId, currency: configuredCurrency }
    }
    return null
  }

  const data = (await res.json()) as {
    locations?: Array<{ id?: string; status?: string; currency?: string }>
  }

  const locations = data.locations ?? []

  // Prefer the configured location ID if specified, otherwise pick the first ACTIVE one
  const match = configuredId
    ? locations.find((l) => l.id === configuredId)
    : (locations.find((l) => l.status === 'ACTIVE' && l.id) ?? locations.find((l) => l.id))

  if (!match?.id) return null

  return {
    id: match.id,
    currency: configuredCurrency || match.currency || 'USD',
  }
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Square is not configured. Set SQUARE_ACCESS_TOKEN.' },
        { status: 503 }
      )
    }

    const squareLocation = await resolveSquareLocation(accessToken)
    if (!squareLocation) {
      return NextResponse.json(
        { error: 'Square merchant location could not be resolved. Check SQUARE_ACCESS_TOKEN.' },
        { status: 503 }
      )
    }
    const { id: locationId, currency: squareCurrency } = squareLocation

    const supabase = supabaseAdmin()
    const body = (await request.json()) as {
      items?: CheckoutCartItemPayload[]
      shippingInfo?: ShippingInfo
      referralCode?: string | null
      discountCents?: number
    }

    const { items, shippingInfo, referralCode, discountCents: rawDiscount } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shippingInfo?.email || !shippingInfo?.name) {
      return NextResponse.json({ error: 'Shipping information required' }, { status: 400 })
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
    const taxCents =
      shippingInfo.country === 'CA'
        ? Math.round((subtotalCents - finalDiscountCents) * HST_RATE)
        : 0
    const totalCents = subtotalCents - finalDiscountCents + SHIPPING_CENTS + taxCents

    const orderNumber = generateOrdOrderId()
    const origin = request.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? ''

    // Build Square line items — use the merchant account's currency (auto-detected from Square)
    const squareLineItems: object[] = orderItems.map((item) => ({
      name: item.product_name,
      quantity: String(item.quantity),
      base_price_money: {
        amount: item.price_cents,
        currency: squareCurrency,
      },
    }))

    // Discount as a negative line item
    if (finalDiscountCents > 0) {
      squareLineItems.push({
        name: `Discount${referralCode ? ` (${referralCode})` : ''}`,
        quantity: '1',
        base_price_money: {
          amount: -finalDiscountCents,
          currency: squareCurrency,
        },
      })
    }

    // Shipping line item
    squareLineItems.push({
      name: 'Shipping — flat rate',
      quantity: '1',
      base_price_money: {
        amount: SHIPPING_CENTS,
        currency: squareCurrency,
      },
    })

    // Tax line item (Canada only)
    if (taxCents > 0) {
      squareLineItems.push({
        name: 'Tax (13% HST)',
        quantity: '1',
        base_price_money: {
          amount: taxCents,
          currency: squareCurrency,
        },
      })
    }

    const squarePayload = {
      idempotency_key: `sq-${orderNumber}-${Date.now()}`,
      order: {
        location_id: locationId,
        reference_id: orderNumber,
        // Critical merchant-consistency fields
        note: 'Service Rendered - Royal Detailing',
        metadata: {
          statement_description_identifier: 'ROYAL DETAILING',
          order_number: orderNumber,
          customer_email: shippingInfo.email,
        },
        line_items: squareLineItems,
      },
      // Buyer-visible payment note
      payment_note: 'Service Rendered - Royal Detailing',
      checkout_options: {
        redirect_url: `${origin}/checkout/success?order=${encodeURIComponent(orderNumber)}&gateway=square`,
        merchant_support_email: shippingInfo.email,
        allow_tipping: false,
        enable_coupon: false,
        enable_loyalty: false,
      },
      pre_populated_data: {
        buyer_email: shippingInfo.email,
      },
    }

    const squareRes = await fetch(
      `${SQUARE_BASE_URL}/v2/online-checkout/payment-links`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Square-Version': '2024-10-17',
        },
        body: JSON.stringify(squarePayload),
      }
    )

    const squareData = (await squareRes.json()) as {
      payment_link?: { url: string; id: string }
      errors?: { detail: string }[]
    }

    if (!squareRes.ok || !squareData.payment_link?.url) {
      const detail = squareData.errors?.[0]?.detail ?? 'Could not create Square payment link'
      console.error('[square/create-payment-link] Square error:', squareData.errors)
      return NextResponse.json({ error: detail }, { status: 500 })
    }

    // Persist pending order in Supabase
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
      orderNumber,
      email: shippingInfo.email,
      customerName: shippingInfo.name,
      shippingPayload,
      subtotalCents,
      discountCents: finalDiscountCents,
      totalCents,
      referralCode: referralCode ?? null,
      now,
      lines: orderItems,
      // Reuse the stripe_session_id column to store the Square payment-link ID
      payment: { mode: 'stripe', stripeSessionOrPaymentIntentId: `square:${squareData.payment_link.id}` },
    })

    if (!persist.ok) {
      console.error('[square/create-payment-link] DB persist error:', persist.error)
    }

    return NextResponse.json({
      paymentUrl: squareData.payment_link.url,
      orderNumber,
    })
  } catch (error) {
    console.error('[square/create-payment-link] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
