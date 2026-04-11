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
import type { Order, OrderItem } from '@/lib/types'

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<(Order & { items: OrderItem[] }) | null>(null)
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
    const subject = encodeURIComponent(`Your Terrain Peptides order ${selectedOrder.order_number} has shipped`)
    const body = encodeURIComponent(
      `Hi,\n\nYour order ${selectedOrder.order_number} has shipped.\n\nTracking number: ${tn || '[add tracking number]'}\n\nThanks,\nTerrain Peptides`
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
                        {order.order_number}
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
                      {(order.customer_name || order.email) && ' • '}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
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

              {/* Tracking */}
              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                  <Button onClick={updateTrackingNumber}>Save</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}>
                    Mark Fulfilled
                  </Button>
                  <Button variant="outline" onClick={sendShippingEmail}>
                    Send Email Notification
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 font-semibold text-foreground">Customer</h4>
                {selectedOrder.customer_name && (
                  <p className="text-sm font-medium text-foreground">{selectedOrder.customer_name}</p>
                )}
                <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                {selectedOrder.shipping_address && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.address1}</p>
                    {selectedOrder.shipping_address.address2 && (
                      <p>{selectedOrder.shipping_address.address2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{' '}
                      {selectedOrder.shipping_address.zip}
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between rounded-lg border border-border p-3">
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

              {/* Totals */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.subtotal_cents)}</span>
                </div>
                {selectedOrder.discount_cents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-{formatPrice(selectedOrder.discount_cents)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.total_cents)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
