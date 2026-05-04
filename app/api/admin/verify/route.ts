import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'

/** Used by the admin layout to confirm the browser token is still valid (not expired / tampered). */
export async function GET(request: Request) {
  const auth = await verifyAdmin(request)
  if (!auth.valid) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true, email: auth.payload?.email ?? null })
}
