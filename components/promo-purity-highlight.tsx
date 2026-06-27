'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Light-blue marker sweep on “purity, transparency, and reliability” — runs once in view. */
export function PromoPurityHighlight({
  className,
  children,
  ...props
}: React.ComponentProps<'span'>) {
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
      className={cn('promo-purity-marker', inView && 'promo-purity-marker--in-view', className)}
      {...props}
    >
      <span className="promo-purity-marker__text">{children}</span>
    </span>
  )
}
