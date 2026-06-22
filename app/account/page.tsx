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
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function AccountPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0A1931]" />
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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0A1931]" />
      </div>
    )
  }

  const userName = session.user?.name ?? session.user?.email?.split('@')[0] ?? 'User'
  const initial = (session.user?.name?.[0] ?? session.user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ── Dark hero header ─────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white ring-2 ring-white/20">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Hi, {userName}</h1>
              <p className="mt-0.5 text-sm text-white/50">{session.user?.email}</p>
              <p className="mt-2 text-sm text-white/45">
                View your order history and track your purchases.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab cards ────────────────────────────────────── */}
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            { id: 'profile', icon: User, label: 'Profile', sub: 'Edit your details' },
            { id: 'addresses', icon: MapPin, label: 'Addresses', sub: 'Manage addresses' },
            { id: 'discounts', icon: Tag, label: 'Discounts', sub: `${savedDiscounts.length} saved`, badge: savedDiscounts.length > 0 },
            { id: 'affiliate', icon: Users, label: 'Affiliate', sub: affiliateCode ? `Code: ${affiliateCode.code}` : 'Earn commissions', badge: false },
          ] as const).map(({ id, icon: Icon, label, sub, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition ${
                activeTab === id
                  ? 'border-[#6c5ce7] bg-[#6c5ce7] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {badge && activeTab !== id && (
                <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-emerald-500" />
              )}
              <Icon className="h-5 w-5 opacity-80" />
              <span className="text-sm font-semibold">{label}</span>
              <span className={`text-xs ${activeTab === id ? 'text-white/70' : 'text-gray-400'}`}>{sub}</span>
            </button>
          ))}
        </div>

        {/* ── Profile tab ──────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Your Profile</h2>
            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">Name</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">{session.user?.name ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">Email</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">{session.user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Addresses tab ────────────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Shipping Addresses</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  You can update your shipping address on the{' '}
                  <Link href="/checkout" className="text-[#6c5ce7] hover:underline">checkout page</Link>
                  . Saving your address will make future checkouts quicker.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {addressLoading ? (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#6c5ce7]" />
                </div>
              ) : addresses.length === 0 ? (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">New address</span>
                </button>
              ) : (
                <>
                  {addresses.map(addr => (
                    <div key={addr.id} className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{addr.first_name} {addr.last_name}</p>
                        <p className="text-gray-500">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
                        <p className="text-gray-500">{addr.city}{addr.province ? `, ${addr.province}` : ''} {addr.postal_code}</p>
                        <p className="text-gray-500">{addr.country}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="ml-3 shrink-0 text-gray-300 transition hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-sm text-gray-400 transition hover:border-gray-300 hover:text-gray-500"
                  >
                    <Plus className="h-4 w-4" />
                    Add address
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Discounts tab ────────────────────────────── */}
        {activeTab === 'discounts' && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Your Discount Codes</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Codes are applied automatically to your cart when you click &quot;Apply to Cart&quot;.
                </p>
              </div>
            </div>

            {appliedCode && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{appliedCode}</strong> applied to your cart!
                </span>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {savedDiscounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-gray-400">
                  <Tag className="h-8 w-8 opacity-40" />
                  <p className="text-sm font-medium">No discount codes yet</p>
                  <p className="text-xs">Discount codes you claim will appear here.</p>
                </div>
              ) : (
                savedDiscounts.map((d) => (
                  <div
                    key={d.code}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold tracking-widest text-[#0A1628]">
                          {d.code}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                          {d.percent}% OFF
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Claimed {new Date(d.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyDiscountCode(d.code)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:shadow-sm"
                      >
                        {copiedCode === d.code ? (
                          <><Check className="h-3.5 w-3.5 text-emerald-500" />Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" />Copy</>
                        )}
                      </button>
                      <button
                        onClick={() => applyToCart(d.code, d.percent)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0A1628] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#132744]"
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
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="grid md:grid-cols-2">
                {/* Left: text */}
                <div className="flex flex-col justify-center p-7 sm:p-8">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#6c5ce7]/70">
                    Partner Program
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold leading-snug text-gray-900 sm:text-3xl">
                    Partner with premium<br />research peptides
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
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
                        <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                        <p className="text-[0.7rem] font-medium text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {!affiliateCode && !affiliateLoading && (
                    <div className="mt-6">
                      <button
                        onClick={() => document.getElementById('claim-code-input')?.focus()}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0A1628] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#132744]"
                      >
                        Become a Partner →
                      </button>
                    </div>
                  )}
                </div>
                {/* Right: hero image */}
                <div className="relative flex items-center justify-center overflow-hidden bg-[#eef1f7] p-6">
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
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#6c5ce7]" />
              </div>
            ) : !affiliateCode ? (
              /* Code Claim Form */
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">Claim your referral code</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Choose a unique code — customers will use it for 10% off their order and you earn 10% commission.
                </p>
                <form onSubmit={handleClaimCode} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <input
                      id="claim-code-input"
                      placeholder="YOURCODE"
                      value={claimInput}
                      onChange={e => { setClaimInput(e.target.value.toUpperCase()); setClaimError('') }}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-gray-800 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/10"
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
                    className="flex items-center gap-2 rounded-xl bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#132744] disabled:opacity-50"
                  >
                    {claimLoading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Link2 className="h-3.5 w-3.5" />}
                    Claim Code
                  </button>
                </form>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400">or</span>
                  <button
                    type="button"
                    onClick={autoGenerateCode}
                    disabled={autoGenerating}
                    className="text-xs font-semibold text-[#6c5ce7] hover:underline disabled:opacity-50"
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
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Your Code</p>
                    <p className="mt-1.5 font-mono text-2xl font-extrabold tracking-widest text-[#0A1628]">
                      {affiliateCode.code}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{affiliateCode.discount_percent}% off for customers</p>
                    <button
                      onClick={() => copyAffiliateCode(affiliateCode.code)}
                      className="mt-3 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:shadow-sm"
                    >
                      {copiedAffiliate ? <><Check className="h-3.5 w-3.5 text-emerald-500" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy Code</>}
                    </button>
                  </div>

                  {/* Withdrawable Funds */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Withdrawable Funds</p>
                        <p className="mt-1.5 text-2xl font-extrabold text-emerald-700">
                          ${((affiliateEarned - affiliatePaid) / 100).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-emerald-600/70">Available for withdrawal</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-emerald-400/50" />
                    </div>
                  </div>

                  {/* Funds Received */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Funds Received</p>
                        <p className="mt-1.5 text-2xl font-extrabold text-gray-900">
                          ${(affiliatePaid / 100).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">Total paid out</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Payouts Section */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Payouts</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payouts Being Confirmed</p>
                          <p className="text-xs text-gray-400">Earnings from orders awaiting payment confirmation</p>
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
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Withdrawable Funds</p>
                          <p className="text-xs text-gray-400">Commission from confirmed orders, ready for payout</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">
                        ${((affiliateEarned - affiliatePaid) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Orders through code */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
                    <Users className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Orders via your code</h3>
                    <span className="ml-auto text-xs text-gray-400">{affiliateOrders.length} total</span>
                  </div>
                  {affiliateOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="h-10 w-10 text-gray-200" strokeWidth={1.5} />
                      <p className="mt-3 text-sm font-medium text-gray-500">No orders yet</p>
                      <p className="mt-1 text-xs text-gray-400">Share your code and start earning commissions.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {affiliateOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                            <p className="text-xs text-gray-400">{order.email}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">${(order.total_cents / 100).toFixed(2)}</p>
                            <p className="text-xs font-medium text-emerald-600">
                              +${((order.total_cents * 0.1) / 100).toFixed(2)} commission
                            </p>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
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
        <div className="mb-12 mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
            <ShoppingBag className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Your Orders</h2>
            <span className="ml-auto text-xs text-gray-400">
              {ordersLoading ? '...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#0A1931]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Package className="h-12 w-12 text-gray-200" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-gray-500">No orders yet</p>
              <p className="mt-1 text-xs text-gray-400">When you place an order, it will appear here.</p>
              <Link
                href="/shop"
                className="mt-5 rounded-full bg-[#0A1931] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2040]"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {order.items?.[0] && (
                      <p className="text-xs text-gray-500">{order.items[0].product_name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${(order.total_cents / 100).toFixed(2)}
                      </p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
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
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Add address</h3>
              <button onClick={() => { setShowAddModal(false); setAddError('') }} className="text-gray-400 hover:text-gray-600">
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
                    required
                  />
                </div>
                <div>
                  <input
                    placeholder="Last name *"
                    value={addForm.last_name}
                    onChange={e => setAddForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
                    required
                  />
                </div>
              </div>

              <select
                value={addForm.country}
                onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
                required
              />

              <input
                placeholder="Apartment, suite, etc."
                value={addForm.address2}
                onChange={e => setAddForm(f => ({ ...f, address2: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Postal code *"
                  value={addForm.postal_code}
                  onChange={e => setAddForm(f => ({ ...f, postal_code: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
                  required
                />
                <input
                  placeholder="City *"
                  value={addForm.city}
                  onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
                  required
                />
              </div>

              <select
                value={addForm.province}
                onChange={e => setAddForm(f => ({ ...f, province: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7]/20"
              />

              {addError && <p className="text-xs text-red-500">{addError}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddError('') }}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex items-center gap-2 rounded-full bg-[#0A1931] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0d2040] disabled:opacity-60"
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
