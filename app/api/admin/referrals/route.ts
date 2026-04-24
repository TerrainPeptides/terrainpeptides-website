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
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    const codes = (data || []).map((r: any) => ({
      id: r.id,
      code: r.code,
      discount_percent: r.discount_percent,
      max_uses: r.max_uses ?? null,
      current_uses: r.current_uses ?? 0,
      active: Boolean(r.active),
      created_at: r.created_at,
      expires_at: r.expires_at ?? null,
      owner_email: r.owner_email ?? null,
      paid_commission_cents: r.paid_commission_cents ?? 0,
    }))
    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Admin referrals GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const supabase = supabaseAdmin()
    const code = String(body.code || '').toUpperCase()
    const { data: existing } = await supabase.from('referral_codes').select('id').eq('code', code).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
    const row = {
      id: `ref-${Date.now()}`,
      code,
      discount_percent: body.discount_percent,
      max_uses: body.max_uses ?? null,
      expires_at: body.expires_at ?? null,
      active: body.active ?? true,
      current_uses: 0,
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('referral_codes').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin referrals POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const supabase = supabaseAdmin()
    const { error } = await supabase.from('referral_codes').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin referrals PUT error:', error)
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
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    const supabase = supabaseAdmin()
    const { error } = await supabase.from('referral_codes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin referrals DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
