'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, Package, X } from 'lucide-react'
import type { Order, OrderItem, ShippingAddress } from '@/lib/types'
import { formatOrderNumberDisplay } from '@/lib/paypal-order-id'
import { Separator } from '@/components/ui/separator'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-800',
}

type AdminOrder = Order & { items: OrderItem[] }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      if (res.status === 401) {
        localStorage.removeItem('terrain-admin-token')
        window.location.href = '/admin/login'
        return
      }
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id: orderId, status }),
      })

      if (res.ok) {
        toast.success('Order status updated')
        fetchOrders()
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
        }
      } else {
        toast.error('Failed to update order')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const updateTrackingNumber = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id: selectedOrder.id, tracking_number: trackingNumber }),
      })

      if (res.ok) {
        toast.success('Tracking number updated')
        fetchOrders()
        setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber })
      } else {
        toast.error('Failed to update tracking')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      if (res.ok) {
        toast.success('Order deleted')
        fetchOrders()
        if (selectedOrder?.id === orderId) setSelectedOrder(null)
      } else {
        toast.error('Failed to delete order')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const sendShippingEmail = () => {
    if (!selectedOrder) return
    const tn = trackingNumber.trim() || selectedOrder.tracking_number || ''
    const subject = encodeURIComponent(
      `Your Terrain Peptides order ${formatOrderNumberDisplay(selectedOrder.order_number)} has shipped`
    )
    const body = encodeURIComponent(
      `Hi,\n\nYour order ${formatOrderNumberDisplay(selectedOrder.order_number)} has shipped.\n\nTracking number: ${tn || '[add tracking number]'}\n\nThanks,\nTerrain Peptides`
    )
    window.location.href = `mailto:${selectedOrder.email}?subject=${subject}&body=${body}`
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {formatOrderNumberDisplay(order.order_number)}
                      </p>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                      <Badge
                        className={
                          paymentStatusColors[order.payment_status] ||
                          'bg-muted text-muted-foreground'
                        }
                      >
                        {order.payment_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[order.customer_name, order.email].filter(Boolean).join(' • ')}
                      {order.customer_name || order.email ? ' · ' : ''}
                      {formatDate(order.created_at)}
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {formatPrice(order.total_cents)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedOrder(order)
                        setTrackingNumber(order.tracking_number || '')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No orders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Order {selectedOrder ? formatOrderNumberDisplay(selectedOrder.order_number) : ''}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order ID</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-foreground">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Placed</p>
                  <p className="mt-0.5 text-foreground">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order status</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tracking number</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="flex-1"
                  />
                  <Button type="button" onClick={updateTrackingNumber}>
                    Save
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}>
                    Mark fulfilled
                  </Button>
                  <Button type="button" variant="outline" onClick={sendShippingEmail}>
                    Send email (mailto)
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Payment</h4>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Method</dt>
                    <dd className="font-medium capitalize text-foreground">{selectedOrder.payment_method}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Payment status</dt>
                    <dd className="font-medium capitalize text-foreground">{selectedOrder.payment_status}</dd>
                  </div>
                  {selectedOrder.stripe_session_id ? (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Stripe reference (PaymentIntent / session)</dt>
                      <dd className="break-all font-mono text-xs text-foreground">{selectedOrder.stripe_session_id}</dd>
                    </div>
                  ) : null}
                  {selectedOrder.crypto_address ? (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Crypto address</dt>
                      <dd className="break-all font-mono text-xs text-foreground">{selectedOrder.crypto_address}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Referral &amp; discount codes</h4>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Referral code</dt>
                    <dd className="font-medium text-foreground">{selectedOrder.referral_code || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Discount / promo code</dt>
                    <dd className="font-medium text-foreground">{selectedOrder.discount_code || '—'}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Customer &amp; contact</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name (order)</dt>
                    <dd className="font-medium text-foreground">{selectedOrder.customer_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email (order)</dt>
                    <dd className="break-all text-foreground">{selectedOrder.email || '—'}</dd>
                  </div>
                  {selectedOrder.customer_email && selectedOrder.customer_email !== selectedOrder.email ? (
                    <div>
                      <dt className="text-muted-foreground">Customer email (row)</dt>
                      <dd className="break-all text-foreground">{selectedOrder.customer_email}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {(() => {
                const ship = selectedOrder.shipping_address as (ShippingAddress & {
                  email?: string
                  phone?: string
                  company?: string
                  shipping_cents?: number
                  tax_cents?: number
                }) | null
                if (!ship) {
                  return (
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No shipping address on file.
                    </div>
                  )
                }
                return (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Shipping &amp; delivery details</h4>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Ship to name</dt>
                        <dd className="font-medium text-foreground">{ship.name || '—'}</dd>
                      </div>
                      {ship.company ? (
                        <div className="sm:col-span-2">
                          <dt className="text-muted-foreground">Company</dt>
                          <dd className="text-foreground">{ship.company}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="text-foreground">{ship.phone || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Email (checkout)</dt>
                        <dd className="break-all text-foreground">{ship.email || '—'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="whitespace-pre-line text-foreground">
                          {ship.address1}
                          {ship.address2 ? `\n${ship.address2}` : ''}
                          {`\n${ship.city}, ${ship.state} ${ship.zip}`}
                          {`\n${ship.country}`}
                        </dd>
                      </div>
                      {typeof ship.shipping_cents === 'number' ? (
                        <div>
                          <dt className="text-muted-foreground">Shipping (checkout)</dt>
                          <dd className="text-foreground">{formatPrice(ship.shipping_cents)}</dd>
                        </div>
                      ) : null}
                      {typeof ship.tax_cents === 'number' ? (
                        <div>
                          <dt className="text-muted-foreground">Tax (checkout)</dt>
                          <dd className="text-foreground">{formatPrice(ship.tax_cents)}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                )
              })()}

              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">Line items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => {
                    const line =
                      item.line_total_cents != null
                        ? item.line_total_cents
                        : item.price_cents * item.quantity
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1 rounded-lg border border-border p-3 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Product ID:{' '}
                            <span className="font-mono text-foreground">{item.product_id || '—'}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty {item.quantity} · {formatPrice(item.price_cents)} each
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold tabular-nums text-foreground">{formatPrice(line)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                <h4 className="text-sm font-semibold text-foreground">Totals</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums text-foreground">{formatPrice(selectedOrder.subtotal_cents)}</span>
                </div>
                {selectedOrder.discount_cents > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="tabular-nums text-green-600">-{formatPrice(selectedOrder.discount_cents)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-foreground">Charged total</span>
                  <span className="tabular-nums text-foreground">{formatPrice(selectedOrder.total_cents)}</span>
                </div>
              </div>

              {selectedOrder.full_record && Object.keys(selectedOrder.full_record).length > 0 ? (
                <details className="rounded-lg border border-border p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-foreground">Raw database row (orders)</summary>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(selectedOrder.full_record, null, 2)}
                  </pre>
                </details>
              ) : null}

              {selectedOrder.items?.some((i) => i.full_item && Object.keys(i.full_item).length > 0) ? (
                <details className="rounded-lg border border-border p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-foreground">Raw line items (order_items)</summary>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(
                      selectedOrder.items.map((i) => i.full_item ?? { id: i.id, product_name: i.product_name }),
                      null,
                      2
                    )}
                  </pre>
                </details>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
