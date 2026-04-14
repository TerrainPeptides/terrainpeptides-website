import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const email = session.user.email.toLowerCase()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .or(`customer_email.eq.${email},email.eq.${email}`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const orderIds = (orders || []).map((o: any) => o.id)
  const { data: items } = orderIds.length
    ? await supabase.from('order_items').select('*').in('order_id', orderIds)
    : { data: [] as any[] }

  const itemsByOrder = new Map<string, any[]>()
  for (const item of items || []) {
    const arr = itemsByOrder.get(item.order_id) || []
    arr.push(item)
    itemsByOrder.set(item.order_id, arr)
  }

  const shaped = (orders || []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    payment_status: o.payment_status,
    total_cents: o.total_cents != null
      ? Number(o.total_cents)
      : Math.round(Number(o.total || 0) * 100),
    created_at: o.created_at,
    items: (itemsByOrder.get(o.id) || []).map((it: any) => ({
      product_name: it.product_name,
      quantity: it.quantity,
    })),
  }))

  return NextResponse.json({ orders: shaped })
}
