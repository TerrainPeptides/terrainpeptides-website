import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'terrain-admin-secret-key-change-in-production'
)

type AdminAccount = { emailNorm: string; emailForJwt: string; password: string }

function trimEmail(raw: string | undefined): string {
  if (raw == null || raw === '') return ''
  return raw.trim()
}

/** When no ADMIN_EMAIL / ADMIN_PASSWORD are set, keep the original demo admin so local deploys still work. */
function defaultStaticAdmins(): AdminAccount[] {
  return [
    {
      emailNorm: 'admin@terrainpeptides.com',
      emailForJwt: 'admin@terrainpeptides.com',
      password: 'terrain2024',
    },
  ]
}

function adminAccountsFromEnv(): AdminAccount[] {
  const out: AdminAccount[] = []
  const pairs: Array<[string | undefined, string | undefined]> = [
    [process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD],
    [process.env.ADMIN_EMAIL_2, process.env.ADMIN_PASSWORD_2],
  ]
  for (const [emailRaw, passRaw] of pairs) {
    const emailForJwt = trimEmail(emailRaw)
    const password = passRaw?.trim() ?? ''
    if (!emailForJwt || !password) continue
    out.push({
      emailNorm: emailForJwt.toLowerCase(),
      emailForJwt,
      password,
    })
  }
  return out
}

function resolveAdminAccounts(): AdminAccount[] {
  const fromEnv = adminAccountsFromEnv()
  return fromEnv.length > 0 ? fromEnv : defaultStaticAdmins()
}

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

    const emailNorm = String(email).trim().toLowerCase()
    const accounts = resolveAdminAccounts()
    const match = accounts.find((a) => a.emailNorm === emailNorm && a.password === String(password))

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await new SignJWT({ sub: 'admin-1', email: match.emailForJwt })
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
