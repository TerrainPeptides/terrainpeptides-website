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

const NAVY = '#0f172a'
/** Slightly lighter than card background (`#0f172a`) for secondary actions */
const WISE_TUTORIAL_BTN_BG = '#1e293b'

const SHIPPING_CENTS = 2500
const HST_RATE = 0.13
const NO_VIAL_LINE_COPY_SLUGS = new Set(['syringe-kit', 'capsule-stack'])

const WISE_RECIPIENT_EMAIL = 'terrainpayments@gmail.com'
const WISE_REGISTER_URL = 'https://wise.com/register#/email'
/** Replace with your YouTube tutorial URLs for each step */
const WISE_YOUTUBE_STEP1 = '#'
const WISE_YOUTUBE_STEP2 = '#'
const WISE_YOUTUBE_STEP3 = '#'
const DISCORD_INVITE_URL = '#'

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

function WiseStepCard({
  stepNumber,
  title,
  children,
  youtubeUrl,
}: {
  stepNumber: string
  title: string
  children: ReactNode
  youtubeUrl?: string
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-4 text-white shadow-sm sm:px-5 sm:py-4">
      <p className="text-3xl font-bold leading-none text-white/25 sm:text-4xl">{stepNumber}</p>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-white/90 sm:text-[0.9375rem]">
        {children}
      </div>
      {youtubeUrl ? (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: WISE_TUTORIAL_BTN_BG }}
        >
          Tutorial <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </section>
  )
}

function WiseCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isCartHydrated, items, subtotalCents, discountCents, referralCode } = useCart()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [checks, setChecks] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [confirmEmail, setConfirmEmail] = useState('')
  const [fallbackOrderId] = useState(
    () => `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  )

  const orderId = searchParams.get('order')?.trim() || fallbackOrderId
  const country = searchParams.get('country') || 'US'

  const afterDiscount = subtotalCents - discountCents
  const taxCents = country === 'CA' ? Math.round(afterDiscount * HST_RATE) : 0
  const totalCentsFromContext = afterDiscount + SHIPPING_CENTS + taxCents
  const totalFromQuery = Number.parseFloat(searchParams.get('total') || '')
  const totalUsd = Number.isFinite(totalFromQuery) ? totalFromQuery : totalCentsFromContext / 100
  const formattedTotalUsd = totalUsd.toFixed(2)
  const allChecked = checks.every(Boolean)
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmEmail.trim())

  const toggleCheck = (index: number, checked: boolean) => {
    setChecks((prev) => {
      const next = [...prev] as [boolean, boolean, boolean]
      next[index] = checked
      return next
    })
  }

  const resetModal = () => {
    setIsConfirmModalOpen(false)
    setChecks([false, false, false])
    setConfirmEmail('')
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
                Your cart is empty. Add items before continuing with Wise payment.
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

        {/* Mirror main checkout: left ~60% (3/5), right summary ~40% (2/5) */}
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-0 lg:col-span-3">
            <div className="space-y-3 sm:space-y-4">
              <WiseStepCard stepNumber="01" title="Create a Wise Account" youtubeUrl={WISE_YOUTUBE_STEP1}>
                <p>
                  If you don&apos;t already have a Wise account, create one for free. It only takes a few minutes.
                </p>
                <a
                  href={WISE_REGISTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 underline-offset-4 hover:underline"
                >
                  Create your Wise account (email signup){' '}
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
                </a>
              </WiseStepCard>

              <WiseStepCard stepNumber="02" title="Link Your Bank or Card" youtubeUrl={WISE_YOUTUBE_STEP2}>
                <p>
                  Inside Wise, link your bank account or credit card. Then send your payment to:
                </p>
                <div className="mt-3 rounded-lg border border-white/15 bg-white/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-white/75">Email:</p>
                      <p className="font-mono text-sm font-semibold text-white sm:text-base">{WISE_RECIPIENT_EMAIL}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(WISE_RECIPIENT_EMAIL)
                        toast.success('Wise recipient email copied')
                      }}
                      className="shrink-0 rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      title="Copy recipient email"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </WiseStepCard>

              <WiseStepCard stepNumber="03" title="Send Exact Amount &amp; Include Your Order ID" youtubeUrl={WISE_YOUTUBE_STEP3}>
                <p>
                  Send exactly <strong className="text-white">${formattedTotalUsd} USD</strong>. In the reference or note field on Wise, type
                  your Order ID exactly as shown:
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="inline-flex rounded-md bg-white/12 px-2.5 py-1.5 font-mono text-sm font-semibold text-white sm:text-base">
                    #{orderId}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `#${orderId}`
                      void navigator.clipboard.writeText(text)
                      toast.success('Order ID copied')
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                    title="Copy order ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
                <p className="mt-3 text-xs text-white/85 sm:text-sm">
                  This helps us match your payment to your order automatically.
                </p>
                <p className="mt-3 text-xs font-medium text-amber-200/95 sm:text-sm">
                  Mistakes with payment will lead to delays in processing and potential refunds.
                </p>
              </WiseStepCard>
            </div>
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
                  className={cn('mt-6 w-full text-base hover:opacity-90')}
                  size="lg"
                  style={{ backgroundColor: NAVY }}
                >
                  Confirm Payment
                </Button>
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
                src="/images/terrain-wordmark.png"
                alt="Terrain Peptides"
                width={180}
                height={48}
                className="h-8 w-auto"
              />
            </div>

            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Confirm Your Payment</h2>

            <div className="mt-6 space-y-2">
              <Label htmlFor="wise-confirm-email" className="text-sm font-medium text-white">
                Your Email Address
              </Label>
              <Input
                id="wise-confirm-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="h-10 border-white/20 bg-white text-[#0f172a] placeholder:text-muted-foreground focus-visible:border-white/40 focus-visible:ring-white/25"
              />
            </div>

            <div className="mt-6 space-y-2 rounded-xl border border-white/15 bg-white/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-base">
                <span>Order ID:</span>
                <code className="rounded bg-white/15 px-2 py-1 font-mono text-sm font-semibold text-white">
                  #{orderId}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(`#${orderId}`)
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
                `I have sent exactly $${formattedTotalUsd} USD via Wise`,
                `I included my Order ID (#${orderId}) in the Wise reference or note field`,
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
              disabled={!allChecked || !emailLooksValid}
              onClick={() => {
                toast.success('Payment confirmation submitted. Our team will review your Wise transfer.')
                resetModal()
              }}
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

export default function CheckoutWisePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WiseCheckoutContent />
    </Suspense>
  )
}
