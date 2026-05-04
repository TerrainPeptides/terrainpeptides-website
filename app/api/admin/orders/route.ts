import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

function parseJsonField<T>(raw: unknown): T | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  return raw as T
}

function mapItemRow(it: Record<string, unknown>) {
  const unitCents =
    it.price_cents != null
      ? Number(it.price_cents)
      : Math.round(Number(it.price ?? 0) * 100)
  const qty = Number(it.quantity ?? 1)
  let full_item: Record<string, unknown>
  try {
    full_item = JSON.parse(JSON.stringify(it)) as Record<string, unknown>
  } catch {
    full_item = {}
  }
  return {
    id: String(it.id),
    order_id: String(it.order_id),
    product_id: it.product_id != null ? String(it.product_id) : null,
    product_name: String(it.product_name ?? ''),
    quantity: qty,
    price_cents: unitCents,
    line_total_cents: unitCents * qty,
    created_at: it.created_at,
    full_item,
  }
}

function mapOrderRow(o: Record<string, unknown>, items: ReturnType<typeof mapItemRow>[]) {
  const shipping_address =
    parseJsonField<Record<string, unknown>>(o.shipping_address) ??
    (o.shipping_address as Record<string, unknown> | null)

  const customer_email = (o.customer_email ?? o.email ?? null) as string | null
  const email = String(customer_email || '')

  const subtotal_cents =
    o.subtotal_cents != null
      ? Number(o.subtotal_cents)
      : Math.round(Number(o.subtotal ?? 0) * 100)
  const discount_cents =
    o.discount_cents != null
      ? Number(o.discount_cents)
      : Math.round(Number(o.discount ?? 0) * 100)
  const total_cents =
    o.total_cents != null ? Number(o.total_cents) : Math.round(Number(o.total ?? 0) * 100)

  let full_record: Record<string, unknown>
  try {
    full_record = JSON.parse(JSON.stringify(o)) as Record<string, unknown>
  } catch {
    full_record = {}
  }

  return {
    id: String(o.id),
    order_number: o.order_number,
    email,
    customer_email,
    customer_name: (o.customer_name as string | null) ?? null,
    status: o.status,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    stripe_session_id: o.stripe_session_id,
    crypto_address: o.crypto_address,
    subtotal_cents,
    discount_cents,
    total_cents,
    shipping_address,
    tracking_number: (o.tracking_number as string | null) ?? null,
    referral_code: (o.referral_code as string | null) ?? null,
    discount_code: (o.discount_code as string | null) ?? null,
    created_at: o.created_at,
    updated_at: o.updated_at,
    items,
    full_record,
  }
}

export async function GET(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = supabaseAdmin()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    const orderIds = (orders || []).map((o: any) => o.id)
    const { data: items } = orderIds.length
      ? await supabase.from('order_items').select('*').in('order_id', orderIds)
      : { data: [] as any[] }

    const byOrderId = new Map<string, ReturnType<typeof mapItemRow>[]>()
    for (const it of items || []) {
      const row = it as Record<string, unknown>
      const arr = byOrderId.get(String(row.order_id)) || []
      arr.push(mapItemRow(row))
      byOrderId.set(String(row.order_id), arr)
    }

    const shaped = (orders || []).map((o: Record<string, unknown>) =>
      mapOrderRow(o, byOrderId.get(String(o.id)) || [])
    )

    return NextResponse.json({ orders: shaped })
  } catch (error) {
    console.error('Admin orders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const supabase = supabaseAdmin()
    await supabase.from('order_items').delete().eq('order_id', id)
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin orders DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = body.id as string | undefined
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (body.status !== undefined) updates.status = body.status
    if (body.tracking_number !== undefined) updates.tracking_number = body.tracking_number
    if (body.discount_code !== undefined) updates.discount_code = body.discount_code
    if (body.referral_code !== undefined) updates.referral_code = body.referral_code

    const supabase = supabaseAdmin()
    const { error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin orders PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
