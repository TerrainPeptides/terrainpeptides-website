import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'terrain-admin-secret-key-change-in-production'
)

// Static admin for this project (no database)
const STATIC_ADMIN_EMAIL = 'admin@terrainpeptides.com'
const STATIC_ADMIN_PASSWORD = 'terrain2024'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (email.toLowerCase() !== STATIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (password !== STATIC_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await new SignJWT({ sub: 'admin-1', email: STATIC_ADMIN_EMAIL })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
