import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      console.error('[register] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'Registration is temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const trimmedEmail = String(email).trim().toLowerCase()
    const trimmedName = String(name).trim()

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: trimmedEmail,
      password: String(password),
      user_metadata: { name: trimmedName },
      email_confirm: true,
    })

    if (error) {
      console.error('[register] createUser error:', error.message)

      const lower = error.message.toLowerCase()
      if (
        lower.includes('already registered') ||
        lower.includes('already exists') ||
        lower.includes('duplicate') ||
        lower.includes('user already')
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `Sign-up failed: ${error.message}` },
        { status: 500 }
      )
    }

    const user = data.user
    console.log('[register] New user created:', trimmedEmail, user?.id)

    return NextResponse.json({
      message: 'Account created successfully.',
      user: {
        id: user?.id,
        email: user?.email,
        name: trimmedName,
      },
    })
  } catch (error) {
    console.error('[register] Unexpected error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Sign-up failed: ${message}` },
      { status: 500 }
    )
  }
}
