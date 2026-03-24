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
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    const vouches = (data || []).map((r: any) => ({
      id: r.id,
      author_name: r.reviewer_name,
      rating: r.rating,
      content: r.body,
      product_id: r.product_id ?? null,
      verified: Boolean(r.verified),
      approved: Boolean(r.approved),
      created_at: r.created_at,
    }))

    return NextResponse.json({ vouches })
  } catch (error) {
    console.error('Admin vouches GET error:', error)
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
    const row = {
      id: `rev-${Date.now()}`,
      reviewer_name: body.author_name,
      rating: body.rating,
      body: body.content,
      product_id: body.product_id ?? null,
      verified: body.verified ?? false,
      approved: body.approved ?? false,
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('reviews').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin vouches POST error:', error)
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
    const patch: any = {}
    if (updates.author_name !== undefined) patch.reviewer_name = updates.author_name
    if (updates.rating !== undefined) patch.rating = updates.rating
    if (updates.content !== undefined) patch.body = updates.content
    if (updates.verified !== undefined) patch.verified = updates.verified
    if (updates.approved !== undefined) patch.approved = updates.approved
    if (updates.product_id !== undefined) patch.product_id = updates.product_id
    const { error } = await supabase.from('reviews').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin vouches PUT error:', error)
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
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin vouches DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
