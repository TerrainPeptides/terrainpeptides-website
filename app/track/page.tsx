'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import type { Order, OrderItem } from '@/lib/types'
import { formatOrderNumberDisplay } from '@/lib/paypal-order-id'

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
}

function TrackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(() => searchParams.get('order')?.trim() ?? '')
  const [email, setEmail] = useState(() => searchParams.get('email')?.trim() ?? '')
  const [isSearching, setIsSearching] = useState(() => {
    return (
      searchParams.get('auto') === '1' &&
      Boolean(searchParams.get('order')?.trim()) &&
      Boolean(searchParams.get('email')?.trim())
    )
  })
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null)
  const [notFound, setNotFound] = useState(false)
  /** From PayPal “I’ve confirmed” redirect (?auto=1) until lookup finishes */
  const [isConfirmingRedirect, setIsConfirmingRedirect] = useState(() => {
    return (
      searchParams.get('auto') === '1' &&
      Boolean(searchParams.get('order')?.trim()) &&
      Boolean(searchParams.get('email')?.trim())
    )
  })

  const runLookup = async (orderNum: string, emailAddr: string) => {
    if (!orderNum.trim() || !emailAddr.trim()) return
    setIsSearching(true)
    setNotFound(false)
    setOrder(null)
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNum.trim(), email: emailAddr.trim() }),
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
    if (!orderNumber.trim() || !email.trim()) return
    setIsConfirmingRedirect(false)
    await runLookup(orderNumber, email)
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const status = order ? statusConfig[order.status] : null
  const StatusIcon = status?.icon || Clock

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your order number and email to track your shipment.
          </p>
        </div>

        {isConfirmingRedirect && (
          <Card className="mb-8 border-primary/25 bg-primary/[0.04]">
            <CardContent className="flex flex-col items-center gap-4 py-10 sm:py-12">
              <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Confirming your order</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;re connecting your payment to your order and loading your details…
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Lookup</CardTitle>
            <CardDescription>
              Find your order number in your confirmation email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., #ORD-571637"
                  disabled={isConfirmingRedirect}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isConfirmingRedirect}
                />
              </div>
              <Button type="submit" disabled={isSearching || isConfirmingRedirect} className="w-full gap-2">
                <Search className="h-4 w-4" />
                {isSearching || isConfirmingRedirect ? 'Loading…' : 'Track Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                Order Not Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                We could not find an order with that number and email combination. Please check your details and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Order {formatOrderNumberDisplay(order.order_number)}</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <Badge className={status?.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tracking Number */}
              {order.tracking_number && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="mt-1 font-mono font-medium text-foreground">
                    {order.tracking_number}
                  </p>
                </div>
              )}

              {/* Order Status Timeline */}
              <div>
                <h3 className="mb-4 font-semibold text-foreground">Order Status</h3>
                <div className="space-y-4">
                  {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                    const stepConfig = statusConfig[step as keyof typeof statusConfig]
                    const StepIcon = stepConfig.icon
                    const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                    const isCurrent = order.status === step

                    return (
                      <div key={step} className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {stepConfig.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground">Current status</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="mb-4 font-semibold text-foreground">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-foreground">
                        {formatPrice(item.price_cents * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(order.subtotal_cents)}</span>
                </div>
                {order.discount_cents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-{formatPrice(order.discount_cents)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(order.total_cents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TrackPageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
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
