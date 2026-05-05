import type { SupabaseClient } from '@supabase/supabase-js'

export type PersistedOrderSchema = 'modern' | 'modern_min' | 'legacy'

export interface ShippingPayload {
  name: string
  /** Checkout email (may match customer_email on the order row). */
  email?: string
  phone?: string
  company?: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  /** Optional snapshot for admin / receipts (stored inside shipping_address JSON). */
  shipping_cents?: number
  tax_cents?: number
}

export interface OrderLineInput {
  product_id: string
  product_name: string
  quantity: number
  price_cents: number
}

function isLikelyColumnMismatch(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('column') ||
    m.includes('schema cache') ||
    m.includes('could not find') ||
    m.includes('unknown field') ||
    m.includes('invalid input syntax for type uuid')
  )
}

function withoutColumn(row: Record<string, unknown>, column: string): Record<string, unknown> {
  const next = { ...row }
  delete next[column]
  return next
}

export type CheckoutPayment =
  | { mode: 'stripe'; stripeSessionOrPaymentIntentId: string }
  | { mode: 'crypto'; cryptoAddress: string }
  | { mode: 'paypal'; paypalOrderId: string }

/**
 * Inserts a pending order + line items for Stripe Elements, hosted Checkout, or crypto.
 * Supports both `supabase-schema.sql` (customer_email, dollar totals) and older schemas
 * (`email`, total_cents, subtotal_cents, discount_cents, UUID ids).
 */
export async function insertPendingCheckoutOrderWithItems(
  supabase: SupabaseClient,
  args: {
    orderNumber: string
    email: string
    customerName: string
    shippingPayload: ShippingPayload
    subtotalCents: number
    discountCents: number
    totalCents: number
    referralCode: string | null
    now: string
    lines: OrderLineInput[]
    payment: CheckoutPayment
  }
): Promise<
  | { ok: true; orderId: string; schema: PersistedOrderSchema }
  | { ok: false; error: string }
> {
  const {
    orderNumber,
    email,
    customerName,
    shippingPayload,
    subtotalCents,
    discountCents,
    totalCents,
    referralCode,
    now,
    lines,
    payment,
  } = args

  const emailLower = email.toLowerCase()
  const isStripe = payment.mode === 'stripe'
  const isPaypal = payment.mode === 'paypal'
  const paymentMethodLabel = isStripe ? 'stripe' : isPaypal ? 'paypal' : 'crypto'
  const sessionIdValue = isStripe
    ? payment.stripeSessionOrPaymentIntentId
    : isPaypal
      ? payment.paypalOrderId
      : null
  const modernBase = {
    order_number: orderNumber,
    status: 'pending',
    tracking_number: null as string | null,
    referral_code: referralCode,
    payment_method: paymentMethodLabel,
    payment_status: 'pending',
    stripe_session_id: sessionIdValue,
    crypto_address: payment.mode === 'crypto' ? payment.cryptoAddress : null,
    shipping_address: shippingPayload as unknown as Record<string, unknown>,
    created_at: now,
    updated_at: now,
  }

  const discountCodeValue = referralCode?.trim() ? referralCode.trim() : null

  const modernRowFull: Record<string, unknown> = {
    id: crypto.randomUUID(),
    ...modernBase,
    customer_email: emailLower,
    customer_name: customerName,
    total: totalCents / 100,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    discount_code: discountCodeValue,
  }

  const modernMinRowFull: Record<string, unknown> = {
    id: crypto.randomUUID(),
    ...modernBase,
    customer_email: emailLower,
    customer_name: customerName,
    total: totalCents / 100,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    discount_code: discountCodeValue,
  }

  const legacyRowFull: Record<string, unknown> = {
    id: crypto.randomUUID(),
    order_number: orderNumber,
    email: emailLower,
    status: 'pending',
    payment_method: paymentMethodLabel,
    payment_status: 'pending',
    stripe_session_id: sessionIdValue,
    crypto_address: payment.mode === 'crypto' ? payment.cryptoAddress : null,
    subtotal_cents: subtotalCents,
    discount_cents: discountCents,
    total_cents: totalCents,
    shipping_address: shippingPayload as unknown as Record<string, unknown>,
    tracking_number: null,
    referral_code: referralCode,
    discount_code: discountCodeValue,
    created_at: now,
    updated_at: now,
  }

  /** Older DBs may omit `discount_code`; try with column first, then without. */
  const attempts: Array<{
    schema: PersistedOrderSchema
    row: Record<string, unknown>
  }> = [
    { schema: 'modern', row: modernRowFull },
    { schema: 'modern', row: withoutColumn(modernRowFull, 'discount_code') },
    { schema: 'modern_min', row: modernMinRowFull },
    { schema: 'modern_min', row: withoutColumn(modernMinRowFull, 'discount_code') },
    { schema: 'legacy', row: legacyRowFull },
    { schema: 'legacy', row: withoutColumn(legacyRowFull, 'discount_code') },
  ]

  let lastError = ''
  for (const { schema, row } of attempts) {
    const { error } = await supabase.from('orders').insert(row as never)
    if (error) {
      lastError = error.message
      if (!isLikelyColumnMismatch(error.message)) {
        return { ok: false, error: error.message }
      }
      continue
    }

    const orderId = String(row.id)
    const itemResult = await insertOrderItemsForSchema(
      supabase,
      schema,
      orderId,
      lines,
      now
    )
    if (!itemResult.ok) {
      await supabase.from('orders').delete().eq('id', orderId)
      lastError = itemResult.error
      if (!isLikelyColumnMismatch(itemResult.error)) {
        return { ok: false, error: itemResult.error }
      }
      continue
    }
    return { ok: true, orderId, schema }
  }

  return { ok: false, error: lastError || 'Could not save order' }
}

