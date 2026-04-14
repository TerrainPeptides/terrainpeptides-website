'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, FlaskConical, CheckCircle2 } from 'lucide-react'

export function PromoPopup() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only show once per browser session
    if (typeof window !== 'undefined' && sessionStorage.getItem('promo-popup-seen')) return

    const timer = setTimeout(() => {
      setVisible(true)
      setMounted(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setVisible(false)
    sessionStorage.setItem('promo-popup-seen', '1')
    setTimeout(() => setMounted(false), 400)
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-title"
        className={`fixed left-1/2 top-1/2 z-[201] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Top accent band */}
        <div className="rounded-t-3xl bg-[#0A1628] px-8 pb-8 pt-8 text-white">
          <button
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">
              Terrain Peptides
            </span>
          </div>

          <h2 id="promo-popup-title" className="mt-5 text-2xl font-extrabold leading-tight tracking-tight">
            Research-Grade Peptides,
            <br />
            <span className="text-white/75">Shipped Fast From the U.S.</span>
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-white/60">
            99%+ purity, independently verified. Free shipping on orders over $250.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 pt-6">
          <ul className="space-y-2.5">
            {[
              '≥ 99% purity — HPLC & Mass Spec verified',
              'Certificate of Analysis with every order',
              'Cold-pack shipping & discreet packaging',
              'US warehouse — fast domestic delivery',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#0A1628]/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            onClick={dismiss}
            className="mt-7 flex w-full items-center justify-center rounded-full bg-[#0A1628] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#132744] hover:shadow-xl active:scale-[0.97]"
          >
            Shop Now →
          </Link>

          <button
            onClick={dismiss}
            className="mt-3 w-full text-center text-xs text-[#0A1628]/40 transition-colors hover:text-[#0A1628]/60"
          >
            No thanks, I&apos;ll browse later
          </button>
        </div>
      </div>
    </>
  )
}
