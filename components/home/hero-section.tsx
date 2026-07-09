'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let w = 0
    let h = 0

    interface Particle {
      x: number
      y: number
      r: number
      speed: number
      opacity: number
      opacityDir: number
    }

    const particles: Particle[] = []

    function resize() {
      if (!canvas) return
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }

    function spawn(): Particle {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 60,
        r: Math.random() * 3 + 1.5,
        speed: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.4 + 0.2,
        opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
      }
    }

    function init() {
      resize()
      particles.length = 0
      const count = Math.floor((w * h) / 5000)
      for (let i = 0; i < count; i++) {
        const p = spawn()
        p.y = Math.random() * h
        particles.push(p)
      }
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y -= p.speed
        p.opacity += p.opacityDir
        if (p.opacity > 0.6) p.opacityDir = -Math.abs(p.opacityDir)
        if (p.opacity < 0.15) p.opacityDir = Math.abs(p.opacityDir)

        if (p.y + p.r < 0) {
          particles[i] = spawn()
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(26, 54, 184, ${p.opacity})`
        ctx.fill()
      }

      animFrame = requestAnimationFrame(draw)
    }

    init()
    draw()

    const ro = new ResizeObserver(() => {
      init()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animFrame)
      ro.disconnect()
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28 lg:py-36">
      {/* Animated particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Copy — left column */}
          <div className="text-left lg:-ml-6 xl:-ml-10">
            {/* Headline */}
            <h1 className="text-4xl font-semibold tracking-tight text-[#0A1628] sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem]">
              <span className="block leading-none whitespace-nowrap">High Quality and</span>
              <span className="mt-1 block leading-none whitespace-nowrap sm:mt-1.5">Affordable Peptides</span>
            </h1>

            {/* Sub-copy */}
            <p className="mt-7 max-w-md text-base leading-relaxed text-[#0A1628]/65 sm:text-lg">
              99%+ purity research compounds. Fast U.S. shipping.
            </p>

            {/* CTAs */}
            <div className="mt-10">
              <Link
                href="/shop"
                className="hero-shop-now-enter group relative inline-flex min-w-[280px] items-center justify-center overflow-hidden rounded-full bg-black px-14 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-neutral-800 hover:shadow-xl active:scale-[0.97] sm:min-w-[320px] sm:px-16"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-white/10 transition-transform duration-500 ease-out group-hover:scale-x-100" aria-hidden />
                <span className="relative z-10">SHOP NOW →</span>
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-14 flex max-w-xl flex-wrap items-stretch gap-3 border-t border-[#0A1628]/10 pt-10 sm:gap-4">
              {[
                { value: '99%+', label: 'Purity' },
                { value: '$250+', label: 'Free Shipping' },
                { value: 'Lab', label: 'Certified' },
                { value: 'US', label: 'USA' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-w-[5.5rem] flex-1 flex-col items-center justify-center rounded-lg border border-black bg-[#0A1628] px-4 py-3 text-center shadow-sm sm:min-w-[6.5rem] sm:px-5 sm:py-3.5"
                >
                  <span className="text-xl font-extrabold text-white">{stat.value}</span>
                  <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-white/75 sm:text-[0.7rem]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image placeholder — right column */}
          <div
            className="relative mx-auto flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl border-2 border-dashed border-[#0A1628]/15 bg-[#0A1628]/[0.03] lg:mx-0 lg:ml-auto lg:max-w-none lg:translate-x-6 xl:translate-x-10"
            aria-hidden
          >
            <p className="text-sm font-medium text-[#0A1628]/35">Image placeholder</p>
          </div>
        </div>
      </div>
    </section>
  )
}
