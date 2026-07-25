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
        className={`fixed inset-0 z-[200] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={dismiss}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-title"
        className={`fixed left-1/2 top-1/2 z-[201] w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          visible ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <button
          onClick={dismiss}
          className="absolute right-3.5 top-3.5 z-10 rounded-md p-1.5 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-2 pt-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-[#fafafa]">
              <Tag className="h-4 w-4 text-black" />
            </div>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-black/50">
              New account offer
            </span>
          </div>

          <h2
            id="promo-popup-title"
            className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-black"
          >
            Get {PROMO_PERCENT}% off
            <br />
            your first order
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/60">
            Create a free account to claim your discount — applied automatically at checkout.
          </p>
        </div>

        <div className="px-8 pb-8 pt-5">
          <div className="flex items-center justify-between rounded-lg border border-dashed border-black/20 bg-[#fafafa] px-4 py-3">
            <div>
              <p className="text-[0.6rem] font-medium uppercase tracking-widest text-black/45">
                Your code
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold tracking-widest text-black">
                {PROMO_CODE}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:border-black hover:bg-black hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
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
            className="mt-5 flex w-full items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4eb573]"
          >
            Claim my {PROMO_PERCENT}% discount →
          </button>

          <p className="mt-3 text-center text-xs text-black/45">
            Saved to your account after sign-up.{' '}
            <button
              onClick={dismiss}
              className="underline underline-offset-2 transition-colors hover:text-black"
            >
              No thanks
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
