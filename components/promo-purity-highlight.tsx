'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Blue marker sweep on “purity, transparency, and reliability” — runs once when the band scrolls into view. */
export function PromoPurityHighlight({ className, ...props }: React.ComponentProps<'span'>) {
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting)
        if (hit) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <span
      ref={ref}
      className={cn(
        'hero-text-highlight-on-dark font-semibold text-white',
        inView && 'hero-text-highlight-on-dark--in-view',
        className
      )}
      {...props}
    />
  )
}
