'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Tag, Copy, Check } from 'lucide-react'
import { AGE_VERIFIED_EVENT, isAgeVerifiedInStorage } from '@/lib/age-verification'

const PROMO_CODE = 'WELCOME15'
const PROMO_PERCENT = 15
const PROMO_DELAY_AFTER_AGE_MS = 7000

export function PromoPopup() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('promo-popup-seen')) return

    function showPopup() {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    }

    function schedulePopup() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(showPopup, PROMO_DELAY_AFTER_AGE_MS)
    }

    if (isAgeVerifiedInStorage()) {
      schedulePopup()
    } else {
      function onAgeVerified() {
        schedulePopup()
      }
      window.addEventListener(AGE_VERIFIED_EVENT, onAgeVerified)
      return () => {
        window.removeEventListener(AGE_VERIFIED_EVENT, onAgeVerified)
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    sessionStorage.setItem('promo-popup-seen', '1')
    setTimeout(() => setMounted(false), 400)
  }

  function handleClaim() {
    dismiss()
    router.push(`/auth?claimPromo=${PROMO_CODE}`)
  }

  function copyCode() {
    navigator.clipboard.writeText(PROMO_CODE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!mounted) return null

  return (
    <>
      <div
        className={`fixed inset-0 z-[200] bg-navy/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={dismiss}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-title"
        className={`fixed left-1/2 top-1/2 z-[201] w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-white shadow-2xl transition-all duration-300 ${
          visible ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-white/10 bg-primary px-8 pb-8 pt-7 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10">
              <Tag className="h-4 w-4 text-white" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              New account offer
            </span>
          </div>

          <h2
            id="promo-popup-title"
            className="mt-4 text-2xl font-semibold leading-tight tracking-tight"
          >
            Get {PROMO_PERCENT}% Off
            <br />
            <span className="text-white/75">Your First Order</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            Create a free account to claim your discount — applied automatically at checkout.
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          <div className="flex items-center justify-between rounded-md border border-dashed border-primary/25 bg-section-subtle px-4 py-3">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Your Code
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold tracking-widest text-navy">
                {PROMO_CODE}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/30 hover:shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-clinical-teal" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleClaim}
            className="mt-5 flex w-full items-center justify-center rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Claim My {PROMO_PERCENT}% Discount →
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Saved to your account after sign-up.{' '}
            <button
              onClick={dismiss}
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              No thanks
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
