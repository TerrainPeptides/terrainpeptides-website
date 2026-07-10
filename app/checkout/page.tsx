'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Stripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripePublishableKeyIssueAsync, getStripePromise } from '@/lib/stripe-client'
import { resolveProductImageSrc } from '@/lib/product-image'
import { useCart } from '@/lib/cart-context'
import { packageLineTotalCents } from '@/lib/product-price'
import { displayDosageLabel } from '@/lib/dosage-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { AddressAutocomplete, validateShippingAddress } from '@/components/address-autocomplete'
import {
  Check,
  ArrowLeft,
  ShoppingBag,
  Lock,
  Shield,
  Package,
  FlaskConical,
  Truck,
} from 'lucide-react'

const SHIPPING_CENTS = 2499
const HST_RATE = 0.13

interface ShippingInfo {
  name: string
  email: string
  phone: string
  address1: string
  address2: string
  company: string
  city: string
  state: string
  zip: string
  country: string
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function getStandardShippingDateRange(): string {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() + 6)
  const end = new Date(today)
  end.setDate(today.getDate() + 8)
  const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      }
    )
  })
}

/** Wait for Stripe.js + publishable key, then mount Elements (avoids infinite spinner on bad keys). */
function StripePaymentSection({
  clientSecret,
  orderNumber,
  totalCents,
}: {
  clientSecret: string
  orderNumber: string
  totalCents: number
}) {
  const [stripe, setStripe] = useState<Stripe | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setStripe(undefined)
    setLoadError(null)
    let cancelled = false
    ;(async () => {
      const issue = await getStripePublishableKeyIssueAsync()
      if (cancelled) return
      if (issue) {
        setLoadError(issue)
        setStripe(null)
        return
      }
      try {
        const instance = await withTimeout(
          getStripePromise(),
          20000,
          'Loading Stripe.js timed out. Check your network, disable ad blockers for this site, or confirm js.stripe.com is not blocked.'
        )
        if (cancelled) return
        if (!instance) {
          const again = await getStripePublishableKeyIssueAsync()
          setLoadError(
            again ??
              'Stripe.js could not initialize. Restart `npm run dev` after editing .env.local, and confirm your publishable key in Stripe Dashboard → Developers → API keys.'
          )
          setStripe(null)
          return
        }
        setStripe(instance)
        setLoadError(null)
      } catch (e) {
        if (cancelled) return
        setLoadError(e instanceof Error ? e.message : 'Failed to load Stripe')
        setStripe(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clientSecret])

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        <p className="font-medium">Payment form could not load</p>
        <p className="mt-2 text-destructive/90">{loadError}</p>
      </div>
    )
  }

  if (stripe === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
        <p>Loading secure payment form…</p>
      </div>
    )
  }

  if (!stripe) return null

  return (
    <Elements
      key={clientSecret}
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0369A1',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentFormInner totalCents={totalCents} orderNumber={orderNumber} />
    </Elements>
  )
}

