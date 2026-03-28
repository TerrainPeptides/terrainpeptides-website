'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import { useCart } from '@/lib/cart-context'
import { packageLineTotalCents } from '@/lib/product-price'
import { displayDosageLabel } from '@/lib/dosage-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  CreditCard,
  Bitcoin,
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
          const vials = item.product.vial_count ?? 1
          const imageSrc = item.product.image_url
          return (
            <div
              key={`${item.product.id}-${item.dosage_variant_id}`}
              className="flex gap-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={item.product.name}
                    fill
                    className="object-contain p-1"
                    unoptimized={imageSrc.startsWith('/') || imageSrc.startsWith('data:')}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {dose ? `${dose} · ` : ''}{vials * item.quantity} vials ({vials} per unit &times; {item.quantity})
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

      <div className="rounded-lg bg-[#0A1931]/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#0A1931]">
          <Package className="h-4 w-4" />
          Every order ships with 10 vials per product
        </div>
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
            <Truck className="h-3.5 w-3.5" />
            Flat-rate shipping
          </span>
          <span className="tabular-nums text-foreground">{formatPrice(SHIPPING_CENTS)}</span>
        </div>
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
                    className="mt-6 w-full bg-[#0A1931] hover:bg-[#0A1931]/90"
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
  const { items, subtotalCents, discountCents, referralCode, clearCart } = useCart()

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe')
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
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/create-payment-intent', {
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
            shippingCents: SHIPPING_CENTS,
            taxCents,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to initialize payment')

        setClientSecret(data.clientSecret)
        setOrderNumber(data.orderNumber)
      } else {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              dosage_variant_id: item.dosage_variant_id,
            })),
            paymentMethod,
            shippingInfo,
            referralCode,
            discountCents,
            shippingCents: SHIPPING_CENTS,
            taxCents,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Checkout failed')

        clearCart()
        router.push(
          `/checkout/crypto?order=${data.orderNumber}&address=${data.cryptoAddress}&amount=${data.totalUsd}`
        )
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setIsProcessing(false)
    }
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
              <Button className="mt-6 bg-[#0A1931] hover:bg-[#0A1931]/90">Browse Products</Button>
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
            <Shield className="h-4 w-4 text-[#0A1931]" />
            Secure Checkout
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <Truck className="h-4 w-4 text-[#0A1931]" />
            Fast Shipping
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <Package className="h-4 w-4 text-[#0A1931]" />
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
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      />
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
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'crypto')}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="flex flex-1 cursor-pointer items-center gap-3">
                        <CreditCard className="h-5 w-5 text-[#0A1931]" />
                        <div>
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay securely with Stripe</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                      <RadioGroupItem value="crypto" id="crypto" />
                      <Label htmlFor="crypto" className="flex flex-1 cursor-pointer items-center gap-3">
                        <Bitcoin className="h-5 w-5 text-[#0A1931]" />
                        <div>
                          <p className="font-medium">Cryptocurrency</p>
                          <p className="text-sm text-muted-foreground">Bitcoin, Ethereum, or USDC</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
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
                    className="mt-6 w-full bg-[#0A1931] hover:bg-[#0A1931]/90"
                    size="lg"
                  >
                    {isProcessing
                      ? 'Processing...'
                      : paymentMethod === 'stripe'
                        ? 'Continue to Payment'
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
