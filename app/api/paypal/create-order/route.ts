import { NextResponse } from 'next/server'
import { getProductByIdAsync } from '@/lib/data'
import { orderLineFromCheckoutItem, type CheckoutCartItemPayload } from '@/lib/checkout-line'
import { generateOrdOrderId } from '@/lib/paypal-order-id'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { insertPendingCheckoutOrderWithItems } from '@/lib/supabase/order-persist'

const SHIPPING_CENTS = 2500
const HST_RATE = 0.13

function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) {
    throw new Error('PayPal credentials not configured (NEXT_PUBLIC_PAYPAL_CLIENT_ID / PAYPAL_SECRET)')
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
    const supabase = supabaseAdmin()
    const body = (await request.json()) as {
      items: CheckoutCartItemPayload[]
      shippingInfo: {
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

    const { items, shippingInfo, referralCode, discountCents: rawDiscount } = body

    console.log('[paypal/create-order] incoming request body (cart + totals inputs)', {
      itemCount: items?.length,
      items: JSON.parse(JSON.stringify(items ?? [])),
      referralCode,
      discountCents: rawDiscount,
    })

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shippingInfo?.email || !shippingInfo?.name) {
      return NextResponse.json({ error: 'Shipping information required' }, { status: 400 })
    }

    // Re-derive totals server-side (never trust client-supplied price)
    const productIds = [...new Set(items.map((i) => String(i.productId)))]
    const products = await Promise.all(productIds.map((id) => getProductByIdAsync(id)))
    const byId = new Map(
      products
        .filter((p): p is NonNullable<typeof p> => p != null)
        .map((p) => [p.id, p])
    )

    let subtotalCents = 0
    const orderItems: { product_id: string; product_name: string; quantity: number; price_cents: number }[] = []

    for (const item of items) {
      const product = byId.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 })
      }
      console.log('[paypal/create-order] resolving line item (before orderLineFromCheckoutItem)', {
        cartLine: item,
        loadedProduct: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price_cents: product.price_cents,
          dosage: product.dosage,
          vial_count: product.vial_count,
          dosage_variants: product.dosage_variants,
        },
      })
      try {
        const line = orderLineFromCheckoutItem(product, item)
        subtotalCents += line.lineTotalCents
        orderItems.push({
          product_id: line.product_id,
          product_name: line.product_name,
          quantity: line.quantity,
          price_cents: line.price_cents,
        })
      } catch (err) {
        console.error('[paypal/create-order] orderLineFromCheckoutItem threw — returning Invalid dosage selection', {
          cartLine: item,
          productId: product.id,
          productName: product.name,
          error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
        })
        return NextResponse.json({ error: 'Invalid dosage selection' }, { status: 400 })
      }
    }

    const finalDiscountCents = rawDiscount ?? 0
    const taxCents = shippingInfo.country === 'CA' ? Math.round((subtotalCents - finalDiscountCents) * HST_RATE) : 0
    const totalCents = subtotalCents - finalDiscountCents + SHIPPING_CENTS + taxCents
    const totalUsd = (totalCents / 100).toFixed(2)

    const orderNumber = generateOrdOrderId()
    const shippingPayload = {
      name: shippingInfo.name,
      address1: shippingInfo.address1,
      address2: shippingInfo.address2 ?? '',
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.zip,
      country: shippingInfo.country || 'USA',
    }

    // Create PayPal order
    const accessToken = await getAccessToken()
    const origin =
      request.headers.get('origin') ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'

    const paypalRes = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': orderNumber,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderNumber,
            description: `Terrain Peptides Order ${orderNumber}`,
            amount: {
              currency_code: 'USD',
              value: totalUsd,
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'Terrain Peptides',
              locale: 'en-US',
              landing_page: 'NO_PREFERENCE',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: `${origin}/checkout/confirmation`,
              cancel_url: `${origin}/checkout`,
            },
          },
        },
      }),
    })

    const paypalOrder = (await paypalRes.json()) as {
      id?: string
      links?: { rel: string; href: string }[]
      message?: string
      details?: unknown[]
    }

    if (!paypalRes.ok || !paypalOrder.id) {
      console.error('PayPal create order error:', paypalOrder)
      throw new Error(paypalOrder.message ?? 'PayPal order creation failed')
    }

    const approvalUrl = paypalOrder.links?.find((l) => l.rel === 'payer-action')?.href
    if (!approvalUrl) {
      throw new Error('PayPal did not return an approval URL')
    }

    // Persist order in Supabase (non-fatal if it fails — PayPal payment still proceeds)
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
      payment: { mode: 'paypal', paypalOrderId: paypalOrder.id },
    })
    if (!persist.ok) {
      console.error('PayPal order Supabase persist failed:', persist.error)
    }

    return NextResponse.json({
      approvalUrl,
      orderNumber,
      paypalOrderId: paypalOrder.id,
    })
  } catch (error) {
    console.error('PayPal create-order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
