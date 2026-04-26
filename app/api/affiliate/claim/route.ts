import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email.toLowerCase()
  const supabase = supabaseAdmin()

  const { existing: myExisting } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('owner_email', email)
    .maybeSingle()
    .then(r => ({ existing: r.data }))

  if (myExisting) {
    return NextResponse.json(
      { error: `You already have a referral code: ${myExisting.code}` },
      { status: 400 }
    )
  }

  const body = await request.json()
  const raw = String(body.code ?? '').trim().toUpperCase()

  if (!raw || raw.length < 3 || raw.length > 20 || !/^[A-Z0-9_-]+$/.test(raw)) {
    return NextResponse.json(
      { error: 'Code must be 3–20 characters using letters, numbers, _ or -' },
      { status: 400 }
    )
  }

  const { data: taken } = await supabase
    .from('referral_codes')
    .select('id')
    .eq('code', raw)
    .maybeSingle()

  if (taken) {
    return NextResponse.json(
      { error: 'That referral code is already taken. Please choose a different one.' },
      { status: 409 }
    )
  }

  const { error } = await supabase.from('referral_codes').insert({
    id: crypto.randomUUID(),
    code: raw,
    discount_percent: 10,
    max_uses: null,
    current_uses: 0,
    active: true,
    owner_email: email,
    paid_commission_cents: 0,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[affiliate/claim] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, code: raw })
}
