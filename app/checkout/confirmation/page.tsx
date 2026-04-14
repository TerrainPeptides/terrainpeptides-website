'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Package, ArrowRight } from 'lucide-react'
import { formatOrdOrderIdDisplay } from '@/lib/paypal-order-id'

type CaptureState = 'loading' | 'success' | 'error'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  // PayPal redirects back with ?token=PAYPAL_ORDER_ID&PayerID=PAYER_ID
  const paypalOrderId = searchParams.get('token')

  const { clearCart } = useCart()
  const [state, setState] = useState<CaptureState>('loading')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!paypalOrderId) {
      setState('error')
      setErrorMessage('No PayPal order ID found in the URL. Please contact support.')
      return
    }

    let cancelled = false

    async function capture() {
      try {
        const res = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypalOrderId }),
        })

        const data = (await res.json()) as {
          success?: boolean
          orderNumber?: string | null
          warning?: string
          error?: string
        }

        if (cancelled) return

        if (res.ok && data.success) {
          clearCart()
          setOrderNumber(data.orderNumber ?? null)
          if (data.warning) setWarning(data.warning)
          setState('success')
        } else {
          setErrorMessage(data.error ?? 'Payment capture failed. Please contact support.')
          setState('error')
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('Could not confirm your payment. Please contact support if you were charged.')
          setState('error')
        }
      }
    }

    void capture()
    return () => {
      cancelled = true
    }
  }, [paypalOrderId, clearCart])

  if (state === 'loading') {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-foreground" />
              <h1 className="mt-6 text-xl font-bold text-foreground">Confirming your payment…</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we capture your PayPal payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-foreground">Payment Not Confirmed</h1>
              <p className="mt-2 text-muted-foreground">
                {errorMessage ?? 'Something went wrong. Please contact support.'}
              </p>
              {paypalOrderId && (
                <p className="mt-4 text-xs text-muted-foreground">
                  PayPal Order ID: <code className="font-mono">{paypalOrderId}</code>
                </p>
              )}
              <div className="mt-8 w-full space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90">
                    Return to Checkout
                  </Button>
                </Link>
                <Link href="/shop" className="block">
                  <Button variant="outline" className="w-full">
                    Browse Products
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
              Thank you for your order. A confirmation email will be sent to your email address.
            </p>

            {orderNumber && (
              <p className="mt-4 rounded-lg bg-muted/60 px-4 py-2 text-sm font-medium text-foreground">
                Order {formatOrdOrderIdDisplay(orderNumber)}
              </p>
            )}

            {warning && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {warning}
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
                <Button className="w-full gap-2 bg-[#0A1628] hover:bg-[#0A1628]/90">
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

export default function CheckoutConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
