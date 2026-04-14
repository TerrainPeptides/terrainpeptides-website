'use client'

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { formatOrdOrderIdDisplay } from '@/lib/paypal-order-id'

function SuccessContent() {
  const searchParams = useSearchParams()

  // ?session_id=... — Stripe Checkout Sessions path
  const sessionId = searchParams.get('session_id')

  // ?order=ORD-######&payment_intent=pi_...&redirect_status=succeeded — Elements / PaymentIntent path
  const orderNumber = searchParams.get('order')
  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  const { clearCart } = useCart()
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const isPaymentIntentSuccess = redirectStatus === 'succeeded' && Boolean(paymentIntentId)
  const isSessionSuccess = Boolean(sessionId)
  const isSuccess = isSessionSuccess || isPaymentIntentSuccess

  useEffect(() => {
    if (isSuccess) clearCart()
  }, [isSuccess, clearCart])

  /** Mark order paid in Supabase immediately (does not rely on Stripe webhooks). */
  useEffect(() => {
    if (!isSuccess) return

    let cancelled = false

    async function confirmOrderInDatabase() {
      try {
        if (sessionId) {
          const res = await fetch('/api/checkout/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          if (!res.ok && !cancelled) {
            const data = (await res.json().catch(() => ({}))) as { error?: string }
            setConfirmError(data.error || 'Could not finalize your order for the admin dashboard.')
          }
          return
        }

        if (orderNumber && paymentIntentId) {
          const res = await fetch('/api/checkout/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber, paymentIntentId }),
          })
          if (!res.ok && !cancelled) {
            const data = (await res.json().catch(() => ({}))) as { error?: string }
            setConfirmError(data.error || 'Could not finalize your order for the admin dashboard.')
          }
        } else if (!cancelled && isPaymentIntentSuccess) {
          setConfirmError('Missing order reference. Save your order number and contact support if needed.')
        }
      } catch {
        if (!cancelled) setConfirmError('Could not finalize your order. Your payment may still be valid.')
      }
    }

    void confirmOrderInDatabase()
    return () => {
      cancelled = true
    }
  }, [isSuccess, sessionId, orderNumber, paymentIntentId, isPaymentIntentSuccess])

  if (!isSuccess) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <CheckCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-foreground">
                Payment could not be confirmed
              </h1>
              <p className="mt-2 text-muted-foreground">
                Your payment may still be processing. Please check your email for confirmation,
                or contact support if you were charged.
              </p>
              <div className="mt-8 w-full space-y-4">
                <Link href="/shop" className="block">
                  <Button variant="outline" className="w-full">
                    Return to Shop
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-foreground">Payment Successful!</h1>

            <p className="mt-2 text-muted-foreground">
              Thank you for your order. A confirmation email has been sent to your email address.
            </p>

            {orderNumber && (
              <p className="mt-4 rounded-lg bg-muted/60 px-4 py-2 text-sm font-medium text-foreground">
                Order {formatOrdOrderIdDisplay(orderNumber)}
              </p>
            )}

            {confirmError && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {confirmError}
              </p>
            )}

            <div className="mt-8 w-full space-y-4">
              <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-4">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Your order is being processed and will ship soon.
                </span>
              </div>

              <Link href="/track" className="block">
                <Button className="w-full gap-2">
                  Track Your Order
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/shop" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
