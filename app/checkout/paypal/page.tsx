'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Copy, ExternalLink, FlaskConical, Truck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart-context'
import { resolveProductImageSrc } from '@/lib/product-image'
import { packageLineTotalCents } from '@/lib/product-price'
import { displayDosageLabel } from '@/lib/dosage-variants'
import { cn } from '@/lib/utils'
import { formatOrdOrderIdDisplay, generateOrdOrderId, normalizeOrderNumberForLookup } from '@/lib/paypal-order-id'

const NAVY = '#0f172a'
const SHIPPING_CENTS = 2500
const HST_RATE = 0.13
const NO_VIAL_LINE_COPY_SLUGS = new Set(['syringe-kit', 'capsule-stack'])

const PAYPAL_REGISTER_URL = 'https://www.paypal.com/us/webapps/mpp/account-selection'
const PAYPAL_ME_URL = 'https://www.paypal.com/paypalme/TerrainLab'
const DISCORD_INVITE_URL = '#'

/** Reference: PayPal.me-style payment screen (order ID in note, amount in USD) */
const PAYPAL_SCREENSHOT_SRC = '/images/paypal-payment-reference.png'

function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 0-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.018 1.95 6.27 2.913 9.804 2.913 4.494 0 8.586-1.26 9.804-2.913a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 0-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.4-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function PayPalStepCard({
  stepNumber,
  title,
  afterTitle,
  children,
}: {
  stepNumber: string
  title: string
  afterTitle?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50 px-5 py-5 shadow-sm">
      <p className="text-3xl font-bold leading-none text-sky-300 sm:text-4xl">{stepNumber}</p>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
      {afterTitle ? <div className="mt-3">{afterTitle}</div> : null}
      <div
        className={cn(
          'mt-3 text-base leading-relaxed text-slate-800 sm:text-lg sm:leading-relaxed',
          afterTitle && 'mt-4'
        )}
      >
        {children}
      </div>
    </section>
  )
}

function CopyValueBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sky-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-sky-800 sm:text-[0.9375rem]">{label}</p>
          <p className="mt-1.5 font-mono text-base font-semibold text-slate-900 sm:text-lg">{value}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value)
            const short = label.split(' - ')[0]?.trim() ?? label
            toast.success(`${short} copied`)
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100"
          title="Copy value"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
    </div>
  )
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
          const slug = item.product.slug
          const imageSrc = resolveProductImageSrc(item.product)
          const showVialLine = !NO_VIAL_LINE_COPY_SLUGS.has(slug)
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
                {showVialLine ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dose ? `${dose} · ` : ''}
                    {item.quantity === 1 ? '1 research vial' : `${item.quantity} research vials`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dose ? `${dose} · ` : ''}Quantity: {item.quantity}
                  </p>
                )}
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

function PayPalCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isCartHydrated, items, subtotalCents, discountCents, referralCode, clearCart } = useCart()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [checks, setChecks] = useState<[boolean, boolean, boolean]>([false, false, false])

  const [fallbackOrderId] = useState(() => generateOrdOrderId())

  const orderIdRaw = searchParams.get('order')?.trim() || fallbackOrderId
  const orderIdDisplay = formatOrdOrderIdDisplay(orderIdRaw.replace(/^#/, ''))
  const customerEmailFromCheckout = searchParams.get('email')?.trim() || ''
  const country = searchParams.get('country') || 'US'

  const afterDiscount = subtotalCents - discountCents
  const taxCents = country === 'CA' ? Math.round(afterDiscount * HST_RATE) : 0
  const totalCentsFromContext = afterDiscount + SHIPPING_CENTS + taxCents
  const totalFromQuery = Number.parseFloat(searchParams.get('total') || '')
  const totalUsd = Number.isFinite(totalFromQuery) ? totalFromQuery : totalCentsFromContext / 100
  const formattedTotalUsd = totalUsd.toFixed(2)
  const formattedTotal = `$${formattedTotalUsd}`

  const allChecked = checks.every(Boolean)

  const toggleCheck = (index: number, checked: boolean) => {
    setChecks((prev) => {
      const next = [...prev] as [boolean, boolean, boolean]
      next[index] = checked
      return next
    })
  }

  const resetModal = () => {
    setIsConfirmModalOpen(false)
    setTransactionId('')
    setChecks([false, false, false])
  }

  const handleSubmitConfirmation = async () => {
    if (!allChecked) {
      toast.error('Please confirm all checkboxes')
      return
    }
    try {
      const res = await fetch('/api/checkout/paypal-guide-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderIdRaw,
          paypalTransactionId: transactionId.trim() || null,
        }),
      })
      const data = (await res.json()) as { error?: string; alreadyConfirmed?: boolean }
      if (!res.ok) {
        throw new Error(data.error ?? 'Confirmation failed')
      }
      const tid = transactionId.trim()
      if (data.alreadyConfirmed) {
        toast.success('This order was already confirmed.')
      } else {
        toast.success(
          tid.length > 0
            ? 'Payment confirmed. Thank you — your order is in our system.'
            : 'Payment confirmed. Adding a Transaction ID next time can speed up verification.'
        )
      }
      resetModal()
      clearCart()

      const orderForUrl = encodeURIComponent(normalizeOrderNumberForLookup(orderIdRaw.replace(/^#/, '')))
      const emailForUrl =
        customerEmailFromCheckout.length > 0
          ? encodeURIComponent(customerEmailFromCheckout)
          : ''
      if (emailForUrl) {
        router.push(`/track?auto=1&order=${orderForUrl}&email=${emailForUrl}`)
      } else {
        router.push(`/track?order=${orderForUrl}`)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not confirm payment')
    }
  }

  if (!isCartHydrated) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded-md bg-muted" />
            <div className="h-72 rounded-xl bg-muted" />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="border-border/60">
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">
                Your cart is empty. Add items before continuing with PayPal payment.
              </p>
              <Link href="/shop">
                <Button className="mt-6 hover:opacity-90" style={{ backgroundColor: NAVY }}>
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Checkout
        </button>

        <div className="mb-7">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 shrink-0"
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Bank/Card Payments via PayPal
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow the steps below to complete your payment securely via PayPal.
          </p>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full max-w-xl items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 sm:text-base"
            style={{ backgroundColor: '#5865F2' }}
          >
            <DiscordGlyph className="h-5 w-5 shrink-0" />
            <span className="text-center leading-snug">
              Need Help? Join our discord to get assistance.
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-3 sm:space-y-4 lg:col-span-3">
            {/* Step 1 */}
            <PayPalStepCard stepNumber="01" title="Create a PayPal Account">
              <p>
                Head to PayPal and create a free account. You&apos;ll need your email, phone number, and the name on your payment card. For occupation, select any option from the list.
              </p>
              <a
                href={PAYPAL_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-sky-50"
              >
                Create a PayPal Account
                <ExternalLink className="h-4 w-4 shrink-0 text-sky-500" />
              </a>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Already have a PayPal account? Skip this step and go to Step 2.
              </p>
            </PayPalStepCard>

            {/* Step 2 */}
            <PayPalStepCard
              stepNumber="02"
              title="Send Payment"
              afterTitle={
                <a
                  href={PAYPAL_ME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:w-auto sm:justify-start"
                  style={{ backgroundColor: '#009cde' }}
                >
                  Open PayPal Payment Page
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              }
            >
              <p>
                Click the button above to open our PayPal page. Hit &apos;Pay&apos;, then paste your Order Total in the USD field and your Order ID in the Note field. The format should look like the image below. Copy both values using the buttons below. Make sure the amount is in USD.
              </p>

              <div className="mt-5 rounded-xl border border-sky-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Input Order Information</h3>
                <div className="mt-4 space-y-3">
                  <CopyValueBox
                    label="Order Total - Paste in this amount in the USD Field"
                    value={formattedTotal}
                  />
                  <CopyValueBox
                    label="Order ID - Paste in the note field"
                    value={orderIdDisplay}
                  />
                </div>
                <div className="mt-5 flex justify-center">
                  <div className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md sm:max-w-[320px]">
                    <Image
                      src={PAYPAL_SCREENSHOT_SRC}
                      alt="PayPal payment screen: enter USD amount and paste your Order ID in the note field"
                      width={640}
                      height={720}
                      className="h-auto w-full object-cover object-top"
                      sizes="(max-width: 640px) 100vw, 320px"
                      priority
                    />
                  </div>
                </div>
                <p className="mt-4 text-base font-medium text-amber-800 sm:text-lg">
                  Mistakes with this step may lead to delayed shipment or refunds.
                </p>
              </div>
            </PayPalStepCard>

            {/* Step 3 */}
            <PayPalStepCard stepNumber="03" title="Finish Transaction">
              <p>
                After clicking Next, you will be prompted to the transaction page. Pay by Bank Transfer by linking your bank to PayPal, or pay through card, by linking a credit/debit card. Copying your PayPal Transaction ID is optional, but it speeds up how quickly we can match your payment—then click Confirm Payment on the right.
              </p>
            </PayPalStepCard>
          </div>

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
                  country={country}
                />

                <Button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="mt-6 w-full text-base hover:opacity-90"
                  size="lg"
                  style={{ backgroundColor: NAVY }}
                >
                  Confirm Payment
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  After paying on PayPal, confirm here so we can match your payment to this order.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isConfirmModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4">
          <button
            type="button"
            className="fixed inset-0 bg-[#0f172a]/80"
            onClick={resetModal}
            aria-label="Close payment confirmation modal"
          />

          <div
            className="relative mx-auto my-6 w-full max-w-2xl rounded-2xl p-6 text-white shadow-2xl sm:my-10 sm:p-8"
            style={{ backgroundColor: NAVY }}
          >
            <button
              type="button"
              onClick={resetModal}
              className="absolute right-4 top-4 rounded-md p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex w-fit justify-center rounded-md bg-white/95 px-4 py-2">
              <Image
                src="/images/terrain-logo.png"
                alt="Terrain Peptides"
                width={603}
                height={278}
                className="h-12 w-auto"
              />
            </div>

            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Confirm Your Payment</h2>

            <div className="mt-6 space-y-2">
              <Label htmlFor="pp-transaction-id" className="text-sm font-medium text-white">
                PayPal Transaction ID <span className="font-normal text-white/70">(optional)</span>
              </Label>
              <Input
                id="pp-transaction-id"
                autoComplete="off"
                placeholder="Optional — paste if you have it"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="h-10 border-white/20 bg-white text-[#0f172a] placeholder:text-muted-foreground focus-visible:border-white/40 focus-visible:ring-white/25"
              />
              <p className="text-xs text-white/60">
                Optional: including this from your PayPal receipt or email helps us verify your payment faster.
              </p>
            </div>

            <div className="mt-6 space-y-2 rounded-xl border border-white/15 bg-white/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-base">
                <span>Order ID:</span>
                <code className="rounded bg-white/15 px-2 py-1 font-mono text-sm font-semibold text-white">
                  {orderIdDisplay}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(orderIdDisplay)
                    toast.success('Order ID copied')
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  title="Copy order ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <p className="text-base">
                Amount: <strong>${formattedTotalUsd} USD</strong>
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {([
                `I have sent exactly $${formattedTotalUsd} USD via PayPal`,
                `I included my Order ID (${orderIdDisplay}) in the PayPal note field`,
                'I understand that payment errors or delays may result in order delays or refunds',
              ] as const).map((label, index) => (
                <label key={label} className="flex cursor-pointer items-start gap-3 text-base leading-relaxed sm:text-lg">
                  <input
                    type="checkbox"
                    checked={checks[index]}
                    onChange={(e) => toggleCheck(index, e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-white/30 accent-[#0f172a]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="mx-auto mt-6 w-full max-w-md">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                style={{ backgroundColor: '#5865F2' }}
              >
                <DiscordGlyph className="h-5 w-5 shrink-0" />
                Need help? Join our Discord
                <ExternalLink className="h-4 w-4 opacity-90" />
              </a>
            </div>

            <Button
              type="button"
              disabled={!allChecked}
              onClick={handleSubmitConfirmation}
              className="mt-6 w-full border border-white/25 bg-[#020617] text-base text-white hover:bg-[#020617]/90 disabled:opacity-50 sm:text-lg"
              size="lg"
            >
              I&apos;ve Confirmed My Payment
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function CheckoutPayPalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayPalCheckoutContent />
    </Suspense>
  )
}
