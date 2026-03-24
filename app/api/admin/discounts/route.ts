import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = supabaseAdmin()
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    const codes = (data || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      percent_off: c.discount_percent,
      expires_at: c.expires_at,
      active: c.active,
      created_at: c.created_at,
    }))
    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Admin discounts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const code = String(body.code || '').trim().toUpperCase()
    const percent_off = Number(body.percent_off ?? 0)
    if (!code || percent_off <= 0) {
      return NextResponse.json({ error: 'Code and percent off are required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const { data: existing } = await supabase.from('discount_codes').select('id').eq('code', code).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
    const row = {
      id: `disc-${Date.now()}`,
      code,
      discount_percent: percent_off,
      expires_at: body.expires_at ?? null,
      active: body.active ?? true,
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('discount_codes').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, code: { ...row, percent_off } })
  } catch (error) {
    console.error('Admin discounts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const supabase = supabaseAdmin()
    const patch: any = { ...body }
    if (patch.code) patch.code = String(patch.code).trim().toUpperCase()
    if (patch.percent_off !== undefined) {
      patch.discount_percent = Number(patch.percent_off)
      delete patch.percent_off
    }
    const { error } = await supabase.from('discount_codes').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin discounts PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const supabase = supabaseAdmin()
    const { error } = await supabase.from('discount_codes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin discounts DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

