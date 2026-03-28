import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, handle, platform, audienceSize, motivation } = body

    if (!name || !email || !platform || !motivation) {
      return NextResponse.json(
        { error: 'Name, email, platform and motivation are required' },
        { status: 400 },
      )
    }

    const supabase = supabaseAdmin()

    const message = [
      `Handle: ${handle || 'N/A'}`,
      `Platform: ${platform}`,
      `Monthly Audience: ${audienceSize || 'Not specified'}`,
      ``,
      `Why they want to partner:`,
      motivation,
    ].join('\n')

    const { error } = await supabase.from('messages').insert({
      id: `affiliate-${Date.now()}`,
      name,
      email,
      subject: 'Affiliate Application',
      message,
      read: false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Affiliates API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
