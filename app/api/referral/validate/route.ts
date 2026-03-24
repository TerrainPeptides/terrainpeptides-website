import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin()
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    const { data: referralCode, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', String(code).toUpperCase())
      .maybeSingle()
    if (error) throw error

    if (!referralCode || !referralCode.active) {
      return NextResponse.json({ valid: false, error: 'Invalid code' })
    }

    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Code has expired' })
    }

    if (referralCode.max_uses != null && referralCode.current_uses >= referralCode.max_uses) {
      return NextResponse.json({ valid: false, error: 'Code has reached maximum uses' })
    }

    return NextResponse.json({
      valid: true,
      discount_percent: referralCode.discount_percent,
    })
  } catch (error) {
    console.error('Referral validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
