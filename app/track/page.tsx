'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { Order, OrderItem } from '@/lib/types'
import { formatOrderNumberDisplay } from '@/lib/paypal-order-id'
import type { TrackLookupMethod } from '@/lib/order-track'
import { cn } from '@/lib/utils'

const TABS: { id: TrackLookupMethod; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'order', label: 'Order #' },
]

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', icon: Package, color: 'bg-terrain-muted text-terrain-deep' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
}

function TrackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<TrackLookupMethod>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [zip, setZip] = useState('')

  const [isSearching, setIsSearching] = useState(() => {
    return (
      searchParams.get('auto') === '1' &&
      Boolean(searchParams.get('order')?.trim()) &&
      Boolean(searchParams.get('email')?.trim())
    )
  })
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isConfirmingRedirect, setIsConfirmingRedirect] = useState(() => {
    return (
      searchParams.get('auto') === '1' &&
      Boolean(searchParams.get('order')?.trim()) &&
      Boolean(searchParams.get('email')?.trim())
    )
  })

  const runLookup = async (payload: Record<string, string>) => {
    setIsSearching(true)
    setNotFound(false)
    setOrder(null)
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.order) {
        setOrder(data.order)
      } else {
        setNotFound(true)
      }
    } catch {
      toast.error('Failed to search for order')
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const auto = searchParams.get('auto') === '1'
    const o = searchParams.get('order')?.trim()
    const em = searchParams.get('email')?.trim()
    if (!auto || !o || !em) return

    setOrderNumber(o)
    setEmail(em)

    let cancelled = false
    void (async () => {
      setIsSearching(true)
      setNotFound(false)
      setOrder(null)
      try {
        const res = await fetch('/api/orders/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: o, email: em }),
        })
        const data = await res.json()
        if (cancelled) return
        if (data.order) {
          setOrder(data.order)
        } else {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) toast.error('Failed to load your order')
      } finally {
        if (!cancelled) {
          setIsSearching(false)
          setIsConfirmingRedirect(false)
          router.replace('/track', { scroll: false })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!zip.trim()) {
      toast.error('Please enter your ZIP code')
      return
    }

    setIsConfirmingRedirect(false)

    const payload: Record<string, string> = { method: activeTab, zip: zip.trim() }

    if (activeTab === 'email') {
      if (!email.trim()) {
        toast.error('Please enter your email address')
        return
      }
      payload.email = email.trim()
    } else if (activeTab === 'name') {
      if (!name.trim()) {
        toast.error('Please enter your full name')
        return
      }
      payload.name = name.trim()
    } else if (activeTab === 'phone') {
      if (!phone.trim()) {
        toast.error('Please enter your phone number')
        return
      }
      payload.phone = phone.trim()
    } else {
      if (!orderNumber.trim()) {
        toast.error('Please enter your order number')
        return
      }
      payload.orderNumber = orderNumber.trim()
    }

    await runLookup(payload)
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const status = order ? statusConfig[order.status] : null
  const StatusIcon = status?.icon || Clock

  return (
    <div className="min-h-screen bg-section-subtle">
      <div className="mx-auto max-w-lg px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-primary/20 bg-section-clinical text-primary shadow-sm">
            <Search className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Order lookup</p>
          <h1 className="page-title mt-2 text-3xl font-semibold sm:text-[2rem]">
            Track Your Order
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Enter your details below to find your order and check its status.
          </p>
        </div>

        {isConfirmingRedirect && (
          <div className="mb-8 flex flex-col items-center gap-4 rounded-lg border border-border bg-white px-6 py-10 text-center shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
            <div>
              <p className="text-lg font-semibold text-navy">Confirming your order</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;re connecting your payment to your order and loading your details…
              </p>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="grid grid-cols-4 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'border-b-2 px-2 py-3.5 text-center text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary font-semibold text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="space-y-5 px-6 py-7 sm:px-8 sm:py-8">
            {activeTab === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="track-email" className="text-sm font-medium text-navy">
                  Email address
                </Label>
                <Input
                  id="track-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isConfirmingRedirect}
                  className="h-11 rounded-lg border-border bg-white text-navy placeholder:text-muted-foreground/60"
                />
              </div>
            )}

            {activeTab === 'name' && (
              <div className="space-y-2">
                <Label htmlFor="track-name" className="text-sm font-medium text-navy">
                  Full name (as entered at checkout)
                </Label>
                <Input
                  id="track-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isConfirmingRedirect}
                  className="h-11 rounded-lg border-border bg-white text-navy placeholder:text-muted-foreground/60"
                />
              </div>
            )}

            {activeTab === 'phone' && (
              <div className="space-y-2">
                <Label htmlFor="track-phone" className="text-sm font-medium text-navy">
                  Phone number
                </Label>
                <Input
                  id="track-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isConfirmingRedirect}
                  className="h-11 rounded-lg border-border bg-white text-navy placeholder:text-muted-foreground/60"
                />
              </div>
            )}

            {activeTab === 'order' && (
              <div className="space-y-2">
                <Label htmlFor="track-order" className="text-sm font-medium text-navy">
                  Order number
                </Label>
                <Input
                  id="track-order"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ORD-123456"
                  disabled={isConfirmingRedirect}
                  className="h-11 rounded-lg border-border bg-white text-navy placeholder:text-muted-foreground/60"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="track-zip" className="text-sm font-medium text-navy">
                ZIP code
              </Label>
              <Input
                id="track-zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="12345"
                inputMode="numeric"
                disabled={isConfirmingRedirect}
                className="h-11 max-w-[220px] rounded-lg border-border bg-white text-navy placeholder:text-muted-foreground/60"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || isConfirmingRedirect}
              className="flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isSearching || isConfirmingRedirect ? 'Searching…' : 'Find My Order'}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Still can&apos;t find your order?{' '}
          <Link href="/contact" className="font-semibold text-navy underline underline-offset-2">
            Email our support team
          </Link>
        </p>

        {/* Not found */}
        {notFound && (
          <div className="mt-10 flex flex-col items-center rounded-lg border border-red-200 bg-red-50/80 px-6 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold text-navy">Order not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t find a match with those details. Double-check your info and try again.
            </p>
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="mt-10 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            <div className="border-b border-border px-6 py-5 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-navy">
                    Order {formatOrderNumberDisplay(order.order_number)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                </div>
                <Badge className={status?.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status?.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8">
              {order.tracking_number && (
                <div className="rounded-xl bg-[#F5F5F5] px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tracking number
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-navy">
                    {order.tracking_number}
                  </p>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy">Order status</h3>
                <div className="space-y-3">
                  {(['pending', 'processing', 'shipped', 'delivered'] as const).map((step, index) => {
                    const stepConfig = statusConfig[step]
                    const StepIcon = stepConfig.icon
                    const isActive =
                      ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                    const isCurrent = order.status === step
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full',
                            isActive ? 'bg-black text-white' : 'bg-black/10 text-muted-foreground'
                          )}
                        >
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={cn('text-sm font-medium', isActive ? 'text-navy' : 'text-muted-foreground')}>
                            {stepConfig.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-muted-foreground">Current status</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy">Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm">
                      <div>
                        <p className="font-medium text-navy">{item.product_name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-navy">
                        {formatPrice(item.price_cents * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-navy">{formatPrice(order.subtotal_cents)}</span>
                </div>
                {order.discount_cents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-{formatPrice(order.discount_cents)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-navy">Total</span>
                  <span className="text-navy">{formatPrice(order.total_cents)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TrackPageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#F5F5F5] px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-navy" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackPageFallback />}>
      <TrackPageContent />
    </Suspense>
  )
}
