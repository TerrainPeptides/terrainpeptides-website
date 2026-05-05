'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-triggered reveal for product sections.
 *
 * Safari/WebKit can miss IntersectionObserver callbacks when `threshold` / negative
 * `rootMargin` interact with overflow/stacking; invisible content stayed at opacity-0.
 * This hook uses permissive observer settings, a sync viewport check, and a late
 * fallback so content always becomes visible.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let cancelled = false

    const markVisible = () => {
      if (cancelled) return
      setVisible(true)
    }

    const intersectsViewport = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return r.bottom > 0 && r.top < vh
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) markVisible()
        }
      },
      {
        threshold: [0, 0.02, 0.1],
        rootMargin: '0px',
      }
    )
    obs.observe(el)

    const sync = () => {
      if (intersectsViewport()) markVisible()
    }

    sync()
    const raf = requestAnimationFrame(sync)
    const raf2 = requestAnimationFrame(() => sync())

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(sync)
      ro.observe(el)
    }

    const fallbackTimer = window.setTimeout(markVisible, 4000)

    return () => {
      cancelled = true
      obs.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(raf2)
      ro?.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  return { ref, visible }
}
