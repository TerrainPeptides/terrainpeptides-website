'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { CreditCard, Bitcoin, ArrowLeft, ShoppingBag, Lock } from 'lucide-react'


interface ShippingInfo {
  name: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
}

// ─── Payment step (inside <Elements>) ────────────────────────────────────────

function PaymentStep({
  orderNumber,
  shippingInfo,
  items,
  subtotalCents,
  discountCents,
  totalCents,
  referralCode,
  onBack,
}: {
  orderNumber: string
  shippingInfo: ShippingInfo
  items: ReturnType<typeof useCart>['items']
  subtotalCents: number
  discountCents: number
  totalCents: number
  referralCode: string | null
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      toast.error('Payment provider is still loading. Please wait a moment and try again.')
      return
    }

    setIsProcessing(true)

    // Submit the Elements form first (validates card details)
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
              country: 'US',
            },
          },
        },
      },
    })

    // If confirmPayment resolves without redirecting, it means an error occurred
    if (error) {
      toast.error(error.message ?? 'Payment failed. Please try again.')
      setIsProcessing(false)
    } else {
      // Stripe is handling the redirect — clear cart optimistically
      clearCart()
    }
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shipping
        </button>

        <h1 className="mb-8 text-3xl font-bold text-foreground">Enter Payment Details</h1>

        <form onSubmit={handleConfirm}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left — card form */}
            <div className="space-y-6">
              {/* Shipping summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping to</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{shippingInfo.name}</p>
                  <p>{shippingInfo.email}</p>
                  <p>{shippingInfo.address1}{shippingInfo.address2 ? `, ${shippingInfo.address2}` : ''}</p>
                  <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
                </CardContent>
              </Card>

              {/* Stripe Elements card form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentElement
                    options={{
                      layout: 'tabs',
                      defaultValues: {
                        billingDetails: {
                          name: shippingInfo.name,
                          email: shippingInfo.email,
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right — order summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => {
                      const dose = displayDosageLabel(item.product, item.dosage_variant_id)
                      return (
                        <div
                          key={`${item.product.id}-${item.dosage_variant_id}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.product.name}
                            {dose ? ` (${dose})` : ''} x {item.quantity}
                          </span>
                          <span className="text-foreground">
                            {formatPrice(
                              packageLineTotalCents(
                                item.product,
                                item.quantity,
                                item.dosage_variant_id
                              )
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(subtotalCents)}</span>
                    </div>
                    {discountCents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          Discount{referralCode ? ` (${referralCode})` : ''}
                        </span>
                        <span className="text-green-600">-{formatPrice(discountCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(totalCents)}</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalCents)}`}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Secured by Stripe. Your card details never touch our servers.
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

// ─── Main checkout page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotalCents, discountCents, totalCents, referralCode, clearCart } = useCart()

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
  })

  // Stripe Elements state — set after PI is created
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      if (paymentMethod === 'stripe') {
        // Create a PaymentIntent server-side and move to the card entry step
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
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize payment')
        }

        setClientSecret(data.clientSecret)
        setOrderNumber(data.orderNumber)
      } else {
        // Crypto: existing flow
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

  // ── Empty cart guard ──────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <h1 className="mt-6 text-2xl font-bold text-foreground">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Add items to your cart before checking out.
            </p>
            <Link href="/shop">
              <Button className="mt-6">Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Payment step — show Elements card form ────────────────────────────────

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
          totalCents={totalCents}
          referralCode={referralCode}
          onBack={() => {
            setClientSecret(null)
            setOrderNumber(null)
          }}
        />
      </Elements>
    )
  }

  // ── Form step — shipping + payment method selection ───────────────────────

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        required
                        value={shippingInfo.name}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        required
                        value={shippingInfo.address1}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, address1: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address2">Address Line 2 (optional)</Label>
                      <Input
                        id="address2"
                        value={shippingInfo.address2}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, address2: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        required
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        required
                        value={shippingInfo.state}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, state: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        required
                        value={shippingInfo.zip}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, zip: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'crypto')}
                  >
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label
                        htmlFor="stripe"
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Pay securely with Stripe
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="crypto" id="crypto" />
                      <Label
                        htmlFor="crypto"
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        <Bitcoin className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Cryptocurrency</p>
                          <p className="text-sm text-muted-foreground">
                            Pay with Bitcoin, Ethereum, or USDC
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const dose = displayDosageLabel(item.product, item.dosage_variant_id)
                      return (
                        <div
                          key={`${item.product.id}-${item.dosage_variant_id}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.product.name}
                            {dose ? ` (${dose})` : ''} x {item.quantity}
                          </span>
                          <span className="text-foreground">
                            {formatPrice(
                              packageLineTotalCents(
                                item.product,
                                item.quantity,
                                item.dosage_variant_id
                              )
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(subtotalCents)}</span>
                    </div>
                    {discountCents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          Discount {referralCode && `(${referralCode})`}
                        </span>
                        <span className="text-green-600">-{formatPrice(discountCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(totalCents)}</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing
                      ? 'Processing...'
                      : paymentMethod === 'stripe'
                      ? 'Continue to Payment'
                      : 'Pay with Crypto'}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By completing this purchase you agree to our Terms of Service and acknowledge
                    that all products are for research purposes only.
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
