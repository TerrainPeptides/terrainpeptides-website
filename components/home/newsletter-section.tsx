'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type NewsletterSectionProps = {
  variant?: 'default' | 'overlap'
}

export function NewsletterSection({ variant = 'default' }: NewsletterSectionProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const highlightRef = useRef<HTMLSpanElement>(null)
  const [highlightInView, setHighlightInView] = useState(false)

  useEffect(() => {
    const el = highlightRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHighlightInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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
          className={cn(
            'rounded-lg border border-border bg-white',
            variant === 'overlap'
              ? 'p-8 shadow-lg sm:p-10 lg:p-12'
              : 'p-8 shadow-sm sm:p-10 lg:p-12',
          )}
        >
          {status === 'success' ? (
            <div className="rounded-md border border-clinical-teal/30 bg-clinical-teal/5 px-6 py-5 text-center">
              <p className="text-sm font-medium text-clinical-teal">{message}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-16">
              <div className="max-w-xl shrink-0 text-left">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                  Research updates
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-[1.65rem] lg:text-3xl">
                  Stay Informed
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  Subscribe for{' '}
                  <span
                    ref={highlightRef}
                    className={cn(
                      'newsletter-text-marker',
                      highlightInView && 'newsletter-text-marker--in-view'
                    )}
                  >
                    <span className="newsletter-text-marker__text">
                      batch releases, COA updates, and research news
                    </span>
                  </span>
                  .
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Join{' '}
                  <span className="font-semibold text-navy">500+</span> researchers. No spam,
                  unsubscribe anytime.
                </p>
              </div>

              <div className="w-full min-w-0 lg:max-w-[min(100%,28rem)] xl:max-w-[32rem] lg:flex-1 lg:flex lg:justify-end">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="flex w-full items-center gap-2 rounded-md border border-border bg-section-subtle p-1.5 pl-4 sm:pl-5">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
                    >
                      {status === 'loading' ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                  {status === 'error' && (
                    <p className="mt-2 text-left text-xs text-destructive">{message}</p>
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
