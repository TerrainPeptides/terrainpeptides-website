'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { packageLineTotalCents } from '@/lib/product-price'
import { displayDosageLabel } from '@/lib/dosage-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotalCents,
    discountCents,
    totalCents,
    referralCode,
    setReferralCode,
    setDiscountPercent,
  } = useCart()

  const [codeInput, setCodeInput] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

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

  if (items.length === 0) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <h1 className="mt-6 text-2xl font-bold text-foreground">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse our products and add items to your cart.
            </p>
            <Link href="/shop">
              <Button className="mt-6 gap-2">
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
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.dosage_variant_id}`}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          {(() => {
                            const label = displayDosageLabel(item.product, item.dosage_variant_id)
                            return label ? (
                              <p className="text-sm text-muted-foreground">{label}</p>
                            ) : null
                          })()}
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatPrice(
                            packageLineTotalCents(
                              item.product,
                              item.quantity,
                              item.dosage_variant_id
                            )
                          )}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.dosage_variant_id
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.dosage_variant_id
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            removeItem(item.product.id, item.dosage_variant_id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Referral Code */}
                {!referralCode && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Referral code"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCode}
                      disabled={isApplying}
                    >
                      Apply
                    </Button>
                  </div>
                )}
                {referralCode && (
                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                    <span>Code: {referralCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-green-700"
                      onClick={() => {
                        setReferralCode(null)
                        setDiscountPercent(0)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotalCents)}</span>
                  </div>
                  {discountCents > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-{formatPrice(discountCents)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(totalCents)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full gap-2" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/shop" className="w-full">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
