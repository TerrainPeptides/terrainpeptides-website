'use client'

import { useState } from 'react'

type NewsletterSectionProps = {
  /** Transparent area + no top padding so the card overlaps the gradient seam (home bottom promo) */
  variant?: 'default' | 'overlap'
}

export function NewsletterSection({ variant = 'default' }: NewsletterSectionProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong.')
      } else {
        setStatus('success')
        setMessage(data.message ?? 'Subscribed!')
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const sectionClass =
    variant === 'overlap'
      ? 'bg-transparent pb-12 pt-0 sm:pb-16 lg:pb-20'
      : 'bg-white py-12 sm:py-16 lg:py-20'

  const innerMax =
    variant === 'overlap'
      ? 'w-full'
      : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

  return (
    <section className={sectionClass}>
      <div className={innerMax}>
        <div
          className={[
            'rounded-[26px] border border-violet-200/70',
            'bg-gradient-to-br from-[#ebe4f7] via-[#f4eef8] to-[#fdeee4]',
            variant === 'overlap'
              ? 'p-8 shadow-[0_-12px_48px_rgba(0,0,0,0.12),0_4px_24px_rgba(0,0,0,0.06)] sm:p-10 lg:p-12 lg:pl-14 lg:pr-12'
              : 'p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-10 lg:p-12 lg:pl-14 lg:pr-12',
          ].join(' ')}
        >
          {status === 'success' ? (
            <div className="rounded-2xl border border-emerald-200/80 bg-white/80 px-6 py-5 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-emerald-800">{message}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-16">
              <div className="max-w-xl shrink-0 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.65rem] lg:text-[1.75rem] xl:text-3xl">
                  Stay Updated with Terrain
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base">
                  Subscribe to our newsletter for exclusive deals, research updates, and industry news.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Join{' '}
                  <span className="font-bold text-neutral-900">500+</span> researchers. No spam,
                  unsubscribe anytime.
                </p>
              </div>

              <div className="w-full min-w-0 lg:max-w-[min(100%,28rem)] xl:max-w-[32rem] lg:flex-1 lg:flex lg:justify-end">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="flex w-full items-center gap-1 rounded-full border border-neutral-200/90 bg-white p-1.5 pl-4 shadow-sm sm:pl-5">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
                    >
                      {status === 'loading' ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                  {status === 'error' && (
                    <p className="mt-2 text-left text-xs text-red-600">{message}</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
