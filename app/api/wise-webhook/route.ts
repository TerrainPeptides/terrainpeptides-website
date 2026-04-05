import { createVerify, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/** Wise production webhook signing key (RSA). */
const WISE_PUBLIC_KEY_PRODUCTION = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvO8vXV+JksBzZAY6GhSO
XdoTCfhXaaiZ+qAbtaDBiu2AGkGVpmEygFmWP4Li9m5+Ni85BhVvZOodM9epgW3F
bA5Q1SexvAF1PPjX4JpMstak/QhAgl1qMSqEevL8cmUeTgcMuVWCJmlge9h7B1CS
D4rtlimGZozG39rUBDg6Qt2K+P4wBfLblL0k4C4YUdLnpGYEDIth+i8XsRpFlogx
CAFyH9+knYsDbR43UJ9shtc42Ybd40Afihj8KnYKXzchyQ42aC8aZ/h5hyZ28yVy
Oj3Vos0VdBIs/gAyJ/4yyQFCXYte64I7ssrlbGRaco4nKF3HmaNhxwyKyJafz19e
HwIDAQAB
-----END PUBLIC KEY-----`

/** Wise sandbox webhook signing key (RSA). */
const WISE_PUBLIC_KEY_SANDBOX = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwpb91cEYuyJNQepZAVfP
ZIlPZfNUefH+n6w9SW3fykqKu938cR7WadQv87oF2VuT+fDt7kqeRziTmPSUhqPU
ys/V2Q1rlfJuXbE+Gga37t7zwd0egQ+KyOEHQOpcTwKmtZ81ieGHynAQzsn1We3j
wt760MsCPJ7GMT141ByQM+yW1Bx+4SG3IGjXWyqOWrcXsxAvIXkpUD/jK/L958Cg
nZEgz0BSEh0QxYLITnW1lLokSx/dTianWPFEhMC9BgijempgNXHNfcVirg1lPSyg
zKqoKUN0oHqWLr2U1A+7kqrl6O2nx3CKs1bj1hToT1+p4kcMoHXA7kA+VBLUpEs
VwIDAQAB
-----END PUBLIC KEY-----`

const PLACEHOLDER_SECRET = 'your_secret_here'
const PLACEHOLDER_TOKEN = 'your_token_here'

function isSandboxEnv(): boolean {
  return process.env.WISE_ENV === 'sandbox'
}

/**
 * Wise signs the raw body with RSA-SHA256; legitimacy is verified with their public key.
 * If WISE_WEBHOOK_SECRET is set (and not the placeholder), the callback URL registered in
 * Wise must include the same value as query `?secret=...` so only your endpoint can be hit.
 */
function verifyWiseRsaSignature(
  rawBody: string,
  signatureB64: string | null,
): boolean {
  if (!signatureB64) return false
  try {
    const verifier = createVerify('RSA-SHA256')
    verifier.update(rawBody)
    verifier.end()
    const key = isSandboxEnv() ? WISE_PUBLIC_KEY_SANDBOX : WISE_PUBLIC_KEY_PRODUCTION
    return verifier.verify(key, signatureB64, 'base64')
  } catch {
    return false
  }
}

function verifyOptionalUrlSecret(request: Request): boolean {
  const expected = process.env.WISE_WEBHOOK_SECRET?.trim()
  if (!expected || expected === PLACEHOLDER_SECRET) return true
  const url = new URL(request.url)
  const provided = url.searchParams.get('secret') ?? ''
  if (provided.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}

type WiseWebhookPayload = {
  event_type?: string
  data?: {
    current_state?: string
    resource?: { type?: string; id?: number }
    transfer?: { amount?: number; currency?: string }
  }
}

function formatInlineAmount(data: WiseWebhookPayload['data']): string | null {
  const t = data?.transfer
  if (t && typeof t.amount === 'number' && typeof t.currency === 'string') {
    return `${t.amount} ${t.currency}`
  }
  return null
}

async function resolveTransferAmountLabel(
  transferId: number,
): Promise<string | null> {
  const token = process.env.WISE_API_TOKEN?.trim()
  if (!token || token === PLACEHOLDER_TOKEN) return null

  const base =
    isSandboxEnv() || process.env.WISE_API_BASE === 'sandbox'
      ? 'https://api.sandbox.transferwise.tech'
      : 'https://api.wise.com'

  const res = await fetch(`${base}/v1/transfers/${transferId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null

  const row = (await res.json()) as Record<string, unknown>
  const sourceValue = row.sourceValue
  const sourceCurrency = row.sourceCurrency
  const targetValue = row.targetValue
  const targetCurrency = row.targetCurrency

  if (typeof sourceValue === 'number' && typeof sourceCurrency === 'string') {
    return `${sourceValue} ${sourceCurrency}`
  }
  if (typeof targetValue === 'number' && typeof targetCurrency === 'string') {
    return `${targetValue} ${targetCurrency}`
  }
  return null
}

const TARGET_STATES = new Set(['outgoing_payment_sent', 'funds_converted'])

export async function POST(request: Request) {
  if (!verifyOptionalUrlSecret(request)) {
    return new NextResponse(null, { status: 400 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-signature-sha256')

  if (!verifyWiseRsaSignature(rawBody, signature)) {
    return new NextResponse(null, { status: 400 })
  }

  let payload: WiseWebhookPayload
  try {
    payload = JSON.parse(rawBody) as WiseWebhookPayload
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  if (payload.event_type !== 'transfers#state-change') {
    return new NextResponse(null, { status: 200 })
  }

  const state = payload.data?.current_state
  if (!state || !TARGET_STATES.has(state)) {
    return new NextResponse(null, { status: 200 })
  }

  const transferId = payload.data?.resource?.id
  if (transferId == null || typeof transferId !== 'number') {
    return new NextResponse(null, { status: 400 })
  }

  let amountLabel = formatInlineAmount(payload.data)
  if (!amountLabel) {
    amountLabel = await resolveTransferAmountLabel(transferId)
  }
  if (!amountLabel) {
    amountLabel = '(amount unavailable — set WISE_API_TOKEN or check payload)'
  }

  console.info('[wise-webhook]', {
    event: 'transfers#state-change',
    current_state: state,
    transferId,
    amount: amountLabel,
    test: request.headers.get('x-test-notification') === 'true',
  })

  return new NextResponse(null, { status: 200 })
}
