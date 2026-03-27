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

    const [{ count: totalProducts }, { count: totalOrders }, { data: recentOrders }, { count: totalVouches }, { data: totals }] =
      await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('vouches').select('id', { count: 'exact', head: true }).eq('approved', true),
        supabase.from('orders').select('*'),
      ])

    const totalRevenue = (totals || []).reduce((sum: number, o: any) => {
      const cents =
        o.total_cents != null
          ? Number(o.total_cents)
          : Math.round(Number(o.total || 0) * 100)
      return sum + cents
    }, 0)

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalVouches: totalVouches || 0,
      recentOrders: (recentOrders || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        email: o.customer_email ?? o.email,
        total_cents:
          o.total_cents != null
            ? Number(o.total_cents)
            : Math.round(Number(o.total || 0) * 100),
        status: o.status,
        created_at: o.created_at,
      })),
    })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Missing env var:')) {
      return NextResponse.json({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalVouches: 0,
        recentOrders: [],
        warning: 'Supabase env vars missing; stats unavailable.',
      })
    }
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
