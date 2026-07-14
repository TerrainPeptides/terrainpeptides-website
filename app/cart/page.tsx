'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { packageLineTotalCents } from '@/lib/product-price'
import { displayDosageLabel } from '@/lib/dosage-variants'
import { resolveProductImageSrc } from '@/lib/product-image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  FlaskConical,
  Truck,
  Package,
  Shield,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const SHIPPING_CENTS = 2500
const NO_VIAL_COPY_SLUGS = new Set(['syringe-kit', 'capsule-stack'])

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function CartPage() {
  const {
    isCartHydrated,
    items,
    removeItem,
    updateQuantity,
    subtotalCents,
    discountCents,
    referralCode,
    setReferralCode,
    setDiscountPercent,
  } = useCart()

  const [codeInput, setCodeInput] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const afterDiscount = subtotalCents - discountCents
  const totalWithShipping = afterDiscount + SHIPPING_CENTS

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return
    setIsApplying(true)
    try {
      const res = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim() }),
      })
      const data = await res.json()
      if (data.valid) {
        setReferralCode(codeInput.trim())
        setDiscountPercent(data.discount_percent)
        toast.success(`Code applied! ${data.discount_percent}% discount`)
      } else {
        toast.error(data.error || 'Invalid code')
      }
    } catch {
      toast.error('Failed to validate code')
    } finally {
      setIsApplying(false)
    }
  }

  if (!isCartHydrated) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-md bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center border border-border bg-white">
              <ShoppingBag className="h-10 w-10 text-terrain/50" />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold text-ink">Your cart is empty</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Browse our catalog and add research compounds to your cart.
            </p>
            <Link href="/shop">
              <Button className="mt-6 gap-2 rounded-full bg-terrain font-semibold tracking-[0.04em] text-white hover:bg-terrain-deep">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-dark">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-terrain">
            Checkout
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
            Shopping <span className="orbit-accent">cart</span>
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Cart Items ───────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const dose = displayDosageLabel(item.product, item.dosage_variant_id)
              const imageSrc = resolveProductImageSrc(item.product)
              const showVials = !NO_VIAL_COPY_SLUGS.has(item.product.slug)
              const lineTotal = packageLineTotalCents(item.product, item.quantity, item.dosage_variant_id)

              return (
                <div
                  key={`${item.product.id}-${item.dosage_variant_id}`}
                  className="flex gap-5 border border-border bg-white p-5"
                >
                  {/* Product image */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-border bg-[#f4f6f5]">
                    {imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={item.product.name}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FlaskConical className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="text-base font-bold text-ink hover:text-terrain-deep"
                        >
                          {item.product.name}
                        </Link>
                        {dose && (
                          <p className="mt-0.5 font-mono text-[0.7rem] text-ink/40">{dose}</p>
                        )}
                        {showVials && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 bg-accent px-2.5 py-1 text-xs font-semibold text-terrain-deep">
                            <Package className="h-3.5 w-3.5 shrink-0" />
                            {item.quantity === 1
                              ? '1 research vial'
                              : `${item.quantity} research vials`}
                          </div>
                        )}
                      </div>
                      <p className="shrink-0 font-mono text-lg font-medium tabular-nums text-terrain-deep [font-feature-settings:'tnum']">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-stretch border border-border bg-white">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-none hover:bg-section-subtle"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.dosage_variant_id)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="flex w-9 items-center justify-center border-x border-border text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-none hover:bg-section-subtle"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.dosage_variant_id)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.product.id, item.dosage_variant_id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Trust bar */}
            <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg border-2 border-border bg-white px-4 py-3 sm:grid-cols-3 sm:gap-3">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-navy sm:justify-start">
                <Shield className="h-4 w-4 text-primary" />
                Secure Checkout
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-navy sm:justify-start">
                <FlaskConical className="h-4 w-4 text-primary" />
                99%+ Purity
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-navy sm:justify-start">
                <Truck className="h-4 w-4 text-primary" />
                USA Warehouse
              </div>
            </div>
          </div>

          {/* ── Order Summary ─────────────────────────────────────── */}
          <div>
            <div className="sticky top-24 rounded-lg border-2 border-border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-ink">Order Summary</h2>

              {/* Referral code */}
              {!referralCode ? (
                <div className="mb-5 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Referral code"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCode() }}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyCode}
                    disabled={isApplying}
                    className="shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Code: {referralCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-green-700 hover:text-green-900"
                    onClick={() => { setReferralCode(null); setDiscountPercent(0) }}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums text-foreground">{formatPrice(subtotalCents)}</span>
                </div>
                {discountCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Discount{referralCode ? ` (${referralCode})` : ''}</span>
                    <span className="tabular-nums font-medium text-green-600">-{formatPrice(discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Truck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    Flat-rate shipping
                  </span>
                  <span className="tabular-nums font-semibold text-foreground">{formatPrice(SHIPPING_CENTS)}</span>
                </div>
                <p className="text-xs text-muted-foreground">$25.00 applies to all orders</p>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <span className="text-base font-bold text-foreground">Estimated Total</span>
                <span className="font-mono text-base font-medium tabular-nums text-terrain-deep [font-feature-settings:'tnum']">
                  {formatPrice(totalWithShipping)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Tax (if applicable) calculated at checkout</p>

              <Link href="/checkout" className="mt-5 block">
                <Button className="w-full gap-2 rounded-full bg-terrain font-semibold tracking-[0.04em] text-white hover:bg-terrain-deep" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shop" className="mt-3 block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
