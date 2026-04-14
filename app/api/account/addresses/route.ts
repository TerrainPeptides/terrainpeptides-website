import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

async function getSession() {
  return await auth()
}

export async function GET() {
  const session = await getSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_email', session.user.email.toLowerCase())
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ addresses: data || [] })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { first_name, last_name, country, address1, address2, city, postal_code, province, phone } = body

  if (!first_name || !last_name || !address1 || !city || !postal_code) {
    return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      id: nanoid(),
      user_email: session.user.email.toLowerCase(),
      first_name,
      last_name,
      country: country || 'United States',
      address1,
      address2: address2 || null,
      city,
      postal_code,
      province: province || null,
      phone: phone || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ address: data })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const supabase = supabaseAdmin()
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)
    .eq('user_email', session.user.email.toLowerCase())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