async function insertOrderItemsForSchema(
  supabase: SupabaseClient,
  schema: PersistedOrderSchema,
  orderId: string,
  lines: OrderLineInput[],
  now: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (lines.length === 0) return { ok: true }

  if (schema === 'legacy') {
    const rows = lines.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: null,
      product_name: item.product_name,
      quantity: item.quantity,
      price_cents: item.price_cents,
      created_at: now,
    }))
    const { error } = await supabase.from('order_items').insert(rows)
    if (!error) return { ok: true }

    const rowsAlt = lines.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: null,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price_cents / 100,
      created_at: now,
    }))
    const { error: err2 } = await supabase.from('order_items').insert(rowsAlt as never)
    if (!err2) return { ok: true }
    return { ok: false, error: `${error.message} | ${err2.message}` }
  }

  const rows = lines.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price_cents / 100,
    created_at: now,
  }))
  let { error } = await supabase.from('order_items').insert(rows as never)
  if (!error) return { ok: true }

  const rowsNoProductId = lines.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: null,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price_cents / 100,
    created_at: now,
  }))
  const r2 = await supabase.from('order_items').insert(rowsNoProductId as never)
  if (!r2.error) return { ok: true }

  const rowsLegacyPrice = lines.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    price_cents: item.price_cents,
    created_at: now,
  }))
  const r3 = await supabase.from('order_items').insert(rowsLegacyPrice as never)
  if (!r3.error) return { ok: true }

  const rowsLegacyNoPid = lines.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: null,
    product_name: item.product_name,
    quantity: item.quantity,
    price_cents: item.price_cents,
    created_at: now,
  }))
  const r4 = await supabase.from('order_items').insert(rowsLegacyNoPid as never)
  if (!r4.error) return { ok: true }

  return {
    ok: false,
    error: [error.message, r2.error.message, r3.error.message, r4.error.message].join(' | '),
  }
}

export function insertPendingStripeOrderWithItems(
  supabase: SupabaseClient,
  args: {
    orderNumber: string
    paymentIntentId: string
    email: string
    customerName: string
    shippingPayload: ShippingPayload
    subtotalCents: number
    discountCents: number
    totalCents: number
    referralCode: string | null
    now: string
    lines: OrderLineInput[]
  }
) {
  const { paymentIntentId, ...rest } = args
  return insertPendingCheckoutOrderWithItems(supabase, {
    ...rest,
    payment: { mode: 'stripe', stripeSessionOrPaymentIntentId: paymentIntentId },
  })
}
