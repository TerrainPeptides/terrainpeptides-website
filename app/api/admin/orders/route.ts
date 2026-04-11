import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

    const byOrderId = new Map<string, any[]>()
    for (const it of items || []) {
      const arr = byOrderId.get(it.order_id) || []
      arr.push({
        id: it.id,
        order_id: it.order_id,
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: it.quantity,
        price_cents:
          it.price_cents != null
            ? Number(it.price_cents)
            : Math.round(Number(it.price || 0) * 100),
        created_at: it.created_at,
      })
      byOrderId.set(it.order_id, arr)
    }

    const shaped = (orders || []).map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      email: o.customer_email ?? o.email,
      customer_name: o.customer_name ?? null,
      status: o.status,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      stripe_session_id: o.stripe_session_id,
      crypto_address: o.crypto_address,
      subtotal_cents:
        o.subtotal_cents != null
          ? Number(o.subtotal_cents)
          : Math.round(Number(o.subtotal || 0) * 100),
      discount_cents:
        o.discount_cents != null
          ? Number(o.discount_cents)
          : Math.round(Number(o.discount || 0) * 100),
      total_cents:
        o.total_cents != null ? Number(o.total_cents) : Math.round(Number(o.total || 0) * 100),
      shipping_address: o.shipping_address,
      tracking_number: o.tracking_number,
      referral_code: o.referral_code,
      discount_code: o.discount_code,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: byOrderId.get(o.id) || [],
    }))

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