// ── Stripe Payment Form (must be inside <Elements>) ────────────────────────
function PaymentFormInner({
  totalCents,
  orderNumber,
}: {
  totalCents: number
  orderNumber: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentElementReady, setPaymentElementReady] = useState(false)
  const [elementError, setElementError] = useState<string | null>(null)
  const [ackResearch, setAckResearch] = useState(false)
  const [ackPowder, setAckPowder] = useState(false)

  useEffect(() => {
    setIsProcessing(false)
    setPaymentElementReady(false)
    setElementError(null)
    setAckResearch(false)
    setAckPowder(false)
  }, [])

  useEffect(() => {
    if (elementError || paymentElementReady) return
    const t = setTimeout(() => {
      setElementError(
        'The card form is taking too long to appear. Common causes: (1) live publishable key (pk_live_) paired with a test PaymentIntent or the opposite — use matching test/live keys on server and client; (2) an extension or firewall blocking Stripe; (3) dev server needs a restart after changing .env.local.'
      )
    }, 25000)
    return () => clearTimeout(t)
  }, [elementError, paymentElementReady])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    try {
      const submitResult = await withTimeout(
        elements.submit(),
        45000,
        'Validating your card timed out. Check your connection and try again.'
      )
      if (submitResult.error) {
        toast.error(submitResult.error.message ?? 'Please check your payment details.')
        return
      }

      const { error } = await withTimeout(
        stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?order=${encodeURIComponent(orderNumber)}`,
          },
        }),
        120000,
        'Confirming payment timed out. If you were charged, check your email; otherwise try again.'
      )

      if (error) {
        toast.error(error.message ?? 'Payment failed. Please try again.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment step failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const agreementsOk = ackResearch && ackPowder
  const payBlocked =
    isProcessing || !stripe || !elements || !paymentElementReady || !agreementsOk

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {elementError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {elementError}
        </div>
      )}

      <PaymentElement
        options={{ layout: 'accordion' }}
        onReady={() => {
          setPaymentElementReady(true)
          setElementError(null)
        }}
        onLoadError={(ev) => {
          const msg = ev.error.message ?? 'Could not load payment fields'
          setElementError(msg)
          toast.error(msg)
        }}
      />

      <div className="space-y-4 rounded-lg border border-border/70 bg-muted/25 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Required acknowledgements
        </p>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-foreground/90">
          <input
            type="checkbox"
            checked={ackResearch}
            onChange={(e) => setAckResearch(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
          />
          <span>
            I confirm that I am at least 18 years of age and am purchasing these products for{' '}
            <strong className="font-semibold text-foreground">research purposes only</strong>. These
            peptides are <strong className="font-semibold text-foreground">not intended for human consumption</strong>,
            veterinary use, therapeutic applications, or any diagnostic purposes. I understand and accept full
            responsibility for the proper handling and use of these products.{' '}
            <strong className="font-semibold text-foreground">
              Terrain Peptides is not liable for any misuse of these products.
            </strong>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-foreground/90">
          <input
            type="checkbox"
            checked={ackPowder}
            onChange={(e) => setAckPowder(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
          />
          <span>
            I understand that all products are shipped as{' '}
            <strong className="font-semibold text-foreground">freeze-dried powder</strong>.
            Freeze-drying preserves product stability, ensures sterility, and protects products during transit.{' '}
            <strong className="font-semibold text-foreground">
              Terrain Peptides does not provide, solicit, or endorse any usage instructions, dosage guidance, or
              administration protocols for any products sold.
            </strong>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={payBlocked}
        className="w-full bg-primary text-white hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
        size="lg"
      >
        {isProcessing
          ? 'Processing…'
          : !paymentElementReady
            ? 'Loading card form…'
            : `Pay ${formatPrice(totalCents)}`}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        Secured by Stripe. Your card details are encrypted end-to-end.
      </div>

      <p className="text-center text-xs text-muted-foreground">
        This charge will appear as{' '}
        <span className="font-medium text-foreground">Royal Auto Detailing</span>{' '}
        on your statement.
      </p>
    </form>
  )
}

// ── Order Summary (right sidebar) ──────────────────────────────────────────
function OrderSummary({
  items,
  subtotalCents,
  discountCents,
  referralCode,
  country,
}: {
  items: ReturnType<typeof useCart>['items']
  subtotalCents: number
  discountCents: number
  referralCode: string | null
  country: string
}) {
  const afterDiscount = subtotalCents - discountCents
  const taxCents = country === 'CA' ? Math.round(afterDiscount * HST_RATE) : 0
  const totalCents = afterDiscount + SHIPPING_CENTS + taxCents

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {items.map((item) => {
          const dose = displayDosageLabel(item.product, item.dosage_variant_id)
          const imageSrc = resolveProductImageSrc(item.product)
          return (
            <div
              key={`${item.product.id}-${item.dosage_variant_id}`}
              className="flex gap-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.product.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dose ? `${dose} · ` : ''}
                  {item.quantity === 1 ? '1 research vial' : `${item.quantity} research vials`}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-foreground">
                {formatPrice(
                  packageLineTotalCents(item.product, item.quantity, item.dosage_variant_id)
                )}
              </p>
            </div>
          )
        })}
      </div>

      <Separator />

      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums text-foreground">{formatPrice(subtotalCents)}</span>
        </div>
        {discountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">
              Discount{referralCode ? ` (${referralCode})` : ''}
            </span>
            <span className="tabular-nums text-green-600">-{formatPrice(discountCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            Shipping
          </span>
          <span className="tabular-nums text-foreground">{formatPrice(SHIPPING_CENTS)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Tax{country === 'CA' ? ' (13% HST)' : ''}
          </span>
          <span className="tabular-nums text-foreground">
            {taxCents > 0 ? formatPrice(taxCents) : '$0.00'}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span className="text-foreground">Total</span>
        <span className="tabular-nums text-foreground">{formatPrice(totalCents)}</span>
      </div>
    </div>
  )
}

// ── Main Checkout Page ─────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { data: session } = useSession()
  const { isCartHydrated, items, subtotalCents, discountCents, referralCode } = useCart()

  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1)
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [addressVerified, setAddressVerified] = useState(false)
  const [validatingAddress, setValidatingAddress] = useState(false)

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    company: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })

  const shippingDateRange = useMemo(() => getStandardShippingDateRange(), [])

  useEffect(() => {
    if (session?.user?.email) {
      setShippingInfo(prev => ({ ...prev, email: session.user!.email! }))
    }
  }, [session?.user?.email])

  const afterDiscount = subtotalCents - discountCents
  const taxCents = useMemo(
    () => (shippingInfo.country === 'CA' ? Math.round(afterDiscount * HST_RATE) : 0),
    [shippingInfo.country, afterDiscount]
  )
  const totalCents = afterDiscount + SHIPPING_CENTS + taxCents

  // ── Step 1 → Step 2 ───────────────────────────────────────────────────────
  const handleContinueToDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    const resolvedEmail = (shippingInfo.email || session?.user?.email || '').trim()
    if (!shippingInfo.name.trim()) { toast.error('Please enter your full name'); return }
    if (!resolvedEmail) { toast.error('Please provide an email address'); return }
    if (!shippingInfo.phone.trim()) { toast.error('Please enter your phone number'); return }
    if (!shippingInfo.address1.trim()) { toast.error('Please search and select a valid shipping address'); return }
    if (!shippingInfo.city.trim() || !shippingInfo.state.trim() || !shippingInfo.zip.trim()) {
      toast.error('Please select a complete address from the suggestions')
      return
    }

    if (!addressVerified) {
      setValidatingAddress(true)
      const ok = await validateShippingAddress({
        address1: shippingInfo.address1,
        address2: shippingInfo.address2,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip: shippingInfo.zip,
        country: shippingInfo.country,
      })
      setValidatingAddress(false)
      if (!ok) {
        toast.error('Please select a valid address from the suggestions list.')
        return
      }
      setAddressVerified(true)
    }

    setShippingInfo(prev => ({ ...prev, email: resolvedEmail }))
    setCheckoutStep(2)
  }

  // ── Step 2 → Step 3: create PaymentIntent ────────────────────────────────
  const handleContinueToPayment = async () => {
    setIsCreatingIntent(true)
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            dosage_variant_id: item.dosage_variant_id,
          })),
          shippingInfo: {
            name: shippingInfo.name,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            company: shippingInfo.company,
            address1: shippingInfo.address1,
            address2: shippingInfo.address2,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip: shippingInfo.zip,
            country: shippingInfo.country,
          },
          referralCode,
          discountCents,
          shippingCents: SHIPPING_CENTS,
        }),
      })
      const data = (await res.json()) as { clientSecret?: string; orderNumber?: string; error?: string }
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error ?? 'Could not initialize payment. Please try again.')
      }
      setClientSecret(data.clientSecret)
      setOrderNumber(data.orderNumber ?? '')
      setCheckoutStep(3)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not initialize payment.')
    } finally {
      setIsCreatingIntent(false)
    }
  }

  // Clearing intent when going back to re-edit
  const goToStep = (step: 1 | 2) => {
    setCheckoutStep(step)
    setClientSecret(null)
    setOrderNumber(null)
  }

  // ── Loading / empty states ────────────────────────────────────────────────
  if (!isCartHydrated) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Checkout</h1>
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-md bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Loading your cart…</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-black sm:text-4xl">Checkout</h1>
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="mt-10 h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-6 text-2xl font-bold text-black">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Add items to your cart before checking out.</p>
            <Link href="/shop">
              <Button className="mt-6 bg-primary hover:bg-primary/90">Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Checkout</h1>
        <Link
          href="/cart"
          className="mt-4 mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <div className="mt-2 grid gap-8 lg:grid-cols-5">
          {/* ── Left column: Steps ─────────────────────────────── */}
          <div className="space-y-4 lg:col-span-3">

            {/* ══ STEP 1: Shipping Address ══════════════════════════ */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {checkoutStep > 1 ? <Check className="h-4 w-4" strokeWidth={2.5} /> : '1'}
                  </div>
                  <h2 className="text-lg font-bold text-black">Shipping Address</h2>
                  {checkoutStep > 1 && (
                    <Check className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                  )}
                </div>
                {checkoutStep > 1 && (
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {checkoutStep === 1 ? (
                /* Active form */
                <>
                  <div className="mt-4 mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-green-600" />
                      Secure checkout
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-green-600" />
                      Damage protection
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-green-600" />
                      Shipment protection
                    </span>
                  </div>

                  <form onSubmit={handleContinueToDelivery} className="space-y-6">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-black">Your Information</p>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-xs text-muted-foreground">Full name *</Label>
                          <Input
                            id="name"
                            placeholder="Full name"
                            value={shippingInfo.name}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs text-muted-foreground">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={shippingInfo.email || session?.user?.email || ''}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            We&apos;ll send your order confirmation, tracking number, and shipping updates here.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-black">Delivery Address</p>
                      <div className="space-y-3">
                        <AddressAutocomplete
                          value={{
                            address1: shippingInfo.address1,
                            address2: shippingInfo.address2,
                            city: shippingInfo.city,
                            state: shippingInfo.state,
                            zip: shippingInfo.zip,
                            country: shippingInfo.country,
                          }}
                          verified={addressVerified}
                          onVerifiedChange={setAddressVerified}
                          onChange={(fields) =>
                            setShippingInfo((prev) => ({ ...prev, ...fields }))
                          }
                        />
                        <Input
                          placeholder="Apartment, suite, etc. (optional)"
                          value={shippingInfo.address2}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                        />
                        <Input
                          placeholder="Company (optional)"
                          value={shippingInfo.company}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, company: e.target.value })}
                        />
                        <Input
                          type="tel"
                          placeholder="Phone (for delivery) *"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex cursor-pointer items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={smsOptIn}
                          onChange={(e) => setSmsOptIn(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">
                          I would like to receive order &amp; shipping text updates
                        </span>
                      </label>
                      <p className="pl-6 text-xs text-muted-foreground">
                        By providing your phone number you agree to receive informational text messages from us.
                        Consent is not a condition of purchase. Message frequency will vary. Msg &amp; data rates
                        may apply. Reply HELP for help or STOP to cancel.{' '}
                        <span className="underline cursor-pointer">Terms</span> &amp;{' '}
                        <span className="underline cursor-pointer">Privacy</span>.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={billingSameAsShipping}
                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">Billing address same as shipping address</span>
                    </label>

                    <Button
                      type="submit"
                      disabled={validatingAddress}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      size="lg"
                    >
                      {validatingAddress ? 'Verifying address…' : 'Continue to delivery →'}
                    </Button>
                  </form>
                </>
              ) : (
                /* Collapsed summary */
                <div className="mt-4 border-t border-border/60 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="mb-1.5 font-semibold text-black">Shipping Address</p>
                      <p className="text-primary">{shippingInfo.name}</p>
                      <p className="text-primary">{shippingInfo.address1}</p>
                      <p className="text-primary">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
                      <p className="text-primary">{shippingInfo.country === 'CA' ? 'Canada' : 'United States'}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 font-semibold text-black">Contact</p>
                      <p className="text-primary">{shippingInfo.phone}</p>
                      <p className="text-primary">{shippingInfo.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Order confirmation, tracking &amp; updates sent here.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1.5 font-semibold text-black">Billing Address</p>
                      {billingSameAsShipping ? (
                        <p>Same as <span className="text-primary">shipping address</span></p>
                      ) : (
                        <p className="text-primary">{shippingInfo.address1}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ══ STEP 2: Delivery Method ═══════════════════════════ */}
            {checkoutStep >= 2 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {checkoutStep > 2 ? <Check className="h-4 w-4" strokeWidth={2.5} /> : '2'}
                    </div>
                    <h2 className="text-lg font-bold text-black">Delivery Method</h2>
                    {checkoutStep > 2 && (
                      <Check className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                    )}
                  </div>
                  {checkoutStep > 2 && (
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {checkoutStep === 2 ? (
                  /* Active delivery step */
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-black">Shipping method</p>
                    <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
                      How would you like your order delivered
                    </p>

                    <div className="flex items-center justify-between rounded-lg border-2 border-primary bg-muted/20 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Standard Shipping</p>
                          <p className="text-sm text-muted-foreground">{shippingDateRange}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">$24.99</p>
                    </div>

                    <Button
                      type="button"
                      disabled={isCreatingIntent}
                      className="mt-4 w-full bg-primary hover:bg-primary/90 text-white"
                      size="lg"
                      onClick={handleContinueToPayment}
                    >
                      {isCreatingIntent ? 'Preparing payment…' : 'Continue to payment →'}
                    </Button>

                    <div className="mt-4 flex gap-3 rounded-lg border border-border/60 bg-muted/10 p-4">
                      <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Free Shipment Protection</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Every order is protected at no extra cost. If your package is damaged, lost, or stolen
                          during transit, we&apos;ll replace it or issue a full refund.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Collapsed delivery summary */
                  <div className="mt-4 border-t border-border/60 pt-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Standard Shipping</p>
                        <p className="text-muted-foreground">{shippingDateRange}</p>
                      </div>
                      <p className="font-semibold text-foreground">$24.99</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 3: Payment ═══════════════════════════════════ */}
            {checkoutStep === 3 && clientSecret && orderNumber && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    3
                  </div>
                  <h2 className="text-lg font-bold text-black">Payment</h2>
                </div>

                {/* Trust line */}
                <div className="mb-5 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <Lock className="h-3.5 w-3.5" />
                  Secure checkout · 256-bit SSL
                </div>

                {/* Protection badges */}
                <div className="mb-5 flex items-center gap-5 rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-green-600" />
                    Damage protection included
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-green-600" />
                    Shipment protection
                  </span>
                </div>

                <StripePaymentSection
                  clientSecret={clientSecret}
                  orderNumber={orderNumber}
                  totalCents={totalCents}
                />
              </div>
            )}
          </div>

          {/* ── Right column: Order Summary ─────────────────────── */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-black">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderSummary
                  items={items}
                  subtotalCents={subtotalCents}
                  discountCents={discountCents}
                  referralCode={referralCode}
                  country={shippingInfo.country}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
