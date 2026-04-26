import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

const COMMISSION_RATE = 0.10

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email.toLowerCase()
  const supabase = supabaseAdmin()

  const { data: refRow } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('owner_email', email)
    .maybeSingle()

  if (!refRow) {
    return NextResponse.json({ code: null, orders: [], earned_cents: 0, paid_cents: 0 })
  }

  const code = refRow.code as string

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, email, total_cents, payment_status, status, created_at')
    .eq('referral_code', code)
    .order('created_at', { ascending: false })

  const paidOrders = (orders || []).filter((o: any) => o.payment_status === 'paid')
  const earned_cents = Math.round(
    paidOrders.reduce((sum: number, o: any) => sum + Number(o.total_cents || 0), 0) * COMMISSION_RATE
  )

  return NextResponse.json({
    code: {
      id: refRow.id,
      code: refRow.code,
      discount_percent: refRow.discount_percent,
      current_uses: refRow.current_uses ?? 0,
      active: refRow.active,
    },
    orders: (orders || []).map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      email: o.email,
      total_cents: Number(o.total_cents || 0),
      payment_status: o.payment_status,
      status: o.status,
      created_at: o.created_at,
    })),
    earned_cents,
    paid_cents: Number(refRow.paid_commission_cents || 0),
  })
}
