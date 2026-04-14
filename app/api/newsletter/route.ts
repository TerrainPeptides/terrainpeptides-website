import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: "You're already subscribed!" })
    }

    const { error } = await supabase.from('newsletter_subscriptions').insert({
      id: nanoid(),
      email: email.toLowerCase(),
      created_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({ message: 'Subscribed successfully!' })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
