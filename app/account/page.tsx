'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  MapPin,
  ShoppingBag,
  LogOut,
  Plus,
  Trash2,
  X,
  Package,
  ChevronRight,
  Tag,
  Copy,
  Check,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Link2,
  Clock,
} from 'lucide-react'

type Tab = 'profile' | 'addresses' | 'discounts' | 'affiliate'

interface SavedDiscount {
  code: string
  percent: number
  claimedAt: string
}

interface Address {
  id: string
  first_name: string
  last_name: string
  country: string
  address1: string
  address2?: string | null
  city: string
  postal_code: string
  province?: string | null
  phone?: string | null
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_cents: number
  created_at: string
  items?: { product_name: string; quantity: number }[]
}

interface AffiliateCode {
  id: string
  code: string
  discount_percent: number
  current_uses: number
  active: boolean
}

interface AffiliateOrder {
  id: string
  order_number: string
  email: string
  total_cents: number
  payment_status: string
  status: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-terrain-muted text-terrain-deep',
  shipped: 'bg-accent text-terrain-deep',
  delivered: 'bg-terrain/15 text-terrain-deep',
  cancelled: 'bg-red-50 text-red-700',
}

const FIELD =
  'w-full rounded-xl border border-border bg-section-subtle px-3 py-2.5 text-sm text-ink outline-none transition focus:border-terrain focus:ring-2 focus:ring-terrain/15'

function AccountPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-terrain" />
    </div>
  )
}

function AccountPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [savedDiscounts, setSavedDiscounts] = useState<SavedDiscount[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const [affiliateCode, setAffiliateCode] = useState<AffiliateCode | null>(null)
  const [affiliateOrders, setAffiliateOrders] = useState<AffiliateOrder[]>([])
  const [affiliateEarned, setAffiliateEarned] = useState(0)
  const [affiliatePaid, setAffiliatePaid] = useState(0)
  const [affiliateLoading, setAffiliateLoading] = useState(false)
  const [claimInput, setClaimInput] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [copiedAffiliate, setCopiedAffiliate] = useState(false)
  const [autoGenerating, setAutoGenerating] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('terrain-saved-discounts')
      if (raw) setSavedDiscounts(JSON.parse(raw))
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'profile' || tab === 'addresses' || tab === 'discounts' || tab === 'affiliate') {
      setActiveTab(tab)
    }
  }, [searchParams])

  function copyDiscountCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  function applyToCart(code: string, percent: number) {
    localStorage.setItem('terrain-referral', code)
    localStorage.setItem('terrain-discount', String(percent))
    setAppliedCode(code)
    setTimeout(() => setAppliedCode(null), 3000)
  }

  const [addForm, setAddForm] = useState({
    first_name: '', last_name: '', country: 'United States',
    address1: '', address2: '', city: '', postal_code: '', province: '', phone: '',
  })
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAddresses()
      fetchOrders()
    }
  }, [session])

  useEffect(() => {
    if (session && activeTab === 'affiliate') {
      fetchAffiliate()
    }
  }, [session, activeTab])

  async function fetchAffiliate() {
    setAffiliateLoading(true)
    try {
      const res = await fetch('/api/affiliate')
      const data = await res.json()
      setAffiliateCode(data.code ?? null)
      setAffiliateOrders(data.orders ?? [])
      setAffiliateEarned(data.earned_cents ?? 0)
      setAffiliatePaid(data.paid_cents ?? 0)
    } finally {
      setAffiliateLoading(false)
    }
  }

  async function handleClaimCode(e: React.FormEvent) {
    e.preventDefault()
    setClaimError('')
    setClaimLoading(true)
    try {
      const res = await fetch('/api/affiliate/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: claimInput }),
      })
      const data = await res.json()
      if (!res.ok) {
        setClaimError(data.error ?? 'Failed to claim code.')
      } else {
        await fetchAffiliate()
        setClaimInput('')
      }
    } catch {
      setClaimError('Something went wrong. Please try again.')
    } finally {
      setClaimLoading(false)
    }
  }

  function copyAffiliateCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedAffiliate(true)
      setTimeout(() => setCopiedAffiliate(false), 2000)
    })
  }

  async function autoGenerateCode() {
    setAutoGenerating(true)
    setClaimError('')
    const name = (session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '')
    const suffix = Math.floor(1000 + Math.random() * 9000)
    const generated = `${name.slice(0, 10)}${suffix}`
    try {
      const res = await fetch('/api/affiliate/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generated }),
      })
      const data = await res.json()
      if (!res.ok) {
        setClaimError(data.error ?? 'Failed to generate code. Try entering one manually.')
      } else {
        await fetchAffiliate()
      }
    } catch {
      setClaimError('Something went wrong. Please try again.')
    } finally {
      setAutoGenerating(false)
    }
  }

  async function fetchAddresses() {
    setAddressLoading(true)
    try {
      const res = await fetch('/api/account/addresses')
      const data = await res.json()
      setAddresses(data.addresses || [])
    } finally {
      setAddressLoading(false)
    }
  }

  async function fetchOrders() {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/account/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } finally {
      setOrdersLoading(false)
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error ?? 'Failed to save address.'); return }
      setShowAddModal(false)
      setAddForm({ first_name: '', last_name: '', country: 'United States', address1: '', address2: '', city: '', postal_code: '', province: '', phone: '' })
      fetchAddresses()
    } catch {
      setAddError('Something went wrong.')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleDeleteAddress(id: string) {
    await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' })
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-terrain" />
      </div>
    )
  }

  const userName = session.user?.name ?? session.user?.email?.split('@')[0] ?? 'User'
  const initial = (session.user?.name?.[0] ?? session.user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-dark">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-terrain text-xl font-bold text-white">
              {initial}
            </div>
            <div className="flex-1">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-terrain">
                Account
              </p>
              <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
                Hi, <span className="orbit-accent">{userName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{session.user?.email}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your profile, addresses, discounts, and affiliate earnings.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/shop" className="btn-terrain !px-5 !py-2.5 text-sm">
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn-ghost-ink !px-5 !py-2.5 text-sm"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            { id: 'profile', icon: User, label: 'Profile', sub: 'Your details' },
            { id: 'addresses', icon: MapPin, label: 'Addresses', sub: 'Shipping' },
            { id: 'discounts', icon: Tag, label: 'Discounts', sub: `${savedDiscounts.length} saved`, badge: savedDiscounts.length > 0 },
            { id: 'affiliate', icon: Users, label: 'Affiliate', sub: affiliateCode ? affiliateCode.code : 'Partner', badge: false },
          ] as const).map(({ id, icon: Icon, label, sub, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as Tab)}
              className={`relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition ${
                activeTab === id
                  ? 'border-terrain bg-terrain text-white '
                  : 'border-border bg-white text-ink hover:border-terrain/40'
              }`}
            >
              {badge && activeTab !== id && (
                <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-terrain" />
              )}
              <Icon className={`h-5 w-5 ${activeTab === id ? 'text-white' : 'text-terrain'}`} />
              <span className="text-sm font-semibold">{label}</span>
              <span className={`text-xs ${activeTab === id ? 'text-white/75' : 'text-muted-foreground'}`}>
                {sub}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="mt-5 rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">Your Profile</h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-section-subtle px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                <p className="mt-1 text-sm font-medium text-ink">{session.user?.name ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-border bg-section-subtle px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                <p className="mt-1 text-sm font-medium text-ink">{session.user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="mt-5 rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Shipping Addresses</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You can update your shipping address on the{' '}
                  <Link href="/checkout" className="font-medium text-terrain-deep hover:underline">checkout page</Link>
                  . Saving your address will make future checkouts quicker.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {addressLoading ? (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-terrain" />
                </div>
              ) : addresses.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground transition hover:border-terrain hover:text-terrain-deep"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">New address</span>
                </button>
              ) : (
                <>
                  {addresses.map(addr => (
                    <div key={addr.id} className="flex items-start justify-between rounded-xl border border-border bg-section-subtle p-4">
                      <div className="text-sm text-ink">
                        <p className="font-medium">{addr.first_name} {addr.last_name}</p>
                        <p className="text-muted-foreground">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
                        <p className="text-muted-foreground">{addr.city}{addr.province ? `, ${addr.province}` : ''} {addr.postal_code}</p>
                        <p className="text-muted-foreground">{addr.country}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="ml-3 shrink-0 text-muted-foreground transition hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition hover:border-terrain hover:text-terrain-deep"
                  >
                    <Plus className="h-4 w-4" />
                    Add address
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'discounts' && (
          <div className="mt-5 rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Your Discount Codes</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Codes are applied automatically to your cart when you click &quot;Apply to Cart&quot;.
                </p>
              </div>
            </div>

            {appliedCode && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-terrain/25 bg-terrain/10 px-4 py-3 text-sm text-terrain-deep">
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{appliedCode}</strong> applied to your cart!
                </span>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {savedDiscounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-center text-muted-foreground">
                  <Tag className="h-8 w-8 opacity-40" />
                  <p className="text-sm font-medium">No discount codes yet</p>
                  <p className="text-xs">Discount codes you claim will appear here.</p>
                </div>
              ) : (
                savedDiscounts.map((d) => (
                  <div
                    key={d.code}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-section-subtle p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold tracking-widest text-terrain-deep">
                          {d.code}
                        </span>
                        <span className="rounded-full bg-terrain/15 px-2 py-0.5 text-[0.65rem] font-bold text-terrain-deep">
                          {d.percent}% OFF
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Claimed {new Date(d.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyDiscountCode(d.code)}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-terrain"
                      >
                        {copiedCode === d.code ? (
                          <><Check className="h-3.5 w-3.5 text-terrain" />Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" />Copy</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyToCart(d.code, d.percent)}
                        className="flex items-center gap-1.5 rounded-full bg-terrain px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-terrain-deep"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Apply to Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Affiliate tab ────────────────────────────── */}
        {activeTab === 'affiliate' && (
          <div className="mt-5 space-y-5">
            {/* Hero Banner */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white ">
              <div className="grid md:grid-cols-2">
                {/* Left: text */}
                <div className="flex flex-col justify-center p-7 sm:p-8">
                  <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-terrain">
                    Partner Program
                  </p>
                  <h2 className="mt-2 text-2xl font-bold leading-snug text-ink sm:text-3xl">
                    Partner with premium<br />research <span className="orbit-accent">peptides</span>
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Earn 10% commission on every order referred through your unique code.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { value: '10%', label: 'Commission per sale' },
                      { value: '10%', label: 'Lifetime recurring' },
                      { value: '30 days', label: 'Cookie window' },
                      { value: 'Monthly', label: 'Payouts via bank deposit' },
                    ].map(s => (
                      <div key={s.label}>
                        <p className="text-lg font-extrabold text-ink">{s.value}</p>
                        <p className="text-[0.7rem] font-medium text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {!affiliateCode && !affiliateLoading && (
                    <div className="mt-6">
                      <button
                        onClick={() => document.getElementById('claim-code-input')?.focus()}
                        className="inline-flex items-center gap-2 rounded-full bg-terrain px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terrain-deep"
                      >
                        Become a Partner →
                      </button>
                    </div>
                  )}
                </div>
                {/* Right: hero image */}
                <div className="relative flex items-center justify-center overflow-hidden bg-section-subtle p-6">
                  <Image
                    src="/images/affiliate-hero.png"
                    alt="Affiliate earnings"
                    width={520}
                    height={380}
                    className="relative z-10 h-auto w-full max-w-sm object-contain drop-shadow-xl"
                    priority
                  />
                </div>
              </div>
            </div>

            {affiliateLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-terrain" />
              </div>
            ) : !affiliateCode ? (
              /* Code Claim Form */
              <div className="rounded-2xl border border-border bg-white p-6 ">
                <h3 className="text-base font-semibold text-ink">Claim your referral code</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a unique code — customers will use it for 10% off their order and you earn 10% commission.
                </p>
                <form onSubmit={handleClaimCode} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <input
                      id="claim-code-input"
                      placeholder="YOURCODE"
                      value={claimInput}
                      onChange={e => { setClaimInput(e.target.value.toUpperCase()); setClaimError('') }}
                      className="w-full rounded-xl border border-border bg-section-subtle px-4 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-ink outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:border-terrain focus:ring-2 focus:ring-terrain/15"
                      maxLength={20}
                      required
                    />
                    {claimError && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">{claimError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={claimLoading || claimInput.length < 3}
                    className="flex items-center gap-2 rounded-full bg-terrain px-6 py-3 text-sm font-semibold text-white transition hover:bg-terrain-deep disabled:opacity-50"
                  >
                    {claimLoading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Link2 className="h-3.5 w-3.5" />}
                    Claim Code
                  </button>
                </form>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">or</span>
                  <button
                    type="button"
                    onClick={autoGenerateCode}
                    disabled={autoGenerating}
                    className="text-xs font-semibold text-terrain-deep hover:underline disabled:opacity-50"
                  >
                    {autoGenerating ? 'Generating...' : 'Auto-generate a code for me'}
                  </button>
                </div>
              </div>
            ) : (
              /* Affiliate Dashboard */
              <div className="space-y-4">
                {/* Code + earnings */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Your code card */}
                  <div className="rounded-2xl border border-border bg-white p-5  sm:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Code</p>
                    <p className="mt-1.5 font-mono text-2xl font-bold tracking-widest text-terrain-deep">
                      {affiliateCode.code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{affiliateCode.discount_percent}% off for customers</p>
                    <button
                      onClick={() => copyAffiliateCode(affiliateCode.code)}
                      className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-section-subtle px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-terrain/40 hover:"
                    >
                      {copiedAffiliate ? <><Check className="h-3.5 w-3.5 text-terrain" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy Code</>}
                    </button>
                  </div>

                  {/* Withdrawable Funds */}
                  <div className="rounded-2xl border border-terrain/20 bg-terrain/10 p-5 ">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-terrain-deep">Withdrawable Funds</p>
                        <p className="mt-1.5 text-2xl font-extrabold text-terrain-deep">
                          ${((affiliateEarned - affiliatePaid) / 100).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-terrain-deep/70">Available for withdrawal</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-terrain/40" />
                    </div>
                  </div>

                  {/* Funds Received */}
                  <div className="rounded-2xl border border-border bg-white p-5 ">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Funds Received</p>
                        <p className="mt-1.5 text-2xl font-extrabold text-ink">
                          ${(affiliatePaid / 100).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Total paid out</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>

                {/* Payouts Section */}
                <div className="rounded-2xl border border-border bg-white ">
                  <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-ink">Payouts</h3>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink">Payouts Being Confirmed</p>
                          <p className="text-xs text-muted-foreground">Earnings from orders awaiting payment confirmation</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-amber-600">
                        ${(() => {
                          const pendingCommission = affiliateOrders
                            .filter(o => o.payment_status !== 'paid')
                            .reduce((sum, o) => sum + Math.round(o.total_cents * 0.1), 0)
                          return (pendingCommission / 100).toFixed(2)
                        })()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terrain/15">
                          <DollarSign className="h-4 w-4 text-terrain-deep" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink">Withdrawable Funds</p>
                          <p className="text-xs text-muted-foreground">Commission from confirmed orders, ready for payout</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-terrain-deep">
                        ${((affiliateEarned - affiliatePaid) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Orders through code */}
                <div className="rounded-2xl border border-border bg-white ">
                  <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-ink">Orders via your code</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{affiliateOrders.length} total</span>
                  </div>
                  {affiliateOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">No orders yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">Share your code and start earning commissions.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {affiliateOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-ink">#{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{order.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-ink">${(order.total_cents / 100).toFixed(2)}</p>
                            <p className="text-xs font-medium text-terrain-deep">
                              +${((order.total_cents * 0.1) / 100).toFixed(2)} commission
                            </p>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              order.payment_status === 'paid'
                                ? 'bg-terrain/15 text-terrain-deep'
                                : 'bg-section-subtle text-muted-foreground'
                            }`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders ───────────────────────────────────── */}
        <div className="mb-12 mt-5 rounded-2xl border border-border bg-white ">
          <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-ink">Your Orders</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {ordersLoading ? '...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-terrain" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No orders yet</p>
              <p className="mt-1 text-xs text-muted-foreground">When you place an order, it will appear here.</p>
              <Link
                href="/shop"
                className="mt-5 rounded-full bg-terrain px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terrain-deep"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {order.items?.[0] && (
                      <p className="text-xs text-muted-foreground">{order.items[0].product_name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">
                        ${(order.total_cents / 100).toFixed(2)}
                      </p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-section-subtle text-ink/70'}`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add address modal ────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold text-ink">Add address</h3>
              <button onClick={() => { setShowAddModal(false); setAddError('') }} className="text-muted-foreground hover:text-ink/70">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    placeholder="First name *"
                    value={addForm.first_name}
                    onChange={e => setAddForm(f => ({ ...f, first_name: e.target.value }))}
                    className={FIELD}
                    required
                  />
                </div>
                <div>
                  <input
                    placeholder="Last name *"
                    value={addForm.last_name}
                    onChange={e => setAddForm(f => ({ ...f, last_name: e.target.value }))}
                    className={FIELD}
                    required
                  />
                </div>
              </div>

              <select
                value={addForm.country}
                onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))}
                className={FIELD}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Other">Other</option>
              </select>

              <input
                placeholder="Address *"
                value={addForm.address1}
                onChange={e => setAddForm(f => ({ ...f, address1: e.target.value }))}
                className={FIELD}
                required
              />

              <input
                placeholder="Apartment, suite, etc."
                value={addForm.address2}
                onChange={e => setAddForm(f => ({ ...f, address2: e.target.value }))}
                className={FIELD}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Postal code *"
                  value={addForm.postal_code}
                  onChange={e => setAddForm(f => ({ ...f, postal_code: e.target.value }))}
                  className={FIELD}
                  required
                />
                <input
                  placeholder="City *"
                  value={addForm.city}
                  onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))}
                  className={FIELD}
                  required
                />
              </div>

              <select
                value={addForm.province}
                onChange={e => setAddForm(f => ({ ...f, province: e.target.value }))}
                className={FIELD}
              >
                <option value="">State / Province</option>
                {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                placeholder="Phone"
                value={addForm.phone}
                onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                className={FIELD}
              />

              {addError && <p className="text-xs text-red-500">{addError}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddError('') }}
                  className="rounded-full border border-border px-5 py-2 text-sm font-medium text-ink/70 hover:bg-section-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex items-center gap-2 rounded-full bg-terrain px-5 py-2 text-sm font-medium text-white transition hover:bg-terrain-deep disabled:opacity-60"
                >
                  {addLoading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                  Save →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageFallback />}>
      <AccountPageContent />
    </Suspense>
  )
}
