import { stripe } from '@/lib/stripe'
import { getProductByIdAsync } from '@/lib/data'
import { NextResponse } from 'next/server'
import { orderLineFromCheckoutItem, type CheckoutCartItemPayload } from '@/lib/checkout-line'
import { nanoid } from 'nanoid'
import { generateOrdOrderId } from '@/lib/paypal-order-id'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { insertPendingCheckoutOrderWithItems } from '@/lib/supabase/order-persist'

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin()
    const body = await request.json()
    const { items, paymentMethod, shippingInfo, referralCode, discountCents } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!shippingInfo?.email || !shippingInfo?.name) {
      return NextResponse.json(
        { error: 'Shipping information required' },
        { status: 400 }
      )
    }

    const productIds = [
      ...new Set(
        (items as CheckoutCartItemPayload[]).map((item) => String(item.productId))
      ),
    ]
    const products = await Promise.all(productIds.map((id) => getProductByIdAsync(id)))
    const byId = new Map(products.filter((p): p is NonNullable<typeof p> => p != null).map((p) => [p.id, p]))

    let subtotalCents = 0
    const orderItems: {
      product_id: string
      product_name: string
      quantity: number
      price_cents: number
    }[] = []

    for (const item of items as CheckoutCartItemPayload[]) {
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

    const finalDiscountCents = discountCents || 0
    const totalCents = subtotalCents - finalDiscountCents
    const orderNumber = generateOrdOrderId()
    const shippingPayload = {
      name: shippingInfo.name,
      address1: shippingInfo.address1,
      address2: shippingInfo.address2 || '',
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.zip,
      country: 'USA',
    }

    if (paymentMethod === 'stripe') {
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
          { status: 503 }
        )
      }
      const lineItems = orderItems.map((item: { product_name: string; quantity: number; price_cents: number }) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.product_name },
          unit_amount: item.price_cents,
        },
        quantity: item.quantity,
      }))

      if (finalDiscountCents > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Discount${referralCode ? ` (${referralCode})` : ''}`,
            },
            unit_amount: -finalDiscountCents,
          },
          quantity: 1,
        })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/checkout`,
        customer_email: shippingInfo.email,
        metadata: {
          order_number: orderNumber,
          referral_code: referralCode || '',
        },
      })

      const now = new Date().toISOString()
      const persist = await insertPendingCheckoutOrderWithItems(supabase, {
        orderNumber,
        email: shippingInfo.email,
        customerName: shippingInfo.name,
        shippingPayload,
        subtotalCents,
        discountCents: finalDiscountCents,
        totalCents,
        referralCode: referralCode || null,
        now,
        lines: orderItems,
        payment: { mode: 'stripe', stripeSessionOrPaymentIntentId: session.id },
      })
      if (!persist.ok) throw new Error(persist.error)

      return NextResponse.json({
        checkoutUrl: session.url,
        orderNumber,
      })
    }

    if (paymentMethod === 'crypto') {
      const cryptoAddress = '0x' + nanoid(40).toLowerCase().replace(/[^a-f0-9]/g, 'a')

      const now = new Date().toISOString()
      const persist = await insertPendingCheckoutOrderWithItems(supabase, {
        orderNumber,
        email: shippingInfo.email,
        customerName: shippingInfo.name,
        shippingPayload,
        subtotalCents,
        discountCents: finalDiscountCents,
        totalCents,
        referralCode: referralCode || null,
        now,
        lines: orderItems,
        payment: { mode: 'crypto', cryptoAddress },
      })
      if (!persist.ok) throw new Error(persist.error)

      return NextResponse.json({
        orderNumber,
        cryptoAddress,
        totalUsd: (totalCents / 100).toFixed(2),
      })
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
