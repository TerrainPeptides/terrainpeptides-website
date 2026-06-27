import { stripe } from '@/lib/stripe'
import { getProductByIdAsync } from '@/lib/data'
import { NextResponse } from 'next/server'
import { orderLineFromCheckoutItem, type CheckoutCartItemPayload } from '@/lib/checkout-line'
import { generateOrdOrderId } from '@/lib/paypal-order-id'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { insertPendingStripeOrderWithItems } from '@/lib/supabase/order-persist'
import { stripeApiErrorMessage, stripeApiErrorStatus } from '@/lib/stripe-api-error'

/** Card charges on PaymentIntents require suffix, not full statement_descriptor. */
const STATEMENT_DESCRIPTOR_SUFFIX = 'Royal Auto Detailing'
const HST_RATE = 0.13

interface ShippingInfo {
  name: string
  email: string
  phone?: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country?: string
}

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
        { status: 503 }
      )
    }

    const supabase = supabaseAdmin()
    const body = await request.json()
    const {
      items,
      shippingInfo,
      referralCode,
      discountCents,
      shippingCents: shippingCentsParam,
    }: {
      items: CheckoutCartItemPayload[]
      shippingInfo: ShippingInfo
      referralCode?: string
      discountCents?: number
      shippingCents?: number
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!shippingInfo?.email || !shippingInfo?.name) {
      return NextResponse.json({ error: 'Shipping information required' }, { status: 400 })
    }

    const productIds = [...new Set(items.map((i) => i.productId))]
    const products = await Promise.all(productIds.map((id) => getProductByIdAsync(id)))
    const byId = new Map(
      products.filter((p): p is NonNullable<typeof p> => p != null).map((p) => [p.id, p])
    )

    let subtotalCents = 0
    const orderItems: {
      product_id: string
      product_name: string
      quantity: number
      price_cents: number
    }[] = []

    for (const item of items) {
      const product = byId.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: 'Invalid products' }, { status: 400 })
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

    const finalDiscountCents = discountCents ?? 0
    const finalShippingCents = typeof shippingCentsParam === 'number' ? shippingCentsParam : 2499

    const countryCode = (shippingInfo.country ?? 'US').toUpperCase()
    const afterDiscount = subtotalCents - finalDiscountCents
    const taxCents = countryCode === 'CA' ? Math.round(afterDiscount * HST_RATE) : 0

    // Stripe minimum is 50 cents
    const totalCents = Math.max(afterDiscount + finalShippingCents + taxCents, 50)
    const orderNumber = generateOrdOrderId()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      // Card-only keeps the Payment Element simple and avoids loading many PM types from the Dashboard.
      payment_method_types: ['card'],
      receipt_email: shippingInfo.email,
      statement_descriptor_suffix: STATEMENT_DESCRIPTOR_SUFFIX,
      metadata: {
        order_number: orderNumber,
        referral_code: referralCode || '',
      },
    })

    const emailNorm = (shippingInfo.email || '').trim().toLowerCase()
    const shippingPayload = {
      name: shippingInfo.name,
      email: emailNorm,
      phone: (shippingInfo.phone || '').trim(),
      company: (shippingInfo.company || '').trim(),
      address1: shippingInfo.address1 || '',
      address2: shippingInfo.address2 || '',
      city: shippingInfo.city || '',
      state: shippingInfo.state || '',
      zip: shippingInfo.zip || '',
      country: countryCode,
      shipping_cents: finalShippingCents,
      tax_cents: taxCents,
    }

    const now = new Date().toISOString()

    const persist = await insertPendingStripeOrderWithItems(supabase, {
      orderNumber,
      paymentIntentId: paymentIntent.id,
      email: shippingInfo.email,
      customerName: shippingInfo.name,
      shippingPayload,
      subtotalCents,
      discountCents: finalDiscountCents,
      totalCents,
      referralCode: referralCode || null,
      now,
      lines: orderItems,
    })

    if (!persist.ok) {
      console.error('Order persist error:', persist.error)
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {})
      return NextResponse.json(
        { error: 'Could not save your order. Please try again.', details: persist.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: stripeApiErrorMessage(error) },
      { status: stripeApiErrorStatus(error) }
    )
  }
}
