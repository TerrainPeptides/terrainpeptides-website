'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import { resolveProductImageSrc } from '@/lib/product-image'
import { useCart } from '@/lib/cart-context'
import { packageLineTotalCents } from '@/lib/product-price'
import { displayDosageLabel } from '@/lib/dosage-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { generateOrdOrderId } from '@/lib/paypal-order-id'
import {
  CreditCard,
  Bitcoin,
  Building2,
  Banknote,
  Check,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Lock,
  Shield,
  Truck,
  Package,
  FlaskConical,
} from 'lucide-react'

const SHIPPING_CENTS = 2500
const HST_RATE = 0.13

interface ShippingInfo {
  name: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

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
        <div className="flex justify-between text-sm font-medium">
          <span className="flex items-center gap-1.5 text-foreground">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            Shipping — flat rate (all orders)
          </span>
          <span className="tabular-nums font-semibold text-foreground">{formatPrice(SHIPPING_CENTS)}</span>
        </div>
        <p className="text-xs text-muted-foreground">$25.00 shipping applies to every order at checkout.</p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Tax {country === 'CA' ? '(13% HST)' : ''}
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

function PaymentStep({
  orderNumber,
  shippingInfo,
  items,
  subtotalCents,
  discountCents,
  referralCode,
  onBack,
}: {
  orderNumber: string
  shippingInfo: ShippingInfo
  items: ReturnType<typeof useCart>['items']
  subtotalCents: number
  discountCents: number
  referralCode: string | null
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const afterDiscount = subtotalCents - discountCents
  const taxCents = shippingInfo.country === 'CA' ? Math.round(afterDiscount * HST_RATE) : 0
  const totalCents = afterDiscount + SHIPPING_CENTS + taxCents

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      toast.error('Payment provider is still loading. Please wait a moment and try again.')
      return
    }

    setIsProcessing(true)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      toast.error(submitError.message ?? 'Please check your card details.')
      setIsProcessing(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
        payment_method_data: {
          billing_details: {
            name: shippingInfo.name,
            email: shippingInfo.email,
            address: {
              line1: shippingInfo.address1,
              line2: shippingInfo.address2 || undefined,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.zip,
              country: shippingInfo.country || 'US',
            },
          },
        },
      },
    })

    if (error) {
      toast.error(error.message ?? 'Payment failed. Please try again.')
      setIsProcessing(false)
    } else {
      clearCart()
    }
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shipping
        </button>

        <h1 className="mb-2 text-3xl font-bold text-foreground">Payment Details</h1>
        <p className="mb-8 text-muted-foreground">Complete your order securely.</p>

        <form onSubmit={handleConfirm}>
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Shipping to</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{shippingInfo.name}</p>
                  <p>{shippingInfo.email}</p>
                  <p>{shippingInfo.address1}{shippingInfo.address2 ? `, ${shippingInfo.address2}` : ''}</p>
                  <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip} {shippingInfo.country}</p>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentElement
                    options={{
                      layout: 'tabs',
                      defaultValues: {
                        billingDetails: { name: shippingInfo.name, email: shippingInfo.email },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <OrderSummary
                    items={items}
                    subtotalCents={subtotalCents}
                    discountCents={discountCents}
                    referralCode={referralCode}
                    country={shippingInfo.country}
                  />

                  <Button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="mt-6 w-full bg-[#0A1628] hover:bg-[#0A1628]/90"
                    size="lg"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalCents)}`}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Secured by Stripe. Your card details never touch our servers.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { isCartHydrated, items, subtotalCents, discountCents, referralCode } = useCart()

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'bank-transfer' | 'cash' | 'crypto' | 'paypal' | 'paypal-guide' | 'square'
  >('bank-transfer')
  const [cashSubMethod, setCashSubMethod] = useState<'zelle' | 'wise' | null>(null)
  // Stable order ID generated once per session for the Wise flow
  const [wiseOrderId] = useState(() => generateOrdOrderId())

  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      if (selectedPaymentMethod === 'paypal-guide') {
        const ppOrderId = generateOrdOrderId()
        const pendingRes = await fetch('/api/checkout/paypal-guide-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: ppOrderId,
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              dosage_variant_id: item.dosage_variant_id,
            })),
            shippingInfo,
            referralCode,
            discountCents,
          }),
        })
        const pendingData = (await pendingRes.json()) as { error?: string }
        if (!pendingRes.ok) {
          throw new Error(pendingData.error ?? 'Could not save your order')
        }
        router.push(
          `/checkout/pay?order=${encodeURIComponent(ppOrderId)}&total=${(totalCents / 100).toFixed(2)}&country=${encodeURIComponent(shippingInfo.country)}&email=${encodeURIComponent(shippingInfo.email)}`
        )
        return
      }

      if (selectedPaymentMethod === 'square') {
        const res = await fetch('/api/square/create-payment-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              dosage_variant_id: item.dosage_variant_id,
            })),
            shippingInfo,
            referralCode,
            discountCents,
          }),
        })
        const data = (await res.json()) as { paymentUrl?: string; error?: string }
        if (!res.ok || !data.paymentUrl) {
          throw new Error(data.error ?? 'Could not create Square payment link')
        }
        window.location.href = data.paymentUrl
        return
      }

      if (selectedPaymentMethod === 'paypal') {
        const paypalPayload = {
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            dosage_variant_id: item.dosage_variant_id,
          })),
          shippingInfo,
          referralCode,
          discountCents,
        }
        console.log('[checkout] Card (PayPal hosted) — cart payload for /api/paypal/create-order', {
          items: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            dosage_variant_id: item.dosage_variant_id,
            product_dosage_variants: item.product.dosage_variants,
            product_price_cents: item.product.price_cents,
            product_dosage: item.product.dosage,
            vial_count: item.product.vial_count,
          })),
          payload: paypalPayload,
          computedTotalCents: totalCents,
        })
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paypalPayload),
        })
        const data = (await res.json()) as { approvalUrl?: string; error?: string }
        if (!res.ok || !data.approvalUrl) {
          throw new Error(data.error ?? 'Could not create PayPal order')
        }
        window.location.href = data.approvalUrl
        return
      }

      const path =
        selectedPaymentMethod === 'bank-transfer'
          ? '/checkout/bank-transfer'
          : selectedPaymentMethod === 'cash' && cashSubMethod === 'wise'
            ? `/checkout/wise?order=${encodeURIComponent(wiseOrderId)}&total=${(totalCents / 100).toFixed(2)}&country=${encodeURIComponent(shippingInfo.country)}`
            : selectedPaymentMethod === 'cash'
              ? '/checkout/cash'
            : '/checkout/crypto'
      router.push(path)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectPaymentMethod = (method: 'bank-transfer' | 'cash' | 'crypto' | 'paypal' | 'paypal-guide' | 'square') => {
    setSelectedPaymentMethod(method)
    if (method !== 'cash') setCashSubMethod(null)
    else setCashSubMethod('wise')
  }

  if (!isCartHydrated) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
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
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <h1 className="mt-6 text-2xl font-bold text-foreground">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">Add items to your cart before checking out.</p>
            <Link href="/shop">
              <Button className="mt-6 bg-[#0A1628] hover:bg-[#0A1628]/90">Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (clientSecret && orderNumber) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: { theme: 'stripe', variables: { borderRadius: '8px' } },
        }}
      >
        <PaymentStep
          orderNumber={orderNumber}
          shippingInfo={shippingInfo}
          items={items}
          subtotalCents={subtotalCents}
          discountCents={discountCents}
          referralCode={referralCode}
          onBack={() => {
            setClientSecret(null)
            setOrderNumber(null)
          }}
        />
      </Elements>
    )
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-foreground">Checkout</h1>
        <p className="mb-8 text-muted-foreground">Complete your order in a few simple steps.</p>

        {/* Trust bar */}
        <div className="mb-8 grid grid-cols-3 gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <Shield className="h-4 w-4 text-foreground" />
            Secure Checkout
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <Truck className="h-4 w-4 text-foreground" />
            Fast Shipping
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <Package className="h-4 w-4 text-foreground" />
            10 Vials / Product
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              {/* Shipping Information */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        required
                        placeholder="John Doe"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Email Address</Label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
                        {shippingInfo.email || session?.user?.email || '—'}
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={shippingInfo.country}
                        onValueChange={(v) => setShippingInfo({ ...shippingInfo, country: v })}
                      >
                        <SelectTrigger id="country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        required
                        placeholder="123 Main St"
                        value={shippingInfo.address1}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address2">Address Line 2 (optional)</Label>
                      <Input
                        id="address2"
                        placeholder="Apt 4B"
                        value={shippingInfo.address2}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{shippingInfo.country === 'CA' ? 'Province' : 'State'}</Label>
                      <Input
                        id="state"
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">{shippingInfo.country === 'CA' ? 'Postal Code' : 'ZIP Code'}</Label>
                      <Input
                        id="zip"
                        required
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* ── Bank Transfer ─────────────────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('bank-transfer')}
                    className={cn(
                      'relative w-full rounded-lg border p-4 text-left transition-colors',
                      selectedPaymentMethod === 'bank-transfer'
                        ? 'border-primary bg-muted/30 shadow-sm'
                        : 'border-border hover:bg-muted/30'
                    )}
                  >
                    {selectedPaymentMethod === 'bank-transfer' ? (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : null}
                    <div className="flex gap-3 pr-10">
                      <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground">
                          Same-day payment via direct bank transfer
                        </p>
                        {selectedPaymentMethod === 'bank-transfer' ? (
                          <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                            <div className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                              <span>Link a new bank account</span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              Supported: US bank accounts via Zelle, international via Wise
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* ── Card Payments via Square ───────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('square')}
                    className={cn(
                      'relative w-full rounded-lg border p-4 text-left transition-colors',
                      selectedPaymentMethod === 'square'
                        ? 'border-primary bg-muted/30 shadow-sm'
                        : 'border-border hover:bg-muted/30'
                    )}
                  >
                    {selectedPaymentMethod === 'square' ? (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : null}
                    <div className="flex gap-3 pr-10">
                      {/* Square mark icon */}
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-5 w-5 shrink-0"
                        aria-hidden
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="4" fill="#3E4348" />
                        <rect x="6" y="6" width="12" height="12" rx="1.5" fill="white" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Card Payments</p>
                        <p className="text-sm text-muted-foreground">via Square</p>
                        {selectedPaymentMethod === 'square' ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Pay securely with any credit or debit card through Square&apos;s hosted checkout.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* ── Bank Payments via PayPal ────────────────────── */}
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('paypal-guide')}
                    className={cn(
                      'relative w-full rounded-lg border p-4 text-left transition-colors',
                      selectedPaymentMethod === 'paypal-guide'
                        ? 'border-primary bg-muted/30 shadow-sm'
                        : 'border-border hover:bg-muted/30'
                    )}
                  >
                    {selectedPaymentMethod === 'paypal-guide' ? (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : null}
                    <div className="flex gap-3 pr-10">
                      {/* PayPal mark icon */}
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-5 w-5 shrink-0"
                        aria-hidden
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"
                          fill="#003087"
                        />
                        <path
                          d="M21.222 6.917a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.582-8.562 6.582H9.819l-1.24 7.86h4.446c.458 0 .847-.334.918-.787l.038-.196.726-4.604.047-.254c.07-.453.46-.787.918-.787h.578c3.741 0 6.669-1.52 7.523-5.918.356-1.83.173-3.355-.547-4.429z"
                          fill="#009cde"
                        />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Bank Payments via PayPal</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with any bank account through PayPal
                        </p>
                        {selectedPaymentMethod === 'paypal-guide' ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            You&apos;ll be guided through a simple step-by-step PayPal payment flow.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* ── Pay with Cash ──────────────────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('cash')}
                    className={cn(
                      'relative w-full rounded-lg border p-4 text-left transition-colors',
                      selectedPaymentMethod === 'cash'
                        ? 'border-primary bg-muted/30 shadow-sm'
                        : 'border-border hover:bg-muted/30'
                    )}
                  >
                    {selectedPaymentMethod === 'cash' ? (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : null}
                    <div className="flex gap-3 pr-10">
                      <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Pay with Cash</p>
                        <p className="text-sm text-muted-foreground">
                          Send payment instantly via Zelle or Wise
                        </p>

                        {selectedPaymentMethod === 'cash' ? (
                          <div className="mt-4 border-t border-border/60 pt-4">
                            {/* Sub-method pills */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setCashSubMethod('zelle') }}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                                  cashSubMethod === 'zelle'
                                    ? 'border-primary bg-[#0A1628] text-white'
                                    : 'border-border bg-background text-foreground hover:bg-muted/40'
                                )}
                              >
                                🇺🇸 Zelle
                                <span className={cn('text-xs', cashSubMethod === 'zelle' ? 'text-white/75' : 'text-muted-foreground')}>
                                  (U.S. Only)
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setCashSubMethod('wise') }}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                                  cashSubMethod === 'wise'
                                    ? 'border-primary bg-[#0A1628] text-white'
                                    : 'border-border bg-background text-foreground hover:bg-muted/40'
                                )}
                              >
                                🌍 Wise
                                <span className={cn('text-xs', cashSubMethod === 'wise' ? 'text-white/75' : 'text-muted-foreground')}>
                                  (International)
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* ── Cryptocurrency ─────────────────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('crypto')}
                    className={cn(
                      'relative w-full rounded-lg border p-4 text-left transition-colors',
                      selectedPaymentMethod === 'crypto'
                        ? 'border-primary bg-muted/30 shadow-sm'
                        : 'border-border hover:bg-muted/30'
                    )}
                  >
                    {selectedPaymentMethod === 'crypto' ? (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : null}
                    <div className="flex gap-3 pr-10">
                      <Bitcoin className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Cryptocurrency</p>
                        <p className="text-sm text-muted-foreground">Pay anonymously with crypto</p>
                        {selectedPaymentMethod === 'crypto' ? (
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                            {(['BTC', 'ETH', 'USDT', 'LTC', 'USDC'] as const).map((coin) => (
                              <span
                                key={coin}
                                className="rounded-md border border-border/20 bg-[#0A1628]/5 px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground"
                              >
                                {coin}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>


                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24 border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderSummary
                    items={items}
                    subtotalCents={subtotalCents}
                    discountCents={discountCents}
                    referralCode={referralCode}
                    country={shippingInfo.country}
                  />

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="mt-6 w-full bg-[#0A1628] hover:bg-[#0A1628]/90"
                    size="lg"
                  >
                    {isProcessing
                      ? 'Processing...'
                      : selectedPaymentMethod === 'square'
                        ? 'Continue to Card Payment (Square)'
                        : selectedPaymentMethod === 'paypal-guide'
                          ? 'Continue to PayPal payment'
                          : selectedPaymentMethod === 'paypal'
                            ? 'Continue to card checkout'
                            : selectedPaymentMethod === 'bank-transfer'
                              ? 'Pay with Bank Transfer'
                              : selectedPaymentMethod === 'cash' && cashSubMethod === 'wise'
                                ? 'Pay with Cash (Wise)'
                                : selectedPaymentMethod === 'cash'
                                  ? 'Pay with Cash'
                                  : 'Pay with Crypto'}
                  </Button>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    By completing this purchase you agree to our Terms of Service and acknowledge that all products are for research purposes only.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

    </div>
  )
}
